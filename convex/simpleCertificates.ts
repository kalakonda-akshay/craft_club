import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendCertificate = mutation({
  args: {
    eventName: v.string(),
    eventDate: v.string(),
    memberId: v.id("members"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const settings = await ctx.db.query("settings").first();
    const fromName = settings?.clubName || "CRAFT Club";
    const fromEmail = settings?.clubEmail || "noreply@craftclub.org";

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const email = member.personalEmail || member.collegeEmail;
    if (!email) throw new Error("Member has no email");

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image URL not found");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; }
    .btn { display: inline-block; background: #04162e; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .header { color: #c89637; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
    img.preview { max-width: 100%; border: 1px solid #ddd; margin-top: 20px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">&lt;/&gt; CRAFT</div>
    <h2>Congratulations, ${member.name}! 🎉</h2>
    <p>Thank you for attending <strong>${args.eventName}</strong>.</p>
    <p>We've generated your official Certificate of Completion. You can download and save your secure digital certificate image below.</p>
    
    <a href="${imageUrl}" class="btn">Download My Certificate</a>
    
    <br/>
    <a href="${imageUrl}"><img src="${imageUrl}" alt="Certificate Preview" class="preview" /></a>

    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      Keep building,<br>
      The CRAFT Core Team
    </p>
  </div>
</body>
</html>`;

    await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
      to: email,
      subject: `Your Certificate: ${args.eventName}`,
      html,
      fromName,
      fromEmail,
    });

    return { success: true };
  },
});
