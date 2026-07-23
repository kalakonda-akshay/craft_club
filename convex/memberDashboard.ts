import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch member profile and statistics for the dashboard.
 */
export const getDashboardData = query({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    // 1. Get Attendance History
    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();

    // 2. Get Event Registrations (Events attended)
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .filter((q) => q.eq(q.field("attendanceStatus"), "attended"))
      .collect();

    // 3. Get Certificates
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();

    // 4. Get Projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();

    // 5. Get Upcoming Events
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const upcomingEvents = await ctx.db
      .query("events")
      .withIndex("by_eventDate")
      .filter((q) => q.gte(q.field("eventDate"), now))
      .collect();

    // Calculations
    const totalEventsConducted = await ctx.db.query("events").collect();
    // A simplified attendance calculation
    const totalSessions = totalEventsConducted.length;
    const attendedSessions = attendanceRecords.filter(a => a.status === "present").length;
    const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 100;
    
    // Skills level mocked calculation based on projects and events attended
    const skillsLevel = Math.min(100, Math.round(((projects.length * 10) + (registrations.length * 5))));

    return {
      member,
      stats: {
        attendancePercentage,
        eventsAttended: registrations.length,
        certificatesEarned: certificates.length,
        projectsSubmitted: projects.length,
        skillsLevel,
      },
      recentCertificates: certificates.slice(0, 3),
      upcomingEvents: upcomingEvents.slice(0, 3),
      projects: projects,
    };
  },
});
