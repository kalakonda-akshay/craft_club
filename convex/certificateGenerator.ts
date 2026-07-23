"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as QRCode from "qrcode";

export const generateAndSendCertificate = internalAction({
  args: {
    memberId: v.id("members"),
    eventId: v.id("events"),
    templateId: v.id("certificateTemplates"),
    certificateType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch required data via internal query
    const data = await ctx.runQuery(internal.certificateHelpers.getGenerationData, args);
    if (!data.member || !data.event || !data.template) {
      console.error("Activity: Certificate Gen Failed - Missing Data", args);
      return;
    }

    const { member, event, template, settings, backgroundUrl } = data;

    // 2. Generate unique identifiers
    const certNumber = await ctx.runQuery(internal.certificateHelpers.generateUniqueNumber);
    const verifyCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const issueDate = new Date().toISOString().split("T")[0];

    // 3. Generate QR Code Base64
    const verifyUrl = `${settings?.website || "https://club.com"}/verify?code=${verifyCode}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 150 });
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // 4. Create PDF Document
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // If there's a background template, load it. Otherwise create a blank page.
    let page;
    if (backgroundUrl) {
      const templateRes = await fetch(backgroundUrl);
      const templateBytes = await templateRes.arrayBuffer();
      const loadedDoc = await PDFDocument.load(templateBytes);
      const [copiedPage] = await pdfDoc.copyPages(loadedDoc, [0]);
      pdfDoc.addPage(copiedPage);
      page = copiedPage;
    } else {
      page = pdfDoc.addPage([842, 595]); // A4 Landscape
    }

    const { width, height } = page.getSize();

    // 5. Draw Content (Hardcoded positions for generic fallback, can be configured in a real system)
    // Draw Certificate Type
    page.drawText(args.certificateType.toUpperCase(), {
      x: width / 2 - 100,
      y: height - 150,
      size: 30,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.4),
    });

    // Draw Name
    page.drawText(member.name, {
      x: width / 2 - 150,
      y: height - 250,
      size: 40,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Draw Event Title
    page.drawText(`For outstanding participation in ${event.title}`, {
      x: 100,
      y: height - 320,
      size: 20,
      font: timesRomanFont,
    });

    // Draw Details
    page.drawText(`Roll Number: ${member.rollNumber}   |   Department: ${member.department}`, {
      x: 100,
      y: height - 360,
      size: 16,
      font: timesRomanFont,
    });

    // Embed QR Code
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: width - 200,
      y: 50,
      width: 100,
      height: 100,
    });

    // Draw Certificate Meta
    page.drawText(`Cert #: ${certNumber}`, { x: 50, y: 70, size: 10, font: timesRomanFont });
    page.drawText(`Issued: ${issueDate}`, { x: 50, y: 55, size: 10, font: timesRomanFont });

    // 6. Save PDF
    const pdfBytes = await pdfDoc.save();

    // 7. Upload to Convex Storage
    const uploadUrl = await ctx.runMutation(internal.certificateHelpers.generateUploadUrl);
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: pdfBytes,
    });
    const { storageId } = await uploadRes.json();
    const pdfUrl = await ctx.runQuery(internal.certificateHelpers.getStorageUrl, { storageId });

    // 8. Create DB Record
    const certId = await ctx.runMutation(internal.certificateHelpers.createCertificateRecord, {
      certificateNumber: certNumber,
      verificationCode: verifyCode,
      certificateType: args.certificateType,
      templateId: args.templateId,
      memberId: args.memberId,
      eventId: args.eventId,
      pdfStorageId: storageId,
    });

    console.info("Activity: Certificate Generated", { certId, certNumber });

    // 9. Dispatch Email
    const fromName = settings?.clubName || "Club Management System";
    const fromEmail = settings?.clubEmail || "noreply@club.com";
    const subject = `Your Certificate for ${event.title}`;
    const html = `<p>Dear ${member.name},</p><p>Congratulations! Your ${args.certificateType} certificate for <strong>${event.title}</strong> is ready.</p><p>You can download it securely here: <a href="${pdfUrl}">Download Certificate</a></p><p>Certificate Number: ${certNumber}</p>`;

    await ctx.runAction(internal.emailService.sendEmail, {
      to: member.collegeEmail,
      subject,
      html,
      fromName,
      fromEmail,
    });

    // Mark email as sent
    await ctx.runMutation(internal.certificateHelpers.markEmailSent, { id: certId });
  },
});
