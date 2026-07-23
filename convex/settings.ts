import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  validateRequiredString,
  validateEmail,
  validateUrl,
  validateHexColor,
} from "./validators";
import { requireSuperAdmin } from "./authHelpers";

// ============================================================
// QUERIES
// ============================================================

/**
 * Get the settings singleton document.
 * Returns the first document found, or null if settings have not been initialized.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.query("settings").first();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Initialize the settings singleton document.
 * Throws an error if settings have already been initialized.
 */
export const initialize = mutation({
  args: {
    clubName: v.string(),
    clubEmail: v.string(),
    clubLogoStorageId: v.optional(v.id("_storage")),
    instagram: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    website: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    emailFooter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      throw new Error("Settings already initialized");
    }

    validateRequiredString(args.clubName, "Club name");
    validateEmail(args.clubEmail, "Club email");

    if (args.instagram) {
      validateUrl(args.instagram, "Instagram URL");
    }
    if (args.linkedin) {
      validateUrl(args.linkedin, "LinkedIn URL");
    }
    if (args.website) {
      validateUrl(args.website, "Website URL");
    }
    if (args.primaryColor) {
      validateHexColor(args.primaryColor, "Primary color");
    }

    return await ctx.db.insert("settings", {
      clubName: args.clubName,
      clubEmail: args.clubEmail,
      clubLogoStorageId: args.clubLogoStorageId,
      instagram: args.instagram,
      linkedin: args.linkedin,
      website: args.website,
      primaryColor: args.primaryColor,
      emailFooter: args.emailFooter,
    });
  },
});

/**
 * Update the settings singleton document.
 * Throws an error if settings have not been initialized yet.
 */
export const update = mutation({
  args: {
    clubName: v.optional(v.string()),
    clubEmail: v.optional(v.string()),
    clubLogoStorageId: v.optional(v.id("_storage")),
    instagram: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    website: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    emailFooter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const settings = await ctx.db.query("settings").first();
    if (!settings) {
      throw new Error("Settings have not been initialized");
    }

    if (args.clubName !== undefined) {
      validateRequiredString(args.clubName, "Club name");
    }
    if (args.clubEmail !== undefined) {
      validateEmail(args.clubEmail, "Club email");
    }
    if (args.instagram !== undefined) {
      validateUrl(args.instagram, "Instagram URL");
    }
    if (args.linkedin !== undefined) {
      validateUrl(args.linkedin, "LinkedIn URL");
    }
    if (args.website !== undefined) {
      validateUrl(args.website, "Website URL");
    }
    if (args.primaryColor !== undefined) {
      validateHexColor(args.primaryColor, "Primary color");
    }

    const patch: Record<string, any> = {};

    if (args.clubName !== undefined) patch.clubName = args.clubName;
    if (args.clubEmail !== undefined) patch.clubEmail = args.clubEmail;
    if (args.clubLogoStorageId !== undefined)
      patch.clubLogoStorageId = args.clubLogoStorageId;
    if (args.instagram !== undefined) patch.instagram = args.instagram;
    if (args.linkedin !== undefined) patch.linkedin = args.linkedin;
    if (args.website !== undefined) patch.website = args.website;
    if (args.primaryColor !== undefined) patch.primaryColor = args.primaryColor;
    if (args.emailFooter !== undefined) patch.emailFooter = args.emailFooter;

    await ctx.db.patch(settings._id, patch);
  },
});
