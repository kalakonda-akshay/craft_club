import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.insert("events", {
      title: "Build AI Agents with CRAFT",
      description: "Learn how to build AI agents using LLMs and advanced tooling.",
      venue: "Main Auditorium",
      eventDate: "2026-07-30",
      startTime: "10:00",
      endTime: "16:00",
      registrationRequired: false,
      maxParticipants: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "j57d1yvp7t8skves2ac8j9hhe58b2jg5" as any,
    });
  },
});
