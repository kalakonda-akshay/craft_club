import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { validateEmail, validatePhone, validateRequiredString, now, generateMemberId } from "./validators";
import { sendJoinRequestReceived, sendWelcomeEmail, sendJoinRequestRejected, sendJoinRequestApproved } from "./emailHelpers";

// ============================================================
// QUERIES
// ============================================================

/**
 * Fetch a join request by its unique document ID.
 */
export const getById = query({
  args: {
    id: v.id("joinRequests"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List all join requests ordered by creation time (newest first).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // await requireAdmin(ctx); // Disabled for Vanilla JS demo
    return await ctx.db.query("joinRequests").order("desc").collect();
  },
});

/**
 * List join requests filtered by status ("Pending", "Approved", or "Rejected") using the by_status index.
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("joinRequests")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

/**
 * Fetch join requests for a specific roll number using the by_rollNumber index.
 */
export const getByRollNumber = query({
  args: {
    rollNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("joinRequests")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .collect();
  },
});

/**
 * Fetch join requests for a specific college email using the by_collegeEmail index.
 */
export const getByCollegeEmail = query({
  args: {
    collegeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("joinRequests")
      .withIndex("by_collegeEmail", (q) =>
        q.eq("collegeEmail", args.collegeEmail)
      )
      .collect();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Submit a new join request.
 * Performs format and required field validation on inputs.
 * Ensures no active "Pending" join request exists for the roll number before creation.
 */
export const submit = mutation({
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
    reasonToJoin: v.string(),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
    resumeStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Validate required string fields
    validateRequiredString(args.name, "Name");
    validateRequiredString(args.rollNumber, "Roll Number");
    validateRequiredString(args.department, "Department");
    validateRequiredString(args.section, "Section");
    validateRequiredString(args.collegeEmail, "College Email");
    validateRequiredString(args.phone, "Phone");
    validateRequiredString(args.reasonToJoin, "Reason to Join");

    // Validate email addresses
    validateEmail(args.collegeEmail, "College Email");
    if (args.personalEmail) {
      validateEmail(args.personalEmail, "Personal Email");
    }

    // Validate phone number format
    validatePhone(args.phone, "Phone");

    // Check if a Pending request already exists for this roll number
    const existingPending = await ctx.db
      .query("joinRequests")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .filter((q) => q.eq(q.field("status"), "Pending"))
      .first();

    if (existingPending) {
      // Instead of throwing an error which causes popups on cached clients, just silently return success!
      return existingPending._id;
    }

    const requestId = await ctx.db.insert("joinRequests", {
      ...args,
      status: "Pending",
      submittedAt: now(),
    });

    console.info("Activity: Join Request Submitted", { adminId: "public_submission", requestId });
    
    // Trigger Email
    await sendJoinRequestReceived(ctx, args.personalEmail || args.collegeEmail, {
      name: args.name,
      rollNumber: args.rollNumber,
    });
    
    return requestId;
  },
});

/**
 * Approve a pending join request.
 * Verifies request existence and that status is currently "Pending".
 * Updates status to "Approved" and records reviewedAt and reviewedBy.
 */
export const approve = mutation({
  args: {
    id: v.id("joinRequests"),
  },
  handler: async (ctx, args) => {
    // const caller = await requireAdmin(ctx); // Disabled for Vanilla JS demo
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Join request not found.");
    }

    if (request.status !== "Pending") {
      throw new Error(
        `Cannot approve join request. Current status is "${request.status}", expected "Pending".`
      );
    }

    // 1. Deduplication Check (Roll Number, College Email, Phone)
    const existingRoll = await ctx.db
      .query("members")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", request.rollNumber))
      .first();
    if (existingRoll) throw new Error("Member with this roll number already exists.");

    const existingCollegeEmail = await ctx.db
      .query("members")
      .withIndex("by_collegeEmail", (q) => q.eq("collegeEmail", request.collegeEmail))
      .first();
    if (existingCollegeEmail) throw new Error("Member with this college email already exists.");

    if (request.phone && request.phone !== "0000000000") {
      const existingPhone = await ctx.db
        .query("members")
        .withIndex("by_phone", (q) => q.eq("phone", request.phone))
        .first();
      if (existingPhone) throw new Error("Member with this phone number already exists.");
    }

    // 2. Generate Member ID and default required fields missing from JoinRequest
    const memberId = generateMemberId();
    const timestamp = now();

    // 3. Create Member
    const newMemberId = await ctx.db.insert("members", {
      memberId,
      name: request.name,
      rollNumber: request.rollNumber,
      department: request.department,
      year: request.year,
      section: request.section,
      collegeEmail: request.collegeEmail,
      personalEmail: request.personalEmail,
      phone: request.phone,
      gender: "Other", // Defaulted since it's not in JoinRequest schema
      skills: request.skills,
      profilePhotoStorageId: request.profilePhotoStorageId,
      collegeIdFrontStorageId: request.collegeIdFrontStorageId,
      collegeIdBackStorageId: request.collegeIdBackStorageId,
      status: "active",
      joinedDate: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 4. Update Request Status
    await ctx.db.patch(args.id, {
      status: "Approved",
      reviewedAt: timestamp,
    });

    console.info("Activity: Join Request Approved", { 
      requestId: args.id,
      createdMemberId: newMemberId 
    });

    // 5. Send Approval Email with QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(memberId)}`;
    await sendJoinRequestApproved(ctx, request.personalEmail || request.collegeEmail, {
      name: request.name,
      memberId: memberId,
      qrCodeUrl: qrCodeUrl,
    });

    return newMemberId;
  },
});

export const waitlist = mutation({
  args: {
    id: v.id("joinRequests"),
  },
  handler: async (ctx, args) => {
    // const caller = await requireAdmin(ctx); // Disabled for Vanilla JS demo
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Join request not found.");

    await ctx.db.patch(args.id, {
      status: "Pending",
      reviewedAt: now(),
    });
    
    // Optional: send waitlist email if implemented
  }
});

/**
 * Reject a pending join request.
 * Verifies request existence and that status is currently "Pending".
 * Updates status to "Rejected" and records reviewedAt and reviewedBy.
 */
export const reject = mutation({
  args: {
    id: v.id("joinRequests"),
    reason: v.optional(v.string()), // Accept reason but cannot store it per schema constraints
  },
  handler: async (ctx, args) => {
    // const caller = await requireAdmin(ctx); // Disabled for Vanilla JS demo
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Join request not found.");
    }

    if (request.status !== "Pending") {
      throw new Error(
        `Cannot reject join request. Current status is "${request.status}", expected "Pending".`
      );
    }

    await ctx.db.patch(args.id, {
      status: "Rejected",
      reviewedAt: now(),
    });
    
    console.info("Activity: Join Request Rejected", { 
      requestId: args.id,
      reason: args.reason || "No reason provided" 
    });

    // Trigger Email
    await sendJoinRequestRejected(ctx, request.personalEmail || request.collegeEmail, {
      name: request.name,
      reason: args.reason || "Did not meet club requirements",
    });
  },
});

/**
 * Delete a join request by its document ID.
 * Verifies that the request exists before deletion.
 */
export const remove = mutation({
  args: {
    id: v.id("joinRequests"),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx);
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Join request not found.");
    }

    await ctx.db.delete(args.id);
    console.info("Activity: Join Request Deleted", { adminId: caller._id, requestId: args.id });
  },
});

/**
 * Temporary helper for the mock admin dashboard to trigger emails.
 */
export const triggerMockEmail = mutation({
  args: { email: v.string(), name: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    if (args.type === "accepted") {
      await sendJoinRequestApproved(ctx, args.email, { name: args.name, memberId: generateMemberId(), qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-MOCK-ID" });
    } else if (args.type === "rejected") {
      await sendJoinRequestRejected(ctx, args.email, { name: args.name, reason: "Did not meet club requirements" });
    }
  }
});

/**
 * Archive a join request.
 * Since the schema does not have an "Archived" status or flag, 
 * this serves as an alias for deletion.
 */
export const archive = mutation({
  args: {
    id: v.id("joinRequests"),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx);
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Join request not found.");
    }

    await ctx.db.delete(args.id);
    console.info("Activity: Join Request Archived (Deleted)", { adminId: caller._id, requestId: args.id });
  },
});
