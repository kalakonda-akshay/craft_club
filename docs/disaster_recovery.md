# Disaster Recovery & Backup Plan

## 1. Database Backups
Convex automatically handles high availability and continuous point-in-time recovery for recent data.
- **Manual Backups:** Super Admins can use the built-in CSV Export functionality (`convex/csvExport.ts`) to periodically download all Member and Event registries.
- **Snapshot Config:** Configure automated database snapshots directly from the Convex Dashboard to AWS S3 if strict compliance is required.

## 2. Storage Recovery
All files uploaded (PDFs, Resumes, IDs) are stored in Convex File Storage.
- Keep the `pdfStorageId` synchronized safely.
- If a certificate PDF is lost, the `regenerate` API (`convex/certificates.ts`) can completely reconstruct the binary on the fly without data loss.

## 3. Incident Response
If compromised:
1. Immediately revoke `RESEND_API_KEY` from the Convex Dashboard.
2. Invalidate sessions by toggling `isActive = false` on all suspected Admin records.
3. Check `convex/logger.ts` outputs in the Convex Dashboard logs for anomaly detection.
