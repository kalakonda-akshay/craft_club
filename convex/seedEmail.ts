import { mutation } from "./_generated/server";
import {
  templateWelcome,
  templateApproved,
  templateUpdate,
  templateEventConfirmed,
  templateEventReminder,
  templateEventPass,
  templateCertificate,
  templateWorkshopAnnounce,
  templateWellDone
} from "./emailHtml";

export const seedTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Create a dummy admin ID if none exists for seeding
      const admin = await ctx.db.query("admins").first();
      const adminId = admin ? admin._id : (await ctx.db.insert("admins", { username: "system", passwordHash: "system", role: "Super Admin", createdBy: "system" }));

      const templatesToSeed = [
        {
          title: "Join Request Received",
          subject: "Welcome to CRAFT! We've received your application.",
          htmlContent: templateWelcome({ name: "{{name}}" })
        },
        {
          title: "Join Request Approved",
          subject: "You're In! Welcome to CRAFT",
          htmlContent: templateApproved({ name: "{{name}}", memberId: "{{memberId}}", role: "Core Member", dept: "CSE A", year: "1st Year B.Tech", qrCodeUrl: "{{qrCodeUrl}}" })
        },
        {
          title: "Application Update",
          subject: "Update on your CRAFT Application",
          htmlContent: templateUpdate({ name: "{{name}}" })
        },
        {
          title: "Registration Confirmed",
          subject: "Your CRAFT Event Registration is Confirmed!",
          htmlContent: templateEventConfirmed({ name: "{{name}}", eventTitle: "{{eventTitle}}", date: "{{date}}", venue: "{{venue}}", reportingTime: "{{reportingTime}}", sessionTime: "{{sessionTime}}", registrationId: "{{registrationId}}", qrCodeUrl: "{{qrCodeUrl}}" })
        },
        {
          title: "Event Reminder",
          subject: "Reminder: CRAFT Workshop Starts Tomorrow!",
          htmlContent: templateEventReminder({ name: "{{name}}", eventTitle: "{{eventTitle}}", date: "{{date}}", venue: "{{venue}}", reportingTime: "{{reportingTime}}", sessionTime: "{{sessionTime}}", qrCodeUrl: "{{qrCodeUrl}}" })
        },
        {
          title: "Event Pass",
          subject: "Your CRAFT Event Pass is Inside",
          htmlContent: templateEventPass({ name: "{{name}}", eventTitle: "{{eventTitle}}", date: "{{date}}", venue: "{{venue}}", reportingTime: "{{reportingTime}}", sessionTime: "{{sessionTime}}", seatNo: "{{seatNo}}", registrationId: "{{registrationId}}", qrCodeUrl: "{{qrCodeUrl}}" })
        },
        {
          title: "Certificate Ready",
          subject: "Your CRAFT Certificate is Ready for Download",
          htmlContent: templateCertificate({ name: "{{name}}", eventTitle: "{{eventTitle}}", certId: "{{certId}}", date: "{{date}}", downloadLink: "{{downloadLink}}" })
        },
        {
          title: "Workshop Announcement",
          subject: "New CRAFT Workshop! Registrations Open",
          htmlContent: templateWorkshopAnnounce({ name: "{{name}}", eventTitle: "{{eventTitle}}", date: "{{date}}", venue: "{{venue}}", duration: "{{duration}}", seats: "{{seats}}", registrationLink: "{{registrationLink}}" })
        },
        {
          title: "Workshop Completed",
          subject: "Well Done! CRAFT Workshop Completed",
          htmlContent: templateWellDone({ name: "{{name}}" })
        }
      ];

      for (const t of templatesToSeed) {
        const existing = await ctx.db
          .query("emailTemplates")
          .filter((q) => q.eq(q.field("title"), t.title))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            subject: t.subject,
            htmlContent: t.htmlContent,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.insert("emailTemplates", {
            title: t.title,
            subject: t.subject,
            htmlContent: t.htmlContent,
            createdBy: adminId as any,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      return "Templates updated/inserted successfully!";
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
});
