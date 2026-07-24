import { mutation } from "./_generated/server";

export default mutation({
  handler: async (ctx) => {
    // 1. Create a Super Admin
    const adminId = await ctx.db.insert("admins", {
      name: "AKSHAY",
      email: "akshay@example.com",
      phone: "0000000000",
      passwordHash: "Ram@6002",
      role: "super_admin",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const admin2Id = await ctx.db.insert("admins", {
      name: "AVINASH",
      email: "avinash@example.com",
      phone: "0000000000",
      passwordHash: "AVI1464",
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Removed fake data for events, newsletters, etc. to prevent schema validation crashes.
    console.log("Seed complete: AKSHAY & AVINASH admins created successfully.");
  },
});
