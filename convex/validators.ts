/**
 * Shared validation utilities for the Club Management System.
 * Reusable validators for email, phone, and common field checks.
 */
import { Errors } from "./errors";

// ============================================================
// EMAIL VALIDATION
// ============================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates an email address format.
 * @throws Error if the email format is invalid.
 */
export function validateEmail(email: string, fieldName = "Email"): void {
  if (!EMAIL_REGEX.test(email)) {
    throw Errors.ValidationError(`${fieldName} "${email}" is not a valid email address.`);
  }
}

// ============================================================
// PHONE VALIDATION
// ============================================================

const PHONE_REGEX = /^\+?[0-9]\d{6,14}$/;

/**
 * Validates a phone number format (international E.164-like).
 * Accepts 7–15 digits with an optional leading '+'.
 * @throws Error if the phone format is invalid.
 */
export function validatePhone(phone: string, fieldName = "Phone"): void {
  const stripped = phone.replace(/[\s\-()]/g, "");
  if (!PHONE_REGEX.test(stripped)) {
    throw Errors.ValidationError(
      `${fieldName} "${phone}" is not a valid phone number. Expected 7-15 digits, optionally prefixed with '+'.`
    );
  }
}

// ============================================================
// REQUIRED STRING VALIDATION
// ============================================================

/**
 * Validates that a string field is non-empty after trimming.
 * @throws Error if the string is empty or whitespace-only.
 */
export function validateRequiredString(
  value: string,
  fieldName: string,
  maxLength = 255
): void {
  if (!value || value.trim().length === 0) {
    throw Errors.ValidationError(`${fieldName} is required and cannot be empty.`);
  }
  if (value.length > maxLength) {
    throw Errors.ValidationError(`${fieldName} exceeds maximum length of ${maxLength} characters.`);
  }
}

// ============================================================
// DATE STRING VALIDATION
// ============================================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a date string in YYYY-MM-DD format.
 * @throws Error if the date format is invalid.
 */
export function validateDateString(
  date: string,
  fieldName = "Date"
): void {
  if (!DATE_REGEX.test(date)) {
    throw Errors.ValidationError(`${fieldName} "${date}" must be in YYYY-MM-DD format.`);
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw Errors.ValidationError(`${fieldName} "${date}" is not a valid date.`);
  }
}

// ============================================================
// TIME STRING VALIDATION
// ============================================================

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates a time string in HH:MM (24-hour) format.
 * @throws Error if the time format is invalid.
 */
export function validateTimeString(
  time: string,
  fieldName = "Time"
): void {
  if (!TIME_REGEX.test(time)) {
    throw Errors.ValidationError(`${fieldName} "${time}" must be in HH:MM 24-hour format.`);
  }
}

// ============================================================
// URL VALIDATION
// ============================================================

/**
 * Validates an optional URL string format.
 * @throws Error if the URL format is invalid.
 */
export function validateUrl(url: string, fieldName = "URL"): void {
  try {
    new URL(url);
  } catch {
    throw Errors.ValidationError(`${fieldName} "${url}" is not a valid URL.`);
  }
}

// ============================================================
// POSITIVE NUMBER VALIDATION
// ============================================================

/**
 * Validates that a number is positive (greater than 0).
 * @throws Error if the number is not positive.
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string
): void {
  if (value <= 0) {
    throw Errors.ValidationError(`${fieldName} must be a positive number. Got: ${value}`);
  }
}

// ============================================================
// TIMESTAMP HELPER
// ============================================================

/**
 * Returns the current timestamp as epoch milliseconds.
 */
export function now(): number {
  return Date.now();
}

// ============================================================
// MEMBER ID GENERATOR
// ============================================================

/**
 * Generates a unique member ID with a prefix and timestamp-based suffix.
 * Format: CLB-YYYYMMDD-XXXX (where XXXX is a random 4-digit number)
 */
export function generateMemberId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `CLB-${year}${month}${day}-${random}`;
}

// ============================================================
// CERTIFICATE NUMBER GENERATOR
// ============================================================

/**
 * Generates a unique certificate number.
 * Format: CERT-YYYYMMDD-XXXXXX
 */
export function generateCertificateNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(100000 + Math.random() * 900000));
  return `CERT-${year}${month}${day}-${random}`;
}

// ============================================================
// VERIFICATION CODE GENERATOR
// ============================================================

/**
 * Generates a random alphanumeric verification code.
 * @param length Length of the code (default: 12)
 */
export function generateVerificationCode(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================
// HEX COLOR VALIDATION
// ============================================================

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/**
 * Validates a hex color string (e.g., #FFF or #FFFFFF).
 * @throws Error if the format is invalid.
 */
export function validateHexColor(
  color: string,
  fieldName = "Color"
): void {
  if (!HEX_COLOR_REGEX.test(color)) {
    throw Errors.ValidationError(`${fieldName} "${color}" must be a valid hex color (e.g., #FFF or #FF5733).`);
  }
}

// ============================================================
// ROLL NUMBER VALIDATION
// ============================================================

const ROLL_NUMBER_REGEX = /^[A-Z0-9]+$/;

export function validateRollNumber(roll: string): void {
  if (!ROLL_NUMBER_REGEX.test(roll)) {
    throw Errors.ValidationError(`Roll Number "${roll}" is invalid. Must contain only uppercase letters and numbers.`);
  }
}

// ============================================================
// YEAR VALIDATION
// ============================================================

export function validateYear(year: string): void {
  const validYears = ["1st", "2nd", "3rd", "4th", "Alumni"];
  if (!validYears.includes(year)) {
    throw Errors.ValidationError(`Year "${year}" is invalid. Must be one of: ${validYears.join(", ")}`);
  }
}
