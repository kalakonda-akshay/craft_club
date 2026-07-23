const fs = require('fs');

const files = [
  "members.ts",
  "joinRequests.ts",
  "events.ts",
  "announcements.ts",
  "newsletters.ts",
  "certificates.ts",
  "attendance.ts",
  "eventRegistrations.ts",
  "emailTemplates.ts"
];

for (const file of files) {
  const path = `convex/${file}`;
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('import { requireAdmin }')) {
    content = content.replace(
      'import { v } from "convex/values";',
      'import { v } from "convex/values";\nimport { requireAdmin } from "./authHelpers";'
    );
  }

  content = content.replace(
    /handler: async \(ctx, args\) => {/g,
    'handler: async (ctx, args) => {\n    await requireAdmin(ctx);'
  );

  content = content.replace(
    /handler: async \(ctx\) => {/g,
    'handler: async (ctx) => {\n    await requireAdmin(ctx);'
  );

  fs.writeFileSync(path, content);
  console.log(`Protected ${file}`);
}
