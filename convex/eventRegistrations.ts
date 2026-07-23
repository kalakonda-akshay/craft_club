import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { now } from "./validators";

// ============================================================
// QUERIES
// ============================================================

/**
 * Get an event registration by its unique ID.
 */
export const getById = query({
  args: { id: v.id("eventRegistrations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all registrations for a specific event using the by_eventId index.
 */
export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

/**
 * List all registrations for a specific member using the by_memberId index.
 */
export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("eventRegistrations")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

/**
 * Get registration for a specific event and member using the compound index.
 */
export const getByEventAndMember = query({
  args: {
    eventId: v.id("events"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_memberId", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", args.memberId)
      )
      .first();
  },
});

/**
 * Count total registrations for a specific event.
 */
export const countByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    return registrations.length;
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Register a member for an event.
 * Verifies event & member existence, prevents duplicate registration,
 * and checks maximum participant limits.
 */
export const register = mutation({
  args: {
    eventId: v.id("events"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // 1. Verify event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // 2. Verify member exists
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // 3. Check for duplicate registration using compound index
    const existing = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_memberId", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", args.memberId)
      )
      .first();

    if (existing) {
      throw new Error("Member is already registered for this event");
    }

    // 4. Check max participants if specified on the event
    if (event.maxParticipants !== undefined && event.maxParticipants !== null) {
      const currentRegistrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      if (currentRegistrations.length >= event.maxParticipants) {
        throw new Error("Event has reached maximum participant capacity");
      }
    }

    // 5. Insert registration
    return await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      memberId: args.memberId,
      registeredAt: now(),
      attendanceStatus: "registered",
    });
  },
});

/**
 * Mark attendance status for a registration.
 * Sets attendanceTime if marked as 'attended'.
 */
export const markAttendance = mutation({
  args: {
    id: v.id("eventRegistrations"),
    attendanceStatus: v.union(v.literal("attended"), v.literal("absent")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const registration = await ctx.db.get(args.id);
    if (!registration) {
      throw new Error("Event registration record not found");
    }

    const updates: {
      attendanceStatus: "attended" | "absent";
      attendanceTime?: number;
    } = {
      attendanceStatus: args.attendanceStatus,
    };

    if (args.attendanceStatus === "attended") {
      updates.attendanceTime = now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Cancel an event registration by deleting the record.
 */
export const cancel = mutation({
  args: { id: v.id("eventRegistrations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const registration = await ctx.db.get(args.id);
    if (!registration) {
      throw new Error("Event registration record not found");
    }

    await ctx.db.delete(args.id);
  },
});
