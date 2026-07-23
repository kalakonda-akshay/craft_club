"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_RETRIES = 3;

/**
 * Internal action to send an email using the Resend API.
 * Uses native fetch. Supports automatic retries.
 */
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
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Activity: Email Send Failed - Missing RESEND_API_KEY environment variable.");
      throw new Error("Missing RESEND_API_KEY");
    }

    const currentRetry = args.retryCount || 0;
    const recipientList = Array.isArray(args.to) ? args.to : [args.to];
    
    // Resend requires a specific format for 'from': "Name <email@domain.com>"
    const fromString = `${args.fromName} <${args.fromEmail}>`;

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromString,
          to: recipientList,
          subject: args.subject,
          html: args.html,
          reply_to: args.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Resend API error: ${response.status}`);
      }

      console.info("Activity: Email Sent Successfully", {
        to: recipientList,
        subject: args.subject,
        resendId: data.id,
        retryCount: currentRetry,
      });

      return data;
    } catch (error: any) {
      console.error("Activity: Email Send Failed", {
        to: recipientList,
        subject: args.subject,
        error: error.message,
        retryCount: currentRetry,
      });

      if (currentRetry < MAX_RETRIES) {
        console.info(`Activity: Scheduling Email Retry ${currentRetry + 1}/${MAX_RETRIES}`);
        
        // Exponential backoff: retry after 1min, 5mins, 15mins roughly, or just fixed intervals.
        // For simplicity, let's delay by (currentRetry + 1) * 60 seconds
        const delayMs = (currentRetry + 1) * 60 * 1000;
        
        await ctx.scheduler.runAfter(delayMs, internal.emailService.sendEmail, {
          ...args,
          retryCount: currentRetry + 1,
        });
      } else {
        console.error("Activity: Email Max Retries Reached. Giving up.", {
          to: recipientList,
          subject: args.subject,
        });
      }
    }
  },
});
