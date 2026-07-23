import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import {
  generateMemberId,
  now,
  validateEmail,
  validatePhone,
  validateRequiredString,
} from "./validators";

// ============================================================
// QUERIES
// ============================================================

/**
 * Get a member by Convex document ID.
 */
export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a member by roll number using the by_rollNumber index.
 */
export const getByRollNumber = query({
  args: { rollNumber: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .unique();
  },
});

/**
 * Get a member by college email using the by_collegeEmail index.
 */
export const getByCollegeEmail = query({
  args: { collegeEmail: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_collegeEmail", (q) => q.eq("collegeEmail", args.collegeEmail))
      .unique();
  },
});

/**
 * Get a member by phone number using the by_phone index.
 */
export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
  },
});

/**
 * Get a member by custom memberId using the by_memberId index.
 */
export const getByMemberId = query({
  args: { memberId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .unique();
  },
});

/**
 * List all members.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("members").collect();
  },
});

/**
 * List members by department using the by_department index.
 */
export const listByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

/**
 * List members by status using the by_status index.
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("alumni")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * List members by year using the by_year index.
 */
export const listByYear = query({
  args: {
    year: v.union(
      v.literal("1"),
      v.literal("2"),
      v.literal("3"),
      v.literal("4")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("members")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .collect();
  },
});

/**
 * Search members by name (case-insensitive substring match).
 * Collects all members and filters in memory.
 */
export const searchByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const allMembers = await ctx.db.query("members").collect();
    const searchTerm = args.name.toLowerCase().trim();
    if (!searchTerm) {
      return allMembers;
    }
    return allMembers.filter((member) =>
      member.name.toLowerCase().includes(searchTerm)
    );
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new member.
 * Validates uniqueness for rollNumber, collegeEmail, and phone.
 * Auto-generates memberId, sets status to "active", and sets timestamps.
 */
export const create = mutation({
  args: {
    name: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.union(
      v.literal("1"),
      v.literal("2"),
      v.literal("3"),
      v.literal("4")
    ),
    section: v.string(),
    collegeEmail: v.string(),
    personalEmail: v.optional(v.string()),
    phone: v.string(),
    gender: v.union(
      v.literal("Male"),
      v.literal("Female"),
      v.literal("Other")
    ),
    bloodGroup: v.optional(
      v.union(
        v.literal("A+"),
        v.literal("A-"),
        v.literal("B+"),
        v.literal("B-"),
        v.literal("AB+"),
        v.literal("AB-"),
        v.literal("O+"),
        v.literal("O-")
      )
    ),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
    skills: v.optional(v.array(v.string())),
    linkedin: v.optional(v.string()),
    github: v.optional(v.string()),
    portfolio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    // 1. Format and string validation
    validateRequiredString(args.name, "Name");
    validateRequiredString(args.rollNumber, "Roll Number");
    validateRequiredString(args.department, "Department");
    validateRequiredString(args.section, "Section");
    validateRequiredString(args.collegeEmail, "College Email");
    validateRequiredString(args.phone, "Phone");

    validateEmail(args.collegeEmail, "College Email");
    if (args.personalEmail) {
      validateEmail(args.personalEmail, "Personal Email");
    }
    validatePhone(args.phone, "Phone");

    // 2. Uniqueness validation via indexes
    const existingRoll = await ctx.db
      .query("members")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .first();
    if (existingRoll) {
      throw new Error(`Member with roll number "${args.rollNumber}" already exists.`);
    }

    const existingCollegeEmail = await ctx.db
      .query("members")
      .withIndex("by_collegeEmail", (q) => q.eq("collegeEmail", args.collegeEmail))
      .first();
    if (existingCollegeEmail) {
      throw new Error(`Member with college email "${args.collegeEmail}" already exists.`);
    }

    const existingPhone = await ctx.db
      .query("members")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    if (existingPhone) {
      throw new Error(`Member with phone number "${args.phone}" already exists.`);
    }

    // 3. System fields generation
    const memberId = generateMemberId();
    const currentTime = now();

    return await ctx.db.insert("members", {
      ...args,
      memberId,
      status: "active",
      joinedDate: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
    });
  },
});

/**
 * Update an existing member.
 * Checks uniqueness if rollNumber, collegeEmail, or phone are changed.
 * Updates updatedAt timestamp.
 */
export const update = mutation({
  args: {
    id: v.id("members"),
    name: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    year: v.optional(
      v.union(
        v.literal("1"),
        v.literal("2"),
        v.literal("3"),
        v.literal("4")
      )
    ),
    section: v.optional(v.string()),
    collegeEmail: v.optional(v.string()),
    personalEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(
      v.union(
        v.literal("Male"),
        v.literal("Female"),
        v.literal("Other")
      )
    ),
    bloodGroup: v.optional(
      v.union(
        v.literal("A+"),
        v.literal("A-"),
        v.literal("B+"),
        v.literal("B-"),
        v.literal("AB+"),
        v.literal("AB-"),
        v.literal("O+"),
        v.literal("O-")
      )
    ),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
    skills: v.optional(v.array(v.string())),
    linkedin: v.optional(v.string()),
    github: v.optional(v.string()),
    portfolio: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("alumni")
      )
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const { id, ...updates } = args;

    const existingMember = await ctx.db.get(id);
    if (!existingMember) {
      throw new Error(`Member with ID "${id}" not found.`);
    }

    if (updates.name !== undefined) {
      validateRequiredString(updates.name, "Name");
    }

    if (updates.department !== undefined) {
      validateRequiredString(updates.department, "Department");
    }

    if (updates.section !== undefined) {
      validateRequiredString(updates.section, "Section");
    }

    if (updates.rollNumber !== undefined) {
      validateRequiredString(updates.rollNumber, "Roll Number");
      if (updates.rollNumber !== existingMember.rollNumber) {
        const rollConflict = await ctx.db
          .query("members")
          .withIndex("by_rollNumber", (q) =>
            q.eq("rollNumber", updates.rollNumber!)
          )
          .first();
        if (rollConflict && rollConflict._id !== id) {
          throw new Error(
            `Member with roll number "${updates.rollNumber}" already exists.`
          );
        }
      }
    }

    if (updates.collegeEmail !== undefined) {
      validateRequiredString(updates.collegeEmail, "College Email");
      validateEmail(updates.collegeEmail, "College Email");
      if (updates.collegeEmail !== existingMember.collegeEmail) {
        const emailConflict = await ctx.db
          .query("members")
          .withIndex("by_collegeEmail", (q) =>
            q.eq("collegeEmail", updates.collegeEmail!)
          )
          .first();
        if (emailConflict && emailConflict._id !== id) {
          throw new Error(
            `Member with college email "${updates.collegeEmail}" already exists.`
          );
        }
      }
    }

    if (updates.personalEmail !== undefined && updates.personalEmail !== "") {
      validateEmail(updates.personalEmail, "Personal Email");
    }

    if (updates.phone !== undefined) {
      validateRequiredString(updates.phone, "Phone");
      validatePhone(updates.phone, "Phone");
      if (updates.phone !== existingMember.phone) {
        const phoneConflict = await ctx.db
          .query("members")
          .withIndex("by_phone", (q) => q.eq("phone", updates.phone!))
          .first();
        if (phoneConflict && phoneConflict._id !== id) {
          throw new Error(
            `Member with phone number "${updates.phone}" already exists.`
          );
        }
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now(),
    });

    console.info("Activity: Member Updated", { adminId: admin._id, memberId: id });
  },
});

/**
 * Remove a member by ID.
 * Verifies that the member exists before deleting.
 */
export const remove = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existingMember = await ctx.db.get(args.id);
    if (!existingMember) {
      throw new Error(`Member with ID "${args.id}" not found.`);
    }
    await ctx.db.delete(args.id);
    console.info("Activity: Member Deleted", { adminId: admin._id, memberId: args.id });
  },
});

/**
 * Update the status of a member.
 * Updates updatedAt timestamp.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("members"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("alumni")
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existingMember = await ctx.db.get(args.id);
    if (!existingMember) {
      throw new Error(`Member with ID "${args.id}" not found.`);
    }
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: now(),
    });
    console.info(`Activity: Member Status Updated (${args.status})`, { adminId: admin._id, memberId: args.id });
  },
});

// ============================================================
// BULK OPERATIONS
// ============================================================

export const bulkDelete = mutation({
  args: { ids: v.array(v.id("members")) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    console.info("Activity: Bulk Members Deleted", { adminId: admin._id, count: args.ids.length });
  },
});

export const bulkActivate = mutation({
  args: { ids: v.array(v.id("members")) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const timestamp = now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: "active", updatedAt: timestamp });
    }
    console.info("Activity: Bulk Members Activated", { adminId: admin._id, count: args.ids.length });
  },
});

export const bulkDeactivate = mutation({
  args: { ids: v.array(v.id("members")) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const timestamp = now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: "inactive", updatedAt: timestamp });
    }
    console.info("Activity: Bulk Members Deactivated", { adminId: admin._id, count: args.ids.length });
  },
});

// ============================================================
// UNIFIED SEARCH AND PAGINATION
// ============================================================

export const search = query({
  args: {
    searchTerm: v.optional(v.string()), // matches name, memberId, rollNumber, collegeEmail, personalEmail, phone
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    section: v.optional(v.string()),
    status: v.optional(v.string()),
    joinedAfter: v.optional(v.number()),
    joinedBefore: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("name_asc"),
      v.literal("name_desc"),
      v.literal("department"),
      v.literal("rollNumber")
    )),
    page: v.number(), // 1-indexed
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let allMembers = await ctx.db.query("members").collect();

    // 1. Filtering
    if (args.department) {
      allMembers = allMembers.filter(m => m.department === args.department);
    }
    if (args.year) {
      allMembers = allMembers.filter(m => m.year === args.year);
    }
    if (args.section) {
      allMembers = allMembers.filter(m => m.section === args.section);
    }
    if (args.status) {
      allMembers = allMembers.filter(m => m.status === args.status);
    }
    if (args.joinedAfter) {
      allMembers = allMembers.filter(m => m.joinedDate >= args.joinedAfter!);
    }
    if (args.joinedBefore) {
      allMembers = allMembers.filter(m => m.joinedDate <= args.joinedBefore!);
    }
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase().trim();
      allMembers = allMembers.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.memberId.toLowerCase().includes(term) ||
        m.rollNumber.toLowerCase().includes(term) ||
        m.collegeEmail.toLowerCase().includes(term) ||
        (m.personalEmail && m.personalEmail.toLowerCase().includes(term)) ||
        m.phone.includes(term)
      );
    }

    // 2. Sorting
    const sortBy = args.sortBy || "newest";
    allMembers.sort((a, b) => {
      switch (sortBy) {
        case "newest": return b.joinedDate - a.joinedDate;
        case "oldest": return a.joinedDate - b.joinedDate;
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "department": return a.department.localeCompare(b.department);
        case "rollNumber": return a.rollNumber.localeCompare(b.rollNumber);
        default: return b.joinedDate - a.joinedDate;
      }
    });

    // 3. Pagination
    const totalMembers = allMembers.length;
    const totalPages = Math.ceil(totalMembers / args.limit);
    const page = Math.max(1, Math.min(args.page, totalPages || 1));
    const startIndex = (page - 1) * args.limit;
    const endIndex = startIndex + args.limit;
    
    const paginatedMembers = allMembers.slice(startIndex, endIndex);

    return {
      members: paginatedMembers,
      currentPage: page,
      totalPages: totalPages,
      totalMembers: totalMembers,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  },
});
