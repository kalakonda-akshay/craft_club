import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Login for members using their Roll Number and Member ID.
 * Returns the member object if successful.
 */
export const login = mutation({
  args: {
    rollNumber: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .first();

    if (!member) {
      throw new Error("Invalid Roll Number or Member ID.");
    }

    if (member.memberId !== args.memberId) {
      throw new Error("Invalid Roll Number or Member ID.");
    }

    if (member.status !== "active") {
      throw new Error(`Your account is currently ${member.status}.`);
    }

    return member;
  },
});
