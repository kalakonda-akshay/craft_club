import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { sendNewsletter, sendEventReminder } from "./emailHelpers";
import { now } from "./validators";

export const dispatchWeeklyNewsletter = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the newsletter scheduled for this week that hasn't been sent
    // We assume status = "scheduled" and scheduledDate <= now()
    const timestamp = now();
    const scheduledNewsletters = await ctx.db
      .query("newsletters")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    const newsletter = scheduledNewsletters.find(n => n.scheduledDate && n.scheduledDate <= timestamp);

    if (!newsletter) {
      console.info("Activity: No scheduled newsletter found for this week.");
      return;
    }

    // Fetch all active members
    const activeMembers = await ctx.db
      .query("members")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const recipientEmails = activeMembers
      .map(m => m.collegeEmail)
      .filter(email => !!email);

    if (recipientEmails.length === 0) {
      console.info("Activity: Newsletter canceled, no active members found.");
      return;
    }

    // Prepare variables
    const variables = {
      title: newsletter.title,
      presidentMessage: newsletter.presidentMessage,
      buildOfMonth: newsletter.buildOfMonth || "",
    };

    // Dispatch emails in batches if needed, but Resend accepts up to 50 recipients per API call in the `to` field.
    // To send personalized emails or bulk to all, Resend recommends sending individually for personalization,
    // or using the Batch API. For simplicity and to not hit limits on small batches, we'll slice into chunks of 50.
    const CHUNK_SIZE = 50;
    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      await sendNewsletter(ctx, chunk, variables);
    }

    // Update status to sent
    await ctx.db.patch(newsletter._id, {
      status: "sent",
      sentAt: timestamp,
    });

    console.info(`Activity: Weekly Newsletter Dispatched to ${recipientEmails.length} members`);
  },
});

export const dispatchEventReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = now();
    const msPerHour = 60 * 60 * 1000;
    
    // Look for events between 24h and 25h from now
    const target24hStart = timestamp + (24 * msPerHour);
    const target24hEnd = target24hStart + msPerHour;

    // Look for events between 1h and 2h from now
    const target1hStart = timestamp + msPerHour;
    const target1hEnd = target1hStart + msPerHour;

    const allEvents = await ctx.db.query("events").collect();

    for (const event of allEvents) {
      // Parse eventDate and startTime (e.g., "2026-07-25" and "14:00")
      // Assuming local timezone of the club. We will treat them as UTC for deterministic parsing,
      // or standard ISO format.
      const eventDateTimeStr = `${event.eventDate}T${event.startTime}:00Z`;
      const eventTimeMs = new Date(eventDateTimeStr).getTime();

      if (isNaN(eventTimeMs)) continue; // skip unparseable

      let reminderType: "24h" | "1h" | null = null;

      if (eventTimeMs >= target24hStart && eventTimeMs < target24hEnd) {
        reminderType = "24h";
      } else if (eventTimeMs >= target1hStart && eventTimeMs < target1hEnd) {
        reminderType = "1h";
      }

      if (reminderType) {
        // Fetch registered members
        const registrations = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        if (registrations.length === 0) continue;

        const memberIds = registrations.map(r => r.memberId);
        
        // Resolve emails manually (could be heavily optimized but fine for CMS scale)
        const emails: string[] = [];
        for (const mId of memberIds) {
          const m = await ctx.db.get(mId);
          if (m && m.status === "active") {
            emails.push(m.collegeEmail);
          }
        }

        if (emails.length === 0) continue;

        const variables = {
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventTime: event.startTime,
          eventVenue: event.venue,
        };

        const CHUNK_SIZE = 50;
        for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
          const chunk = emails.slice(i, i + CHUNK_SIZE);
          await sendEventReminder(ctx, chunk, variables, reminderType);
        }

        console.info(`Activity: Event Reminder (${reminderType}) Dispatched for ${event.title}`);
      }
    }
  },
});
