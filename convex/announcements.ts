import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { validateRequiredString, now } from "./validators";

/**
 * Announcement Queries & Mutations
 */

// ============================================================
// QUERIES
// ============================================================

/**
 * Get an announcement by its ID.
 */
export const getById = query({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all announcements ordered by createdAt descending.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("announcements")
      .order("desc")
      .collect();
  },
});

/**
 * List announcements created by a specific admin.
 */
export const listByAdmin = query({
  args: { createdBy: v.id("admins") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("announcements")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy))
      .collect();
  },
});

/**
 * List the most recent announcements up to the specified limit.
 */
export const listRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("announcements")
      .order("desc")
      .take(args.limit);
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new announcement.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateRequiredString(args.title, "Title");
    validateRequiredString(args.description, "Description");

    const admin = await ctx.db.get(args.createdBy);
    if (!admin) {
      throw new Error("Admin not found.");
    }

    const timestamp = now();

    const id = await ctx.db.insert("announcements", {
      title: args.title.trim(),
      description: args.description.trim(),
      imageStorageId: args.imageStorageId,
      createdBy: args.createdBy,
      createdAt: timestamp,
    });

    return id;
  },
});

/**
 * Update an existing announcement.
 */
export const update = mutation({
  args: {
    id: v.id("announcements"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Announcement not found.");
    }

    const patchData: {
      title?: string;
      description?: string;
      imageStorageId?: typeof args.imageStorageId;
    } = {};

    if (args.title !== undefined) {
      validateRequiredString(args.title, "Title");
      patchData.title = args.title.trim();
    }

    if (args.description !== undefined) {
      validateRequiredString(args.description, "Description");
      patchData.description = args.description.trim();
    }

    if (args.imageStorageId !== undefined) {
      patchData.imageStorageId = args.imageStorageId;
    }

    await ctx.db.patch(args.id, patchData);
    return args.id;
  },
});

/**
 * Remove an announcement by ID.
 */
export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Announcement not found.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
