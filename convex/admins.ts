import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  validateEmail,
  validatePhone,
  validateRequiredString,
  now,
} from "./validators";
import { requireSuperAdmin } from "./authHelpers";

// ============================================================
// QUERIES
// ============================================================

/**
 * Get an admin by their ID.
 * Returns the admin document or null if not found.
 */
export const getById = query({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const admin = await ctx.db.get(args.id);
    return admin;
  },
});

/**
 * Get an admin by their email address using the "by_email" index.
 * Returns the admin document or null if not found.
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return admin;
  },
});

/**
 * List all admin accounts.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.query("admins").collect();
  },
});

/**
 * List admin accounts filtered by role using the "by_role" index.
 */
export const listByRole = query({
  args: {
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("pr_coordinator")
    ),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    return await ctx.db
      .query("admins")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new admin user.
 * Validates email uniqueness, email format, phone format, and required string fields.
 * Sets createdAt and updatedAt to current timestamp, and isActive to true.
 * Returns the new admin ID.
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.optional(v.string()), // Convex auth handles the real password
    phone: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("pr_coordinator")
    ),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const caller = await requireSuperAdmin(ctx);

    // Required string validation
    validateRequiredString(args.name, "Name");
    validateRequiredString(args.email, "Email");
    validateRequiredString(args.phone, "Phone");

    // Format validation
    validateEmail(args.email);
    validatePhone(args.phone);

    // Email uniqueness check
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existingAdmin !== null) {
      throw new Error(`Admin with email "${args.email}" already exists.`);
    }

    const timestamp = now();
    const adminId = await ctx.db.insert("admins", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash ?? "MANAGED_BY_CONVEX_AUTH",
      phone: args.phone,
      role: args.role,
      profilePhotoStorageId: args.profilePhotoStorageId,
      collegeIdFrontStorageId: args.collegeIdFrontStorageId,
      collegeIdBackStorageId: args.collegeIdBackStorageId,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    console.info("Activity: Admin Created", { adminId: caller._id, createdAdminId: adminId });
    return adminId;
  },
});

/**
 * Update an existing admin's fields.
 * Validates existence, email uniqueness if changed, and formatting for email/phone if provided.
 * Always updates the updatedAt timestamp.
 */
export const update = mutation({
  args: {
    id: v.id("admins"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("pr_coordinator")
      )
    ),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const caller = await requireSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Admin with ID "${args.id}" not found.`);
    }

    const updates: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      phone: string;
      role: "super_admin" | "admin" | "pr_coordinator";
      profilePhotoStorageId?: typeof args.profilePhotoStorageId;
      collegeIdFrontStorageId?: typeof args.collegeIdFrontStorageId;
      collegeIdBackStorageId?: typeof args.collegeIdBackStorageId;
      updatedAt: number;
    }> = {
      updatedAt: now(),
    };

    if (args.name !== undefined) {
      validateRequiredString(args.name, "Name");
      updates.name = args.name;
    }

    if (args.passwordHash !== undefined) {
      validateRequiredString(args.passwordHash, "Password hash");
      updates.passwordHash = args.passwordHash;
    }

    if (args.phone !== undefined) {
      validateRequiredString(args.phone, "Phone");
      validatePhone(args.phone);
      updates.phone = args.phone;
    }

    if (args.email !== undefined) {
      validateRequiredString(args.email, "Email");
      validateEmail(args.email);

      if (args.email !== existing.email) {
        const adminWithEmail = await ctx.db
          .query("admins")
          .withIndex("by_email", (q) => q.eq("email", args.email!))
          .unique();
        if (adminWithEmail !== null) {
          throw new Error(`Admin with email "${args.email}" already exists.`);
        }
      }
      updates.email = args.email;
    }

    if (args.role !== undefined) {
      updates.role = args.role;
    }

    if (args.profilePhotoStorageId !== undefined) {
      updates.profilePhotoStorageId = args.profilePhotoStorageId;
    }

    if (args.collegeIdFrontStorageId !== undefined) {
      updates.collegeIdFrontStorageId = args.collegeIdFrontStorageId;
    }

    if (args.collegeIdBackStorageId !== undefined) {
      updates.collegeIdBackStorageId = args.collegeIdBackStorageId;
    }

    await ctx.db.patch(args.id, updates);
    console.info("Activity: Admin Updated", { adminId: caller._id, targetAdminId: args.id });
  },
});

/**
 * Remove an admin user after verifying existence.
 */
export const remove = mutation({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    const caller = await requireSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Admin with ID "${args.id}" not found.`);
    }

    await ctx.db.delete(args.id);
    console.info("Activity: Admin Deleted", { adminId: caller._id, deletedAdminId: args.id });
  },
});

/**
 * Update the lastLogin timestamp for an admin.
 */
export const updateLastLogin = mutation({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx); // Assuming only super admins or system can update this
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Admin with ID "${args.id}" not found.`);
    }

    const timestamp = now();
    await ctx.db.patch(args.id, {
      lastLogin: timestamp,
      updatedAt: timestamp,
    });
  },
});

/**
 * Toggle the isActive status of an admin account.
 */
export const toggleActive = mutation({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    const caller = await requireSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Admin with ID "${args.id}" not found.`);
    }

    const timestamp = now();
    await ctx.db.patch(args.id, {
      isActive: !existing.isActive,
      updatedAt: timestamp,
    });
    console.info(`Activity: Admin ${existing.isActive ? "Disabled" : "Enabled"}`, { adminId: caller._id, targetAdminId: args.id });
  },
});

// ============================================================
// ADMIN SEARCH AND CHANGE ROLE
// ============================================================

export const changeRole = mutation({
  args: {
    id: v.id("admins"),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("pr_coordinator")),
  },
  handler: async (ctx, args) => {
    const caller = await requireSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Admin with ID "${args.id}" not found.`);
    }

    await ctx.db.patch(args.id, {
      role: args.role,
      updatedAt: now(),
    });
    console.info(`Activity: Admin Role Changed to ${args.role}`, { adminId: caller._id, targetAdminId: args.id });
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()), // matches name, email, phone
    role: v.optional(v.union(v.literal("super_admin"), v.literal("admin"), v.literal("pr_coordinator"))),
    isActive: v.optional(v.boolean()),
    page: v.number(), // 1-indexed
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    let allAdmins = await ctx.db.query("admins").collect();

    // 1. Filtering
    if (args.role) {
      allAdmins = allAdmins.filter(a => a.role === args.role);
    }
    if (args.isActive !== undefined) {
      allAdmins = allAdmins.filter(a => a.isActive === args.isActive);
    }
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase().trim();
      allAdmins = allAdmins.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.phone.includes(term)
      );
    }

    // 2. Sorting by created newest first
    allAdmins.sort((a, b) => b.createdAt - a.createdAt);

    // 3. Pagination
    const totalAdmins = allAdmins.length;
    const totalPages = Math.ceil(totalAdmins / args.limit);
    const page = Math.max(1, Math.min(args.page, totalPages || 1));
    const startIndex = (page - 1) * args.limit;
    const endIndex = startIndex + args.limit;
    
    const paginatedAdmins = allAdmins.slice(startIndex, endIndex);

    return {
      admins: paginatedAdmins,
      currentPage: page,
      totalPages: totalPages,
      totalAdmins: totalAdmins,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  },
});

/**
 * Authenticate an admin using username (name) and password.
 * Returns the admin's role and details on success.
 */
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("name"), args.username))
      .first();

    if (!admin) {
      throw new Error("Invalid username or password");
    }

    if (admin.passwordHash !== args.password) {
      throw new Error("Invalid username or password");
    }

    if (!admin.isActive) {
      throw new Error("This account is deactivated.");
    }

    // Update lastLogin
    await ctx.db.patch(admin._id, { lastLogin: Date.now() });

    return {
      _id: admin._id,
      name: admin.name,
      role: admin.role,
    };
  },
});
