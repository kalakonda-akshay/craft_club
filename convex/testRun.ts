import { mutation } from "./_generated/server";
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete Kothapalli
    const joinRequestId = "kx73bxje4drqhfemk3jw61ewvs8b61bp" as any;
    const args = { joinRequestId: joinRequestId, archiveOnly: false };
    
    const joinRequest = await ctx.db.get(args.joinRequestId);
    if (!joinRequest) return "No join request";
    
    return joinRequest;
  }
});
