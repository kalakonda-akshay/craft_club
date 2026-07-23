import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const appCtx = ctx as unknown as MutationCtx;
      const email = args.profile.email as string | undefined;
      if (!email) {
        throw new Error("Email is required.");
      }

      // Check if there are any admins in the system
      const anyAdmin = await appCtx.db.query("admins").first();

      let admin = await appCtx.db
        .query("admins")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (!anyAdmin) {
        // FIRST ADMIN SETUP
        // If the database is completely empty, allow the first user to sign up and become Super Admin
        if (!admin) {
          const newAdminId = await appCtx.db.insert("admins", {
            name: "Super Admin",
            email: email,
            passwordHash: "MANAGED_BY_CONVEX_AUTH",
            phone: "0000000000",
            role: "super_admin",
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          admin = await appCtx.db.get(newAdminId);
        }
      } else {
        // Normal flow: Ensure the admin exists and is active before allowing auth account creation
        if (!admin) {
          throw new Error("Unauthorized: Only pre-approved admins can create an account.");
        }
        if (!admin.isActive) {
          throw new Error("Unauthorized: Admin account is inactive.");
        }
      }

      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Proceed with normal user creation in auth tables
      return await appCtx.db.insert("users", {
        email,
      });
    },
  },
});
