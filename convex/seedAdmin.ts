import { mutation } from "./_generated/server";

export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("admins", {
      name: "Demo Admin",
      email: "demo@craftclub.in",
      role: "admin",
      isActive: true,
      passwordHash: "dummy",
      phone: "1234567890",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },
});
