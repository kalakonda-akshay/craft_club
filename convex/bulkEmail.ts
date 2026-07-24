import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { sendEmail } from "./emailService";
import { internal } from "./_generated/api";
import { compileTemplate } from "./templateEngine";

/**
 * Send a test email to the currently logged in admin to verify template formatting.
 */
export const sendTestEmail = mutation({
  args: {
    templateId: v.id("emailTemplates"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found.");
    }

    const settings = await ctx.db.query("settings").first();
    const fromName = settings?.clubName || "Club Management System";
    const fromEmail = settings?.clubEmail || "noreply@club.com";

    const dummyData = {
      memberName: admin.name,
      clubName: fromName,
      footer: settings?.emailFooter || "",
    };

    const subject = `[TEST] ${compileTemplate(template.subject, dummyData)}`;
    const html = compileTemplate(template.htmlContent, dummyData);

    await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
      to: admin.email,
      subject,
      html,
      fromName,
      fromEmail,
    });

    console.info("Activity: Test Email Sent", { adminId: admin._id, templateId: args.templateId });
    return true;
  },
});

/**
 * Send a bulk email to members.
 * Requires Super Admin privileges.
 */
export const sendBulkEmail = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    audience: v.union(
      v.literal("all"),
      v.literal("department"),
      v.literal("year"),
      v.literal("selected")
    ),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    memberIds: v.optional(v.array(v.id("members"))),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin.role !== "super_admin") {
      throw new Error("Only Super Admins can send bulk emails.");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found.");
    }

    // Determine Recipients
    let members = [];
    if (args.audience === "all") {
      members = await ctx.db
        .query("members")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
    } else if (args.audience === "department") {
      if (!args.department) throw new Error("Department must be specified");
      members = (await ctx.db.query("members").collect())
        .filter(m => m.status === "active" && m.department === args.department);
    } else if (args.audience === "year") {
      if (!args.year) throw new Error("Year must be specified");
      members = (await ctx.db.query("members").collect())
        .filter(m => m.status === "active" && m.year === args.year);
    } else if (args.audience === "selected") {
      if (!args.memberIds || args.memberIds.length === 0) throw new Error("Member IDs must be specified");
      for (const id of args.memberIds) {
        const m = await ctx.db.get(id);
        if (m && m.status === "active") members.push(m);
      }
    }

    const recipientEmails = members.map(m => m.personalEmail);
    
    if (recipientEmails.length === 0) {
      throw new Error("No active recipients found for the selected criteria.");
    }

    const settings = await ctx.db.query("settings").first();
    const fromName = settings?.clubName || "Club Management System";
    const fromEmail = settings?.clubEmail || "noreply@club.com";

    const dummyData = {
      clubName: fromName,
      footer: settings?.emailFooter || "",
    };

    const subject = compileTemplate(template.subject, dummyData);
    const html = compileTemplate(template.htmlContent, dummyData);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
        to: chunk,
        subject,
        html,
        fromName,
        fromEmail,
      });
    }

    console.info("Activity: Bulk Email Dispatched", { 
      adminId: admin._id, 
      templateId: args.templateId, 
      audience: args.audience, 
      recipientCount: recipientEmails.length 
    });

    return { success: true, count: recipientEmails.length };
  },
});

/**
 * Send Event Reminder to all members, or to a specific list of emails.
 */
export const sendEventReminder = mutation({
  args: {
    specificEmails: v.optional(v.array(v.string())),
    eventTitle: v.string(),
    date: v.string(),
    venue: v.string(),
    reportingTime: v.string(),
    sessionTime: v.string(),
  },
  handler: async (ctx, args) => {
    // Temporary bypass for testing
    // const admin = await requireAdmin(ctx);
    const template = await ctx.db
      .query("emailTemplates")
      .filter((q) => q.eq(q.field("title"), "Event Reminder"))
      .first();

    if (!template) {
      throw new Error("Event Reminder template not found in database.");
    }

    const settings = await ctx.db.query("settings").first();
    const fromName = settings?.clubName || "CRAFT Club";
    const fromEmail = "onboarding@resend.dev"; // Resend testing domain

    let recipientEmails: string[] = [];
    
    if (args.specificEmails && args.specificEmails.length > 0) {
      recipientEmails = args.specificEmails;
    } else {
      const members = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      recipientEmails = members
        .map((m) => m.personalEmail || m.collegeEmail || m.email)
        .filter((e): e is string => !!e);
    }

    if (recipientEmails.length === 0) {
      throw new Error("No recipients found.");
    }

    // Compile with generic data for bulk send
    const data = {
      name: "CRAFT Member",
      eventTitle: args.eventTitle,
      date: args.date,
      venue: args.venue,
      reportingTime: args.reportingTime,
      sessionTime: args.sessionTime,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CRAFT-EVENT", // Generic QR for bulk
    };

    const subject = compileTemplate(template.subject, data);
    const html = compileTemplate(template.htmlContent, data);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
        to: chunk,
        subject,
        html,
        fromName,
        fromEmail,
      });
    }

    return { success: true, count: recipientEmails.length };
  },
});
