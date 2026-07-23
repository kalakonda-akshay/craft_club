import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mark a member's attendance for an event via QR scan.
 * The QR code contains the public `memberId` (e.g., CRAFT-2026-0001).
 */
export const markCheckIn = mutation({
  args: {
    eventId: v.id("events"),
    memberId: v.string(), // Public Member ID string from QR code
  },
  handler: async (ctx, args) => {
    // 1. Look up the member by public memberId
    const member = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .first();

    if (!member) {
      throw new Error(`Invalid QR Code: Member ID '${args.memberId}' not found.`);
    }

    // 2. Check if they are registered for the event
    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_memberId", (q) => 
        q.eq("eventId", args.eventId).eq("memberId", member._id)
      )
      .first();

    if (registration) {
      // If already registered, just update attendance to "attended"
      if (registration.attendanceStatus === "attended") {
        return { success: true, message: "Already checked in!", memberName: member.name };
      }
      
      await ctx.db.patch(registration._id, {
        attendanceStatus: "attended",
      });
      
      // Log official attendance record if it doesn't exist
      const existingAtt = await ctx.db
        .query("attendance")
        .withIndex("by_eventId_memberId", (q) => q.eq("eventId", args.eventId).eq("memberId", member._id))
        .first();
      
      if (!existingAtt) {
        await ctx.db.insert("attendance", {
          eventId: args.eventId,
          memberId: member._id,
          status: "present",
          checkInTime: Date.now(),
        });
      }
      
      return { success: true, message: "Check-in successful!", memberName: member.name };
    } else {
      // If not registered, create a walk-in registration and mark attended
      await ctx.db.insert("eventRegistrations", {
        eventId: args.eventId,
        memberId: member._id,
        registeredAt: Date.now(),
        attendanceStatus: "attended",
      });
      
      // Log official attendance record
      const existingAtt = await ctx.db
        .query("attendance")
        .withIndex("by_eventId_memberId", (q) => q.eq("eventId", args.eventId).eq("memberId", member._id))
        .first();

      if (!existingAtt) {
        await ctx.db.insert("attendance", {
          eventId: args.eventId,
          memberId: member._id,
          status: "present",
          checkInTime: Date.now(),
        });
      }
      
      return { success: true, message: "Walk-in check-in successful!", memberName: member.name };
    }
  },
});
