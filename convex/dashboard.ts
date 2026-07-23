import { query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";
import { now } from "./validators";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Fetch all required datasets
    const members = await ctx.db.query("members").collect();
    const joinRequests = await ctx.db.query("joinRequests").collect();
    const admins = await ctx.db.query("admins").collect();
    const events = await ctx.db.query("events").collect();
    const certificates = await ctx.db.query("certificates").collect();

    const timestamp = now();

    // 1. Member Statistics
    const totalMembers = members.length;
    const totalActiveMembers = members.filter(m => m.status === "active").length;
    const inactiveMembers = members.filter(m => m.status === "inactive").length;
    const alumniMembers = members.filter(m => m.status === "alumni").length;

    // 2. Join Request Statistics
    const pendingRequests = joinRequests.filter(r => r.status === "Pending").length;
    const approvedRequests = joinRequests.filter(r => r.status === "Approved").length;
    const rejectedRequests = joinRequests.filter(r => r.status === "Rejected").length;

    // 3. Admin Statistics
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.isActive).length;

    // 4. Event Statistics
    // Assuming eventDate is stored as "YYYY-MM-DD" or similar sortable string
    const todayStr = new Date(timestamp).toISOString().split('T')[0];
    const upcomingEventsCount = events.filter(e => e.eventDate >= todayStr).length;

    // 5. Certificate Statistics
    const totalCertificates = certificates.length;
    const certificatesEmailed = certificates.filter(c => c.emailSent).length;
    let certificatesDownloaded = 0;
    const certsByType: Record<string, number> = {};
    const certsByEvent: Record<string, number> = {};

    certificates.forEach(c => {
      certificatesDownloaded += (c.downloadCount || 0);
      
      const type = c.certificateType || "Unknown";
      certsByType[type] = (certsByType[type] || 0) + 1;

      const eventId = c.eventId;
      certsByEvent[eventId] = (certsByEvent[eventId] || 0) + 1;
    });

    return {
      members: {
        total: totalMembers,
        active: totalActiveMembers,
        inactive: inactiveMembers,
        alumni: alumniMembers,
      },
      requests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      admins: {
        total: totalAdmins,
        active: activeAdmins,
      },
      events: {
        upcoming: upcomingEventsCount,
        total: events.length,
      },
      certificates: {
        total: totalCertificates,
        emailed: certificatesEmailed,
        downloaded: certificatesDownloaded,
        byType: certsByType,
        byEvent: certsByEvent,
      }
    };
  },
});
