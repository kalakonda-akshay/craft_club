import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1. Weekly Newsletter
// Runs every Wednesday at 10:00 AM (UTC)
crons.weekly(
  "weekly-newsletter",
  { dayOfWeek: "wednesday", hourUTC: 10, minuteUTC: 0 },
  internal.cronHelpers.dispatchWeeklyNewsletter
);

// 2. Event Reminders (24 Hours and 1 Hour)
// Runs every hour at the top of the hour.
crons.hourly(
  "event-reminders",
  { minuteUTC: 0 },
  internal.cronHelpers.dispatchEventReminders
);

export default crons;
