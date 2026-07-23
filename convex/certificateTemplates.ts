import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { validateRequiredString, now } from "./validators";

export const getById = query({
  args: { id: v.id("certificateTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("certificateTemplates").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    backgroundPdfStorageId: v.optional(v.id("_storage")),
    config: v.optional(v.object({
      enablePresidentSignature: v.boolean(),
      enableCoordinatorSignature: v.boolean(),
      enableSecretarySignature: v.boolean(),
      enableEventLeadSignature: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    validateRequiredString(args.name, "Template Name");

    const timestamp = now();
    const id = await ctx.db.insert("certificateTemplates", {
      ...args,
      createdBy: admin._id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    console.info("Activity: Certificate Template Created", { adminId: admin._id, templateId: id });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("certificateTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    backgroundPdfStorageId: v.optional(v.id("_storage")),
    config: v.optional(v.object({
      enablePresidentSignature: v.boolean(),
      enableCoordinatorSignature: v.boolean(),
      enableSecretarySignature: v.boolean(),
      enableEventLeadSignature: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin.role !== "super_admin") {
      throw new Error("Only Super Admins can modify certificate templates.");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found.");

    if (args.name !== undefined) validateRequiredString(args.name, "Template Name");

    const patchData: any = { updatedAt: now() };
    if (args.name !== undefined) patchData.name = args.name;
    if (args.description !== undefined) patchData.description = args.description;
    if (args.backgroundPdfStorageId !== undefined) patchData.backgroundPdfStorageId = args.backgroundPdfStorageId;
    if (args.config !== undefined) patchData.config = args.config;

    await ctx.db.patch(args.id, patchData);
    console.info("Activity: Certificate Template Updated", { adminId: admin._id, templateId: args.id });
  },
});

export const remove = mutation({
  args: { id: v.id("certificateTemplates") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin.role !== "super_admin") {
      throw new Error("Only Super Admins can delete certificate templates.");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found.");

    await ctx.db.delete(args.id);
    console.info("Activity: Certificate Template Deleted", { adminId: admin._id, templateId: args.id });
  },
});
