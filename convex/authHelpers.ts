import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { Errors } from "./errors";

type Ctx = QueryCtx | MutationCtx;

/**
 * Gets the current authenticated admin.
 * Returns null if not authenticated, or if the user is not found in the admins table.
 */
export async function getCurrentAdmin(ctx: Ctx): Promise<Doc<"admins"> | null> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) {
    return null;
  }

  // Auth users table has the email (populated by our profile callback)
  const authUser = await ctx.db.get(authUserId);
  if (!authUser || !authUser.email) {
    return null;
  }

  // Find the admin in our admins table
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_email", (q) => q.eq("email", authUser.email as string))
    .first();

  return admin;
}

/**
 * Ensures the user is authenticated and is a valid admin.
 * Throws if not authenticated or not found.
 */
export async function requireAdmin(ctx: Ctx): Promise<Doc<"admins">> {
  const admin = await getCurrentAdmin(ctx);
  if (!admin) {
    throw Errors.Unauthorized();
  }
  return admin;
}

/**
 * Ensures the admin is authenticated and their account is active.
 * Throws if inactive or unauthenticated.
 */
export async function requireActiveAdmin(ctx: Ctx): Promise<Doc<"admins">> {
  const admin = await requireAdmin(ctx);
  if (!admin.isActive) {
    throw Errors.Forbidden("Your admin account is inactive.");
  }
  return admin;
}

/**
 * Ensures the admin is authenticated and has the 'super_admin' role.
 * Throws otherwise.
 */
export async function requireSuperAdmin(ctx: Ctx): Promise<Doc<"admins">> {
  const admin = await requireActiveAdmin(ctx);
  if (admin.role !== "super_admin") {
    throw Errors.Forbidden("Super admin privileges required.");
  }
  return admin;
}

/**
 * Ensures the admin is authenticated and has one of the allowed roles.
 * Throws otherwise.
 */
export async function requireRole(
  ctx: Ctx,
  allowedRoles: Array<"super_admin" | "admin" | "moderator">
): Promise<Doc<"admins">> {
  const admin = await requireActiveAdmin(ctx);
  if (!allowedRoles.includes(admin.role)) {
    throw Errors.Forbidden("You do not have the required role.");
  }
  return admin;
}
