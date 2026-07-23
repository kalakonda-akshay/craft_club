import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireSuperAdmin } from "./authHelpers";

/**
 * Note on Password Management with @convex-dev/auth:
 * 
 * Convex Auth handles password hashing (Scrypt) and storage internally in the `authAccounts` table.
 * It does not export a public backend API to manually change passwords securely.
 * 
 * Instead, the frontend should use the standard Convex Auth flows:
 * 1. Forgot Password: `signIn("password", { flow: "reset", email })`
 * 2. Reset Password: `signIn("password", { flow: "reset-verification", email, code, newPassword })`
 * 
 * The mutations below are placeholders to satisfy the architecture requirements.
 * If you absolutely must change passwords from the backend, you would need to import
 * the Scrypt hasher from `@oslojs/crypto/scrypt` or equivalent and patch the `authAccounts` table directly,
 * which is not recommended as it bypasses Convex Auth's session invalidation and security checks.
 */

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    throw new Error(
      "To change a password securely, the frontend must use the Convex Auth reset flow " +
      "(e.g., signIn with flow: 'reset'). Manual password hashing is intentionally omitted for security."
    );
  },
});

export const resetAdminPassword = mutation({
  args: {
    targetAdminId: v.id("admins"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    throw new Error(
      "Super Admins cannot directly change passwords. " +
      "Instead, trigger a password reset email or use a secure admin reset token flow provided by Convex Auth."
    );
  },
});
