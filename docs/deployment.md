# Production Deployment Guide

## 1. Convex Deployment
Convex handles infrastructure, scaling, and database provisioning automatically.
Run the following to deploy to production:
```bash
npx convex deploy
```

## 2. Environment Variables Checklist
Ensure the following variables are securely configured in your **Convex Production Dashboard** under Settings > Environment Variables:

- `RESEND_API_KEY`: The production API key for email dispatch.
- `CONVEX_SITE_URL`: Set automatically by Convex.

> [!WARNING]
> Do NOT use `npx convex dev` against production databases. Always use a distinct local/preview environment for testing.

## 3. Post-Deployment Setup
- Seed the `admins` table with your initial Super Admin account.
- Configure `settings` table with the production Club Logo, Email, and Website.
- Upload any Certificate `certificateTemplates` (PDF files) via the Admin Dashboard.
