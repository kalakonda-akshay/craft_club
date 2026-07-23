import { query } from "./_generated/server";
import { requireSuperAdmin } from "./authHelpers";

/**
 * Public health check API to verify database connectivity.
 */
export const getHealth = query({
  args: {},
  handler: async (ctx) => {
    // Perform a lightweight query to verify DB is online
    const ping = await ctx.db.query("settings").first();
    return {
      status: "ok",
      timestamp: Date.now(),
      version: "1.0.0",
      database: ping ? "connected" : "empty",
    };
  },
});

/**
 * Super Admin API to fetch detailed system statistics.
 */
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const members = await ctx.db.query("members").collect();
    const events = await ctx.db.query("events").collect();
    const certs = await ctx.db.query("certificates").collect();

    // Since Convex doesn't currently expose a direct 'storage usage' API from within queries,
    // we return aggregated table sizes as a proxy for health.
    return {
      status: "online",
      uptime: process.uptime ? process.uptime() : null, // Node runtime proxy if available
      metrics: {
        totalMembers: members.length,
        totalEvents: events.length,
        totalCertificates: certs.length,
      }
    };
  },
});
