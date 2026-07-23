import { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { compileTemplate } from "./templateEngine";

/**
 * Fetch a template by its title, compile it with variables, and schedule the email.
 * If the template is missing, it will log an error.
 */
async function dispatchEmail(
  ctx: MutationCtx,
  templateTitle: string,
  to: string | string[],
  variables: Record<string, string | number>
) {
  // Find template by title
  const templates = await ctx.db
    .query("emailTemplates")
    .filter((q) => q.eq(q.field("title"), templateTitle))
    .collect();

  if (templates.length === 0) {
    console.error(`Activity: Email Failed - Missing Template: "${templateTitle}"`);
    return;
  }

  const template = templates[0];
  
  // Fetch club settings for "from" info and footer
  const settings = await ctx.db.query("settings").first();
  const fromName = settings?.clubName || "Club Management System";
  const fromEmail = settings?.clubEmail || "onboarding@resend.dev";
  
  // Inject global variables
  const finalVariables = {
    ...variables,
    clubName: fromName,
    footer: settings?.emailFooter || "",
  };

  const subject = compileTemplate(template.subject, finalVariables);
  const html = compileTemplate(template.htmlContent, finalVariables);

  await ctx.scheduler.runAfter(0, internal.emailService.sendEmail, {
    to,
    subject,
    html,
    fromName,
    fromEmail,
  });
}

export async function sendWelcomeEmail(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Welcome Email", email, variables);
}

export async function sendJoinRequestReceived(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Join Request Received", email, variables);
}

export async function sendJoinRequestApproved(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Join Request Approved", email, variables);
}

export async function sendJoinRequestRejected(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Join Request Rejected", email, variables);
}

export async function sendEventRegistrationConfirmation(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Event Registration Confirmation", email, variables);
}

export async function sendEventReminder(ctx: MutationCtx, email: string | string[], variables: any, timeframe: "24h" | "1h") {
  const templateName = timeframe === "24h" 
    ? "Event Reminder (24 Hours Before)" 
    : "Event Reminder (1 Hour Before)";
  await dispatchEmail(ctx, templateName, email, variables);
}

export async function sendEventCancellation(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Event Cancellation", email, variables);
}

export async function sendNewsletter(ctx: MutationCtx, toList: string[], variables: any) {
  await dispatchEmail(ctx, "Weekly Newsletter", toList, variables);
}

export async function sendPasswordResetEmail(ctx: MutationCtx, email: string | string[], variables: any) {
  await dispatchEmail(ctx, "Password Reset Email", email, variables);
}
