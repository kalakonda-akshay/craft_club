import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireActiveAdmin, requireSuperAdmin } from "./authHelpers";

/**
 * List login history for the currently authenticated admin.
 */
export const listMyHistory = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireActiveAdmin(ctx);
    
    return await ctx.db
      .query("loginHistory")
      .withIndex("by_adminId", (q) => q.eq("adminId", admin._id))
      .order("desc")
      .take(50);
  },
});

/**
 * Super admin only: List login history for a specific admin.
 */
export const listByAdmin = query({
  args: { adminId: v.id("admins") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    
    return await ctx.db
      .query("loginHistory")
      .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
      .order("desc")
      .take(100);
  },
});

/**
 * Internal mutation: Record a successful login attempt.
 * Called by the frontend or an action after a successful sign in.
 */
export const recordLogin = internalMutation({
  args: {
    adminId: v.id("admins"),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const loginId = await ctx.db.insert("loginHistory", {
      adminId: args.adminId,
      loginTime: Date.now(),
      success: true,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });

    // Update lastLogin on the admin record
    await ctx.db.patch(args.adminId, {
      lastLogin: Date.now(),
    });

    return loginId;
  },
});

/**
 * Internal mutation: Record a failed login attempt.
 */
export const recordFailedLogin = internalMutation({
  args: {
    adminId: v.id("admins"),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("loginHistory", {
      adminId: args.adminId,
      loginTime: Date.now(),
      success: false,
      failedAttempts: 1, // You could potentially aggregate this over time
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });
  },
});

/**
 * Internal mutation: Record logout time for a specific login session.
 */
export const recordLogout = internalMutation({
  args: {
    historyId: v.id("loginHistory"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.historyId, {
      logoutTime: Date.now(),
    });
  },
});

/**
 * Super admin only: List all login history globally.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    
    return await ctx.db
      .query("loginHistory")
      .order("desc")
      .take(100);
  },
});
