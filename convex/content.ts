import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

export const saveContent = mutation({
  args: {
    key: v.string(),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { data: args.data });
    } else {
      await ctx.db.insert("siteContent", { key: args.key, data: args.data });
    }
    
    console.info(`Activity: CMS Content Updated [${args.key}]`, { adminId: admin._id });
  },
});

export const getContent = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return existing ? existing.data : null;
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
