import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

export const addPhoto = mutation({
  args: {
    label: v.string(),
    imageStorageId: v.id("_storage"),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const imageId = await ctx.db.insert("galleryImages", {
      label: args.label,
      imageStorageId: args.imageStorageId,
      height: args.height,
      uploadedAt: Date.now(),
      uploadedBy: admin._id,
    });

    console.info("Activity: Gallery Photo Uploaded", { adminId: admin._id, imageId });
    return imageId;
  },
});

export const deletePhoto = mutation({
  args: {
    id: v.id("galleryImages"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found.");
    }

    // Delete from storage
    await ctx.storage.delete(photo.imageStorageId);
    
    // Delete from database
    await ctx.db.delete(args.id);

    console.info("Activity: Gallery Photo Deleted", { adminId: admin._id, photoId: args.id });
    return { success: true };
  },
});

export const listPhotos = query({
  args: {},
  handler: async (ctx) => {
    const photos = await ctx.db
      .query("galleryImages")
      .withIndex("by_uploadedAt")
      .order("desc") // newest first
      .collect();

    // Map storage IDs to actual URLs
    return await Promise.all(
      photos.map(async (photo) => {
        const imageUrl = await ctx.storage.getUrl(photo.imageStorageId);
        return {
          _id: photo._id,
          label: photo.label,
          height: photo.height,
          imageUrl,
        };
      })
    );
  },
});
