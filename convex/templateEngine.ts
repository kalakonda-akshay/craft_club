/**
 * Simple template engine that replaces {{placeholders}} with actual values.
 * Provides fallback values for missing keys to prevent broken emails.
 */
export function compileTemplate(
  htmlContent: string,
  variables: Record<string, string | number>
): string {
  if (!htmlContent) return "";

  return htmlContent.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    // If the variable exists, inject it. Otherwise, leave the placeholder or inject an empty string.
    // For safety, we inject an empty string to prevent raw {{tags}} from leaking to users.
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}
