import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { deletionRequestReceivedHtml, deletionRequestApprovedHtml, deletionRequestRejectedHtml } from "./emailHtml";

export const submitRequest = mutation({
  args: {
    convexMemberId: v.id("members"),
    reason: v.string(),
    comments: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.convexMemberId);
    if (!member) throw new Error("Member not found");

    const requestId = await ctx.db.insert("deletionRequests", {
      memberId: member.memberId,
      convexMemberId: member._id,
      reason: args.reason,
      comments: args.comments,
      status: "Pending",
      submittedAt: Date.now()
    });
    
    // Trigger Request Received Email
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });
    await ctx.scheduler.runAfter(0, (await import("./_generated/server")).internal.emailService.sendInternal, {
      to: member.collegeEmail,
      subject: "CRAFT Membership Deletion Request Received",
      html: deletionRequestReceivedHtml(member.name, member.memberId, member.department, args.reason, dateStr)
    });

    return { success: true, requestId };
  }
});

export const getAllRequests = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const reqs = await ctx.db.query("deletionRequests").order("desc").collect();
    const result = [];
    for (const req of reqs) {
      const member = await ctx.db.get(req.convexMemberId);
      result.push({
        ...req,
        memberName: member?.name || "Unknown",
        memberEmail: member?.collegeEmail || "Unknown"
      });
    }
    return result;
  }
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("deletionRequests"),
    status: v.union(v.literal("Approved"), v.literal("Rejected")),
    rejectionReason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const req = await ctx.db.get(args.requestId);
    if (!req) throw new Error("Request not found");

    const member = await ctx.db.get(req.convexMemberId);
    if (!member) throw new Error("Member not found");

    await ctx.db.patch(args.requestId, { status: args.status });
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });

    if (args.status === "Approved") {
      // Send Approved email
      await ctx.scheduler.runAfter(0, (await import("./_generated/server")).internal.emailService.sendInternal, {
        to: member.collegeEmail,
        subject: "CRAFT Membership Deletion Approved",
        html: deletionRequestApprovedHtml(member.name, member.memberId, dateStr)
      });

      // Cascade Delete
      const atts = await ctx.db.query("attendance").withIndex("by_memberId", q => q.eq("memberId", member._id)).collect();
      for (const a of atts) await ctx.db.delete(a._id);

      const certs = await ctx.db.query("certificates").withIndex("by_memberId", q => q.eq("memberId", member._id)).collect();
      for (const c of certs) await ctx.db.delete(c._id);

      const regs = await ctx.db.query("eventRegistrations").withIndex("by_memberId", q => q.eq("memberId", member._id)).collect();
      for (const r of regs) await ctx.db.delete(r._id);

      await ctx.db.delete(member._id);
    } else {
      // Send Rejected email
      const msg = args.rejectionReason || "Your involvement in ongoing projects and upcoming events is valuable to the club. We encourage you to continue contributing to CRAFT's mission and activities.";
      await ctx.scheduler.runAfter(0, (await import("./_generated/server")).internal.emailService.sendInternal, {
        to: member.collegeEmail,
        subject: "CRAFT Membership Deletion Rejected",
        html: deletionRequestRejectedHtml(member.name, msg)
      });
    }

    return { success: true };
  }
});
