import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { Id } from "./_generated/dataModel";
import {
  validateRequiredString,
  validateDateString,
  validateTimeString,
  validatePositiveNumber,
  now,
} from "./validators";

/**
 * Get an event by its ID.
 */
export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all events ordered by creation time (newest first).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

/**
 * List events on a specific date using the by_eventDate index.
 */
export const listByDate = query({
  args: { eventDate: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateDateString(args.eventDate, "eventDate");
    return await ctx.db
      .query("events")
      .withIndex("by_eventDate", (q) => q.eq("eventDate", args.eventDate))
      .collect();
  },
});

/**
 * List upcoming events (eventDate >= today).
 */
export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = new Date().toISOString().split("T")[0];
    const events = await ctx.db.query("events").collect();
    return events.filter((e) => e.eventDate >= today);
  },
});

/**
 * List events created by a specific admin using the by_createdBy index.
 */
export const listByCreator = query({
  args: { createdBy: v.id("admins") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("events")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy))
      .collect();
  },
});

/**
 * Create a new event after validating required fields and formats.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    venue: v.string(),
    eventDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    posterStorageId: v.optional(v.id("_storage")),
    registrationRequired: v.boolean(),
    maxParticipants: v.optional(v.number()),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateRequiredString(args.title, "title");
    validateRequiredString(args.description, "description");
    validateRequiredString(args.venue, "venue");
    validateDateString(args.eventDate, "eventDate");
    validateTimeString(args.startTime, "startTime");
    validateTimeString(args.endTime, "endTime");

    if (args.maxParticipants !== undefined) {
      validatePositiveNumber(args.maxParticipants, "maxParticipants");
    }

    const admin = await ctx.db.get(args.createdBy);
    if (!admin) {
      throw new Error(`Admin not found with id: ${args.createdBy}`);
    }

    const timestamp = now();
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      venue: args.venue,
      eventDate: args.eventDate,
      startTime: args.startTime,
      endTime: args.endTime,
      posterStorageId: args.posterStorageId,
      registrationRequired: args.registrationRequired,
      maxParticipants: args.maxParticipants,
      createdBy: args.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return eventId;
  },
});

/**
 * Update an existing event.
 */
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    venue: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    posterStorageId: v.optional(v.id("_storage")),
    registrationRequired: v.optional(v.boolean()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Event not found with id: ${args.id}`);
    }

    if (args.title !== undefined) {
      validateRequiredString(args.title, "title");
    }
    if (args.description !== undefined) {
      validateRequiredString(args.description, "description");
    }
    if (args.venue !== undefined) {
      validateRequiredString(args.venue, "venue");
    }
    if (args.eventDate !== undefined) {
      validateDateString(args.eventDate, "eventDate");
    }
    if (args.startTime !== undefined) {
      validateTimeString(args.startTime, "startTime");
    }
    if (args.endTime !== undefined) {
      validateTimeString(args.endTime, "endTime");
    }
    if (args.maxParticipants !== undefined) {
      validatePositiveNumber(args.maxParticipants, "maxParticipants");
    }

    const updates: Partial<{
      title: string;
      description: string;
      venue: string;
      eventDate: string;
      startTime: string;
      endTime: string;
      posterStorageId?: Id<"_storage">;
      registrationRequired: boolean;
      maxParticipants?: number;
      updatedAt: number;
    }> = {
      updatedAt: now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.venue !== undefined) updates.venue = args.venue;
    if (args.eventDate !== undefined) updates.eventDate = args.eventDate;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.posterStorageId !== undefined)
      updates.posterStorageId = args.posterStorageId;
    if (args.registrationRequired !== undefined)
      updates.registrationRequired = args.registrationRequired;
    if (args.maxParticipants !== undefined)
      updates.maxParticipants = args.maxParticipants;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Delete an event by ID.
 */
export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Event not found with id: ${args.id}`);
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
