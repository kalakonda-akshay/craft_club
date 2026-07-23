import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import {
  generateCertificateNumber,
  generateVerificationCode,
  now,
} from "./validators";
import { internal } from "./_generated/api";
import { logger } from "./logger";
import { Errors } from "./errors";

// ============================================================
// QUERIES
// ============================================================

/**
 * Get a certificate by its Convex document ID.
 */
export const getById = query({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a certificate by its unique certificate number.
 */
export const getByCertificateNumber = query({
  args: { certificateNumber: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_certificateNumber", (q) =>
        q.eq("certificateNumber", args.certificateNumber)
      )
      .first();
  },
});

/**
 * Get a certificate by its verification code (public verification).
 */
export const getByVerificationCode = query({
  args: { verificationCode: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_verificationCode", (q) =>
        q.eq("verificationCode", args.verificationCode)
      )
      .first();
  },
});

/**
 * List all certificates issued to a specific member.
 */
export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

/**
 * List all certificates issued for a specific event.
 */
export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

/**
 * Get certificate for a specific member and event.
 */
export const getByMemberAndEvent = query({
  args: {
    memberId: v.id("members"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_memberId_eventId", (q) =>
        q.eq("memberId", args.memberId).eq("eventId", args.eventId)
      )
      .first();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Issue a new certificate to a member for an event.
 * Verifies member and event existence, checks for duplicates, auto-generates numbers.
 */
export const issue = mutation({
  args: {
    memberId: v.id("members"),
    eventId: v.id("events"),
    certificateType: v.string(),
    templateId: v.optional(v.id("certificateTemplates")),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw Errors.NotFound("Member");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw Errors.NotFound("Event");
    }

    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_memberId_eventId", (q) =>
        q.eq("memberId", args.memberId).eq("eventId", args.eventId)
      )
      .filter((q) => q.eq(q.field("certificateType"), args.certificateType))
      .first();

    if (existing) {
      throw Errors.DuplicateEntry("Certificate of this type already issued for this member and event");
    }

    const certificateNumber = generateCertificateNumber();
    const verificationCode = generateVerificationCode();
    const issuedAt = now();

    return await ctx.db.insert("certificates", {
      certificateNumber,
      verificationCode,
      certificateType: args.certificateType,
      templateId: args.templateId,
      memberId: args.memberId,
      eventId: args.eventId,
      pdfStorageId: args.pdfStorageId,
      issuedAt,
      emailSent: false,
      downloadCount: 0,
    });
  },
});

/**
 * Mark email as sent for a certificate.
 */
export const markEmailSent = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cert = await ctx.db.get(args.id);
    if (!cert) {
      throw Errors.NotFound("Certificate");
    }

    await ctx.db.patch(args.id, { emailSent: true });
    logger.info("Certificate Email Sent marked manually", { certId: args.id });
  },
});

/**
 * Increment the download count for a certificate.
 */
export const incrementDownloadCount = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cert = await ctx.db.get(args.id);
    if (!cert) {
      throw Errors.NotFound("Certificate");
    }

    await ctx.db.patch(args.id, {
      downloadCount: cert.downloadCount + 1,
    });
    logger.info("Certificate Downloaded", { certId: args.id });
  },
});

/**
 * Attach or update a PDF storage ID for a certificate.
 */
export const attachPdf = mutation({
  args: {
    id: v.id("certificates"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cert = await ctx.db.get(args.id);
    if (!cert) {
      throw Errors.NotFound("Certificate");
    }

    await ctx.db.patch(args.id, { pdfStorageId: args.pdfStorageId });
    logger.info("Certificate PDF attached", { certId: args.id, pdfStorageId: args.pdfStorageId });
  },
});

/**
 * Delete a certificate.
 */
export const remove = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin.role !== "super_admin") {
      throw Errors.Forbidden("Only Super Admin can delete certificates.");
    }
    const cert = await ctx.db.get(args.id);
    if (!cert) {
      throw Errors.NotFound("Certificate");
    }

    await ctx.db.delete(args.id);
    logger.info("Certificate Deleted", { adminId: admin._id, certId: args.id });
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    certificateType: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    issueDate: v.optional(v.string()), // YYYY-MM-DD format
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let certificates = await ctx.db.query("certificates").order("desc").collect();

    // In-memory joins and filters for complex search
    const results = [];
    for (const cert of certificates) {
      const member = await ctx.db.get(cert.memberId);
      const event = await ctx.db.get(cert.eventId);
      
      if (!member || !event) continue;

      let match = true;

      // 1. Filter by Certificate Type
      if (args.certificateType && cert.certificateType !== args.certificateType) match = false;

      // 2. Filter by Event
      if (args.eventId && cert.eventId !== args.eventId) match = false;

      // 3. Filter by Department
      if (args.department && member.department !== args.department) match = false;

      // 4. Filter by Year
      if (args.year && member.year !== args.year) match = false;

      // 5. Filter by Issue Date
      if (args.issueDate) {
        const certDateStr = new Date(cert.issuedAt).toISOString().split("T")[0];
        if (certDateStr !== args.issueDate) match = false;
      }

      // 6. Text Search (Member Name, Roll Number, Certificate Number, Event Name)
      if (match && args.searchTerm) {
        const term = args.searchTerm.toLowerCase();
        const searchString = `${member.name} ${member.rollNumber} ${cert.certificateNumber} ${event.title}`.toLowerCase();
        if (!searchString.includes(term)) {
          match = false;
        }
      }

      if (match) {
        results.push({
          ...cert,
          member,
          event,
        });
      }
    }

    // Manual Pagination
    const total = results.length;
    const { page, limit } = args.paginationOpts;
    const startIndex = (page - 1) * limit;
    const paginatedItems = results.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: startIndex + limit < total,
      hasPreviousPage: page > 1,
    };
  },
});

export const generateBulk = mutation({
  args: {
    eventId: v.id("events"),
    templateId: v.id("certificateTemplates"),
    certificateType: v.string(),
    target: v.union(
      v.literal("all_attendees"),
      v.literal("all_registered"),
      v.literal("selected_members")
    ),
    memberIds: v.optional(v.array(v.id("members"))),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found.");

    let targetMemberIds: Id<"members">[] = [];

    if (args.target === "selected_members") {
      if (!args.memberIds || args.memberIds.length === 0) {
        throw new Error("Member IDs required for selected_members target.");
      }
      targetMemberIds = args.memberIds;
    } else if (args.target === "all_registered" || args.target === "all_attendees") {
      const registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();
      
      targetMemberIds = registrations.map(r => r.memberId);
    }

    if (targetMemberIds.length === 0) {
      throw new Error("No members found for the selected criteria.");
    }

    const existingCerts = await ctx.db
      .query("certificates")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const existingMap = new Set(
      existingCerts
        .filter(c => c.certificateType === args.certificateType)
        .map(c => c.memberId)
    );

    const membersToProcess = targetMemberIds.filter(id => !existingMap.has(id));

    for (const memberId of membersToProcess) {
      await ctx.scheduler.runAfter(0, internal.certificateGenerator.generateAndSendCertificate, {
        memberId: memberId as any,
        eventId: args.eventId,
        templateId: args.templateId,
        certificateType: args.certificateType,
      });
    }

    logger.info("Bulk Certificates Scheduled", {
      adminId: admin._id,
      eventId: args.eventId,
      count: membersToProcess.length,
    });

    return membersToProcess.length;
  },
});

export const resendEmail = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const cert = await ctx.db.get(args.id);
    if (!cert) throw new Error("Certificate not found.");

    const member = await ctx.db.get(cert.memberId);
    const event = await ctx.db.get(cert.eventId);
    const settings = await ctx.db.query("settings").first();

    if (!member || !event) throw new Error("Missing member or event data.");

    let pdfUrl = "#";
    if (cert.pdfStorageId) {
      pdfUrl = (await ctx.storage.getUrl(cert.pdfStorageId)) || "#";
    }

    const fromName = settings?.clubName || "Club Management System";
    const fromEmail = settings?.clubEmail || "noreply@club.com";
    const subject = `Your Certificate for ${event.title}`;
    const html = `<p>Dear ${member.name},</p><p>Your ${cert.certificateType} certificate for <strong>${event.title}</strong> is available.</p><p>You can download it securely here: <a href="${pdfUrl}">Download Certificate</a></p><p>Certificate Number: ${cert.certificateNumber}</p>`;

    await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
      to: member.collegeEmail,
      subject,
      html,
      fromName,
      fromEmail,
    });

    logger.info("Certificate Email Resent", { adminId: admin._id, certId: args.id });
  },
});

export const regenerate = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin.role !== "super_admin") {
      throw new Error("Only Super Admin can regenerate certificates.");
    }
    
    const cert = await ctx.db.get(args.id);
    if (!cert) throw new Error("Certificate not found.");
    if (!cert.templateId) throw new Error("Cannot regenerate without a template ID.");

    // Schedule re-generation
    await ctx.scheduler.runAfter(0, internal.certificateGenerator.generateAndSendCertificate, {
      memberId: cert.memberId,
      eventId: cert.eventId,
      templateId: cert.templateId,
      certificateType: cert.certificateType,
    });

    logger.info("Certificate Regeneration Scheduled", { adminId: admin._id, certId: args.id });
  },
});
