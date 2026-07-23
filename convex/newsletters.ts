import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { validateRequiredString, validatePositiveNumber, now } from "./validators";

/**
 * Newsletter Queries & Mutations
 */

// ============================================================
// QUERIES
// ============================================================

/**
 * Get a newsletter by its ID.
 */
export const getById = query({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all newsletters ordered descending.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("newsletters")
      .order("desc")
      .collect();
  },
});

/**
 * List newsletters by status ("draft" | "scheduled" | "sent").
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sent")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("newsletters")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Get a newsletter by week number. Returns the first match or null.
 */
export const getByWeekNumber = query({
  args: { weekNumber: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("newsletters")
      .withIndex("by_weekNumber", (q) => q.eq("weekNumber", args.weekNumber))
      .first();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new newsletter with initial status "draft".
 */
export const create = mutation({
  args: {
    weekNumber: v.number(),
    title: v.string(),
    presidentMessage: v.string(),
    memberOfWeek: v.optional(v.id("members")),
    buildOfMonth: v.optional(v.string()),
    galleryImageStorageIds: v.optional(v.array(v.id("_storage"))),
    upcomingEvents: v.optional(v.array(v.id("events"))),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validatePositiveNumber(args.weekNumber, "Week number");
    validateRequiredString(args.title, "Title");
    validateRequiredString(args.presidentMessage, "President message");

    // Check week number uniqueness
    const existing = await ctx.db
      .query("newsletters")
      .withIndex("by_weekNumber", (q) => q.eq("weekNumber", args.weekNumber))
      .first();

    if (existing) {
      throw new Error(`Newsletter for week number ${args.weekNumber} already exists.`);
    }

    const id = await ctx.db.insert("newsletters", {
      weekNumber: args.weekNumber,
      title: args.title.trim(),
      presidentMessage: args.presidentMessage.trim(),
      memberOfWeek: args.memberOfWeek,
      buildOfMonth: args.buildOfMonth,
      galleryImageStorageIds: args.galleryImageStorageIds,
      upcomingEvents: args.upcomingEvents,
      status: "draft",
      scheduledDate: args.scheduledDate,
    });

    return id;
  },
});

/**
 * Update an existing newsletter.
 */
export const update = mutation({
  args: {
    id: v.id("newsletters"),
    weekNumber: v.optional(v.number()),
    title: v.optional(v.string()),
    presidentMessage: v.optional(v.string()),
    memberOfWeek: v.optional(v.id("members")),
    buildOfMonth: v.optional(v.string()),
    galleryImageStorageIds: v.optional(v.array(v.id("_storage"))),
    upcomingEvents: v.optional(v.array(v.id("events"))),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Newsletter not found.");
    }

    const patchData: {
      weekNumber?: number;
      title?: string;
      presidentMessage?: string;
      memberOfWeek?: typeof args.memberOfWeek;
      buildOfMonth?: typeof args.buildOfMonth;
      galleryImageStorageIds?: typeof args.galleryImageStorageIds;
      upcomingEvents?: typeof args.upcomingEvents;
      scheduledDate?: typeof args.scheduledDate;
    } = {};

    if (args.weekNumber !== undefined && args.weekNumber !== existing.weekNumber) {
      validatePositiveNumber(args.weekNumber, "Week number");
      const conflict = await ctx.db
        .query("newsletters")
        .withIndex("by_weekNumber", (q) => q.eq("weekNumber", args.weekNumber!))
        .first();

      if (conflict && conflict._id !== args.id) {
        throw new Error(`Newsletter for week number ${args.weekNumber} already exists.`);
      }
      patchData.weekNumber = args.weekNumber;
    }

    if (args.title !== undefined) {
      validateRequiredString(args.title, "Title");
      patchData.title = args.title.trim();
    }

    if (args.presidentMessage !== undefined) {
      validateRequiredString(args.presidentMessage, "President message");
      patchData.presidentMessage = args.presidentMessage.trim();
    }

    if (args.memberOfWeek !== undefined) {
      patchData.memberOfWeek = args.memberOfWeek;
    }

    if (args.buildOfMonth !== undefined) {
      patchData.buildOfMonth = args.buildOfMonth;
    }

    if (args.galleryImageStorageIds !== undefined) {
      patchData.galleryImageStorageIds = args.galleryImageStorageIds;
    }

    if (args.upcomingEvents !== undefined) {
      patchData.upcomingEvents = args.upcomingEvents;
    }

    if (args.scheduledDate !== undefined) {
      patchData.scheduledDate = args.scheduledDate;
    }

    await ctx.db.patch(args.id, patchData);
    return args.id;
  },
});

/**
 * Schedule a newsletter (must be currently in "draft" status).
 */
export const schedule = mutation({
  args: {
    id: v.id("newsletters"),
    scheduledDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Newsletter not found.");
    }

    if (existing.status !== "draft") {
      throw new Error(`Cannot schedule newsletter with status "${existing.status}". Must be "draft".`);
    }

    validatePositiveNumber(args.scheduledDate, "Scheduled date");

    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledDate: args.scheduledDate,
    });

    return args.id;
  },
});

/**
 * Mark a scheduled newsletter as sent (must be currently in "scheduled" status).
 */
export const markSent = mutation({
  args: {
    id: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Newsletter not found.");
    }

    if (existing.status !== "scheduled") {
      throw new Error(`Cannot mark newsletter as sent with status "${existing.status}". Must be "scheduled".`);
    }

    const timestamp = now();

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: timestamp,
    });

    return args.id;
  },
});

/**
 * Remove a newsletter by ID.
 */
export const remove = mutation({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Newsletter not found.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
