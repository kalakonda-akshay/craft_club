import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public API to verify a certificate by its unique code.
 * Used when a QR code is scanned.
 */
export const verifyCertificate = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_verificationCode", (q) => q.eq("verificationCode", args.code))
      .first();

    if (!certificate) {
      return { status: "invalid", message: "Certificate not found." };
    }

    const member = await ctx.db.get(certificate.memberId);
    const event = await ctx.db.get(certificate.eventId);

    if (!member || !event) {
      return { status: "invalid", message: "Invalid certificate data." };
    }

    return {
      status: "valid",
      data: {
        certificateNumber: certificate.certificateNumber,
        memberName: member.name,
        rollNumber: member.rollNumber,
        department: member.department,
        certificateType: certificate.certificateType,
        eventName: event.title,
        issueDate: new Date(certificate.issuedAt).toISOString().split("T")[0],
        pdfUrl: certificate.pdfStorageId ? await ctx.storage.getUrl(certificate.pdfStorageId) : null,
      },
    };
  },
});
