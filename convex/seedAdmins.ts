import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Add Akshay as Admin
    await ctx.db.insert("admins", {
      name: "Akshay",
      email: "akshay@demo.com",
      phone: "1234567890",
      passwordHash: "akshay",
      role: "super_admin",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Add Avinash as Admin
    await ctx.db.insert("admins", {
      name: "Avinash",
      email: "avinash@demo.com",
      phone: "0987654321",
      passwordHash: "avinash",
      role: "super_admin",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Add them as Members so QR check-in works!
    await ctx.db.insert("members", {
      memberId: "CRAFT-2026-AKSHAY",
      name: "Akshay",
      collegeEmail: "akshay@demo.com",
      phone: "1234567890",
      rollNumber: "ROLL-AKSHAY",
      year: "3",
      department: "CSE",
      gender: "Male",
      section: "A",
      joinedDate: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("members", {
      memberId: "CRAFT-2026-AVINASH",
      name: "Avinash",
      collegeEmail: "avinash@demo.com",
      phone: "0987654321",
      rollNumber: "ROLL-AVINASH",
      year: "3",
      department: "CSE",
      gender: "Male",
      section: "B",
      joinedDate: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return "Successfully seeded Akshay and Avinash as Admins and Members!";
  },
});