import { mutation, query } from "./_generated/server";
import { getCurrentAdmin, requireAdmin } from "./authHelpers";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Returns the currently authenticated admin's profile.
 * Returns null if the user is not authenticated or not an admin.
 */
export const currentAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentAdmin(ctx);
  },
});

/**
 * Returns a boolean indicating if the current session is valid and authenticated.
 */
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    return authUserId !== null;
  },
});

/**
 * We don't implement a custom signOut mutation here because
 * @convex-dev/auth provides its own `signOut` function that the client should call.
 * 
 * However, to record logout history, the client should call this mutation
 * RIGHT BEFORE calling the Convex Auth `signOut()` function.
 */
export const logSignOutActivity = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await getCurrentAdmin(ctx);
    if (!admin) return;

    // Find the most recent login for this admin
    const recentLogin = await ctx.db
      .query("loginHistory")
      .withIndex("by_adminId", (q) => q.eq("adminId", admin._id))
      .order("desc")
      .first();

    if (recentLogin && !recentLogin.logoutTime) {
      await ctx.db.patch(recentLogin._id, { logoutTime: Date.now() });
    }
  },
});
