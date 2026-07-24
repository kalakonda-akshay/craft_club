"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendEmail = internalAction({
  args: {
    to: v.union(v.string(), v.array(v.string())),
    subject: v.string(),
    html: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    replyTo: v.optional(v.string()),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Make sure GMAIL_APP_PASSWORD and GMAIL_USER are set in Convex dashboard
    const gmailUser = process.env.GMAIL_USER || "akshaykalakonda9@gmail.com";
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailPass) {
      console.warn("GMAIL_APP_PASSWORD is not set. Email not sent.");
      throw new Error("GMAIL_APP_PASSWORD is missing in Convex environment variables. Please generate an App Password in your Google Account and add it to Convex.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
    
    const toArray = Array.isArray(args.to) ? args.to : [args.to];
    
    try {
      const info = await transporter.sendMail({
        from: `"${args.fromName}" <${gmailUser}>`, // Gmail always overrides this to the authenticated user, but we can set the display name
        to: toArray.join(', '),
        subject: args.subject,
        html: args.html,
      });

      console.info("Activity: Email Sent Successfully via Gmail", { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("Email send failed:", err);
      throw new Error(err.message || "Failed to send email via Gmail");
    }
  },
});
