import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ============================================================
  // COLLECTION 0: LOGIN HISTORY
  // ============================================================
  loginHistory: defineTable({
    adminId: v.id("admins"),
    loginTime: v.number(),
    logoutTime: v.optional(v.number()),
    success: v.boolean(),
    failedAttempts: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_adminId", ["adminId"])
    .index("by_loginTime", ["loginTime"]),

  // ============================================================
  // COLLECTION 1: ADMINS
  // ============================================================
  admins: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("pr_coordinator")
    ),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    collegeIdFrontStorageId: v.optional(v.id("_storage")),
    collegeIdBackStorageId: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"]),

  // ============================================================
  // COLLECTION 2: MEMBERS
  // ============================================================
  members: defineTable({
    memberId: v.string(),
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
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("alumni")
    ),
    joinedDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_rollNumber", ["rollNumber"])
    .index("by_collegeEmail", ["collegeEmail"])
    .index("by_phone", ["phone"])
    .index("by_department", ["department"])
    .index("by_memberId", ["memberId"])
    .index("by_status", ["status"])
    .index("by_year", ["year"]),

  // ============================================================
  // COLLECTION 3: JOIN REQUESTS
  // ============================================================
  joinRequests: defineTable({
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
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("admins")),
  })
    .index("by_status", ["status"])
    .index("by_rollNumber", ["rollNumber"])
    .index("by_collegeEmail", ["collegeEmail"]),

  // ============================================================
  // COLLECTION 4: EVENTS
  // ============================================================
  events: defineTable({
    title: v.string(),
    description: v.string(),
    venue: v.string(),
    eventDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    posterStorageId: v.optional(v.id("_storage")),
    registrationRequired: v.boolean(),
    maxParticipants: v.optional(v.number()),
    createdBy: v.id("admins"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_eventDate", ["eventDate"])
    .index("by_createdBy", ["createdBy"]),

  // ============================================================
  // COLLECTION 5: EVENT REGISTRATIONS
  // ============================================================
  eventRegistrations: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    registeredAt: v.number(),
    attendanceStatus: v.union(
      v.literal("registered"),
      v.literal("attended"),
      v.literal("absent")
    ),
    attendanceTime: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_memberId", ["memberId"])
    .index("by_eventId_memberId", ["eventId", "memberId"]),

  // ============================================================
  // COLLECTION 6: ATTENDANCE
  // ============================================================
  attendance: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late")
    ),
    checkInTime: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_memberId", ["memberId"])
    .index("by_eventId_memberId", ["eventId", "memberId"]),

  // ============================================================
  // COLLECTION 7: ANNOUNCEMENTS
  // ============================================================
  announcements: defineTable({
    title: v.string(),
    description: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"]),

  // ============================================================
  // COLLECTION 8: NEWSLETTERS
  // ============================================================
  newsletters: defineTable({
    weekNumber: v.number(),
    title: v.string(),
    presidentMessage: v.string(),
    memberOfWeek: v.optional(v.id("members")),
    buildOfMonth: v.optional(v.string()),
    galleryImageStorageIds: v.optional(v.array(v.id("_storage"))),
    upcomingEvents: v.optional(v.array(v.id("events"))),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sent")
    ),
    scheduledDate: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_weekNumber", ["weekNumber"]),

  // ============================================================
  // COLLECTION 9: PROJECTS
  // ============================================================
  projects: defineTable({
    memberId: v.id("members"),
    title: v.string(),
    description: v.string(),
    repoUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("featured")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_memberId", ["memberId"])
    .index("by_status", ["status"]),

  // ============================================================
  // COLLECTION 10: EMAIL TEMPLATES
  // ============================================================
  emailTemplates: defineTable({
    title: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"]),

  // ============================================================
  // COLLECTION 11: CERTIFICATES
  // ============================================================
  certificates: defineTable({
    certificateNumber: v.string(),
    verificationCode: v.string(),
    certificateType: v.string(), // Added for Certificate Management Module
    templateId: v.optional(v.id("certificateTemplates")), // Added for Certificate Management Module
    memberId: v.id("members"),
    eventId: v.id("events"),
    pdfStorageId: v.optional(v.id("_storage")),
    issuedAt: v.number(),
    emailSent: v.boolean(),
    downloadCount: v.number(),
  })
    .index("by_certificateNumber", ["certificateNumber"])
    .index("by_verificationCode", ["verificationCode"])
    .index("by_memberId", ["memberId"])
    .index("by_eventId", ["eventId"])
    .index("by_memberId_eventId", ["memberId", "eventId"])
    .index("by_certificateType", ["certificateType"]),

  // ============================================================
  // COLLECTION 12: CERTIFICATE TEMPLATES
  // ============================================================
  certificateTemplates: defineTable({
    name: v.string(), // e.g., "Winner Template", "Participation Template"
    description: v.optional(v.string()),
    backgroundPdfStorageId: v.optional(v.id("_storage")),
    // Configuration for rendering text/signatures on the PDF
    config: v.optional(v.object({
      enablePresidentSignature: v.boolean(),
      enableCoordinatorSignature: v.boolean(),
      enableSecretarySignature: v.boolean(),
      enableEventLeadSignature: v.boolean(),
    })),
    createdBy: v.id("admins"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"]),

  // ============================================================
  // COLLECTION 13: SETTINGS
  // ============================================================
  settings: defineTable({
    clubName: v.string(),
    clubEmail: v.string(),
    clubLogoStorageId: v.optional(v.id("_storage")),
    instagram: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    website: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    emailFooter: v.optional(v.string()),
  }),

  // ============================================================
  // COLLECTION 14: GALLERY IMAGES
  // ============================================================
  galleryImages: defineTable({
    label: v.string(),
    imageStorageId: v.id("_storage"),
    height: v.number(),
    uploadedAt: v.number(),
    uploadedBy: v.id("admins"),
  }).index("by_uploadedAt", ["uploadedAt"]),
});
