/**
 * Normalizes a phone number by:
 * 1. Removing country code (+91)
 * 2. Removing all spaces
 * 3. Removing all dashes
 * 4. Keeping only digits
 * 
 * Examples:
 * - "80159 89208" → "8015989208"
 * - "+91 8015989208" → "8015989208"
 * - "+91 80159-89208" → "8015989208"
 * - "8015989208" → "8015989208"
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters (spaces, dashes, plus signs, etc.)
  let normalized = phoneNumber.replace(/\D/g, '');

  // Remove country code if present (91 for India)
  if (normalized.startsWith('91') && normalized.length > 10) {
    normalized = normalized.substring(2);
  }

  return normalized;
}
