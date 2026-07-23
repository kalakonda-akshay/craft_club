import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { validateRequiredString, now } from "./validators";
import { compileTemplate } from "./templateEngine";

/**
 * Email Template Queries & Mutations
 */

// ============================================================
// QUERIES
// ============================================================

/**
 * Get an email template by its ID.
 */
export const getById = query({
  args: { id: v.id("emailTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all email templates ordered by createdAt descending.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("emailTemplates")
      .order("desc")
      .collect();
  },
});

/**
 * List email templates created by a specific admin.
 */
export const listByAdmin = query({
  args: { createdBy: v.id("admins") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("emailTemplates")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy))
      .collect();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new email template.
 */
export const create = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateRequiredString(args.title, "Title");
    validateRequiredString(args.subject, "Subject");
    validateRequiredString(args.htmlContent, "HTML content");

    const admin = await ctx.db.get(args.createdBy);
    if (!admin) {
      throw new Error("Admin not found.");
    }

    const timestamp = now();

    const id = await ctx.db.insert("emailTemplates", {
      title: args.title.trim(),
      subject: args.subject.trim(),
      htmlContent: args.htmlContent,
      createdBy: args.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return id;
  },
});

/**
 * Update an existing email template.
 */
export const update = mutation({
  args: {
    id: v.id("emailTemplates"),
    title: v.optional(v.string()),
    subject: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Email template not found.");
    }

    const timestamp = now();
    const patchData: {
      title?: string;
      subject?: string;
      htmlContent?: string;
      updatedAt: number;
    } = {
      updatedAt: timestamp,
    };

    if (args.title !== undefined) {
      validateRequiredString(args.title, "Title");
      patchData.title = args.title.trim();
    }

    if (args.subject !== undefined) {
      validateRequiredString(args.subject, "Subject");
      patchData.subject = args.subject.trim();
    }

    if (args.htmlContent !== undefined) {
      validateRequiredString(args.htmlContent, "HTML content");
      patchData.htmlContent = args.htmlContent;
    }

    await ctx.db.patch(args.id, patchData);
    return args.id;
  },
});

/**
 * Remove an email template by ID.
 */
export const remove = mutation({
  args: { id: v.id("emailTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Email template not found.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Duplicate an existing email template with " (Copy)" appended to title and new timestamps.
 */
export const duplicate = mutation({
  args: {
    id: v.id("emailTemplates"),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Email template not found.");
    }

    const admin = await ctx.db.get(args.createdBy);
    if (!admin) {
      throw new Error("Admin not found.");
    }

    const timestamp = now();

    const newId = await ctx.db.insert("emailTemplates", {
      title: `${existing.title} (Copy)`,
      subject: existing.subject,
      htmlContent: existing.htmlContent,
      createdBy: args.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return newId;
  },
});

/**
 * Preview an email template with dummy data.
 */
export const preview = query({
  args: {
    id: v.id("emailTemplates"),
    dummyData: v.record(v.string(), v.union(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Email template not found.");
    }

    const compiledSubject = compileTemplate(template.subject, args.dummyData);
    const compiledHtml = compileTemplate(template.htmlContent, args.dummyData);

    return {
      subject: compiledSubject,
      htmlContent: compiledHtml,
    };
  },
});
