import { query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  // Escape quotes and enclose in quotes if it contains comma, newline, or quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const exportMembers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const members = await ctx.db.query("members").collect();

    const headers = [
      "Member ID", "Name", "Roll Number", "Department", "Year", "Section",
      "College Email", "Personal Email", "Phone", "Gender", "Blood Group",
      "Status", "Joined Date"
    ];

    const rows = members.map(m => [
      m.memberId,
      m.name,
      m.rollNumber,
      m.department,
      m.year,
      m.section,
      m.collegeEmail,
      m.personalEmail || "",
      m.phone,
      m.gender,
      m.bloodGroup || "",
      m.status,
      new Date(m.joinedDate).toISOString()
    ]);

    const csvLines = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ];

    return csvLines.join("\n");
  },
});

export const exportJoinRequests = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const requests = await ctx.db.query("joinRequests").collect();

    const headers = [
      "Name", "Roll Number", "Department", "Year", "Section",
      "College Email", "Personal Email", "Phone", "Reason", "Skills", 
      "Status", "Submitted At", "Reviewed At"
    ];

    const rows = requests.map(r => [
      r.name,
      r.rollNumber,
      r.department,
      r.year,
      r.section,
      r.collegeEmail,
      r.personalEmail || "",
      r.phone,
      r.reasonToJoin,
      r.skills ? r.skills.join("; ") : "",
      r.status,
      new Date(r.submittedAt).toISOString(),
      r.reviewedAt ? new Date(r.reviewedAt).toISOString() : ""
    ]);

    const csvLines = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ];

    return csvLines.join("\n");
  },
});

export const exportAdmins = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx); // Assuming normal admins can export admins? Or should it be super admin?
    // Based on user prompt "Only Super Admin can... Create/Update/Delete Admin... View Admin List... Search Admins"
    // Oh, I should probably enforce superAdmin here just in case, but let's check authHelpers for getCurrentAdmin role.
    // Wait, the prompt says "Only Super Admin can... View Admin List". So this should be super admin only!
    const caller = await requireAdmin(ctx);
    if (caller.role !== "super_admin") {
      throw new Error("Only Super Admin can export admins.");
    }

    const admins = await ctx.db.query("admins").collect();

    const headers = [
      "Name", "Email", "Phone", "Role", "Active", "Last Login", "Created At"
    ];

    const rows = admins.map(a => [
      a.name,
      a.email,
      a.phone,
      a.role,
      a.isActive ? "Yes" : "No",
      a.lastLogin ? new Date(a.lastLogin).toISOString() : "",
      new Date(a.createdAt).toISOString()
    ]);

    const csvLines = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ];

    return csvLines.join("\n");
  },
});
