"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const GAS_URL = "https://script.google.com/macros/s/AKfycbyJOHgKLxbAWfF7saTsQVADWXY-4HnfJhvIy1XmvMm-A7_4W-jjxku59hwPyEX2S2OQ/exec";
const MAX_RETRIES = 3;

/**
 * Internal action to send an email using Google Apps Script.
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
    // No API key needed for Apps Script deployed as "Anyone"
    const currentRetry = args.retryCount || 0;
    const recipientList = Array.isArray(args.to) ? args.to : [args.to];
    const toStr = recipientList.join(","); // Apps script expects comma-separated

    try {
      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromName: args.fromName,
          to: toStr,
          subject: args.subject,
          html: args.html
        }),
      });

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || `Apps Script error`);
      }

      console.info("Activity: Email Sent Successfully", {
        to: recipientList,
        subject: args.subject,
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
