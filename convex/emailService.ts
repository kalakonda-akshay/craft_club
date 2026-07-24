"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

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
    // Make sure RESEND_API_KEY is set in Convex dashboard
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      throw new Error("RESEND_API_KEY is missing in Convex environment variables.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const toArray = Array.isArray(args.to) ? args.to : [args.to];
    
    try {
      const { data, error } = await resend.emails.send({
        // For testing, Resend requires you use onboarding@resend.dev unless you verify a custom domain
        from: `${args.fromName} <onboarding@resend.dev>`,
        to: toArray,
        subject: args.subject,
        html: args.html,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.info("Activity: Email Sent Successfully via Resend", { data });
      return { success: true, data };
    } catch (err: any) {
      console.error("Email send failed:", err);
      throw new Error(err.message || "Failed to send email via Resend");
    }
  },
});
