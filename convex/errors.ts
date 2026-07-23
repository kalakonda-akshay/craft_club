import { ConvexError } from "convex/values";

/**
 * Standardized backend errors for the Club Management System.
 * Throwing ConvexError ensures the exact error payload is securely transmitted
 * to the client without leaking server stack traces.
 */

export const Errors = {
  Unauthorized: () => new ConvexError({ code: "UNAUTHORIZED", message: "You must be logged in to perform this action." }),
  Forbidden: (message = "You do not have permission to perform this action.") => new ConvexError({ code: "FORBIDDEN", message }),
  NotFound: (entity = "Resource") => new ConvexError({ code: "NOT_FOUND", message: `${entity} not found.` }),
  ValidationError: (message: string) => new ConvexError({ code: "VALIDATION_FAILED", message }),
  DuplicateEntry: (message = "Record already exists.") => new ConvexError({ code: "DUPLICATE_ENTRY", message }),
  StorageError: (message = "File storage operation failed.") => new ConvexError({ code: "STORAGE_ERROR", message }),
  EmailError: (message = "Failed to send email.") => new ConvexError({ code: "EMAIL_ERROR", message }),
  CertificateError: (message = "Failed to generate certificate.") => new ConvexError({ code: "CERTIFICATE_ERROR", message }),
  InternalError: (message = "An unexpected error occurred.") => new ConvexError({ code: "INTERNAL_ERROR", message }),
};
