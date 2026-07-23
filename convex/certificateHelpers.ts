import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./validators";

export const getGenerationData = internalQuery({
  args: {
    memberId: v.id("members"),
    eventId: v.id("events"),
    templateId: v.id("certificateTemplates"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    const event = await ctx.db.get(args.eventId);
    const template = await ctx.db.get(args.templateId);
    const settings = await ctx.db.query("settings").first();

    let backgroundUrl = null;
    if (template?.backgroundPdfStorageId) {
      backgroundUrl = await ctx.storage.getUrl(template.backgroundPdfStorageId);
    }

    return { member, event, template, settings, backgroundUrl };
  },
});

export const generateUniqueNumber = internalQuery({
  args: {},
  handler: async (ctx) => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    
    // Simplistic collision check: in a real environment with high concurrency,
    // this would be a sequence counter in the database.
    let numberStr = `CLUB-${year}-${random}`;
    let exists = await ctx.db
      .query("certificates")
      .withIndex("by_certificateNumber", (q) => q.eq("certificateNumber", numberStr))
      .first();
      
    while (exists) {
      const newRand = Math.floor(100000 + Math.random() * 900000);
      numberStr = `CLUB-${year}-${newRand}`;
      exists = await ctx.db
        .query("certificates")
        .withIndex("by_certificateNumber", (q) => q.eq("certificateNumber", numberStr))
        .first();
    }
    
    return numberStr;
  },
});

export const generateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createCertificateRecord = internalMutation({
  args: {
    certificateNumber: v.string(),
    verificationCode: v.string(),
    certificateType: v.string(),
    templateId: v.id("certificateTemplates"),
    memberId: v.id("members"),
    eventId: v.id("events"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    const id = await ctx.db.insert("certificates", {
      ...args,
      issuedAt: timestamp,
      emailSent: false,
      downloadCount: 0,
    });
    return id;
  },
});

export const markEmailSent = internalMutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { emailSent: true });
  },
});
