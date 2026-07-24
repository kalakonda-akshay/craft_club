import { mutation } from "./_generated/server";

export const clearPending = mutation({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("joinRequests").collect();
    for (const req of requests) {
      await ctx.db.delete(req._id);
    }
    const members = await ctx.db.query("members").collect();
    for (const mem of members) {
      await ctx.db.delete(mem._id);
    }
  }
});
