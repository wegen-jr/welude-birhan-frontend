import { isValidPhoneNumber } from "libphonenumber-js";

/**
 * Validates a phone number with strict support for standard Ethiopian mobile/landline
 * formats as well as international E.164 phone formats.
 *
 * Accepted formats:
 * - Ethiopian local: 09XXXXXXXX, 07XXXXXXXX (10 digits)
 * - Ethiopian international: +2519XXXXXXXX, +2517XXXXXXXX, 2519XXXXXXXX, 2517XXXXXXXX
 * - Formatted variants with spaces/hyphens/parentheses: "+251 91 122 3344", "0911-223344"
 * - International standard numbers via libphonenumber-js
 *
 * @param {string} phone - Input phone number string
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.required=true] - Whether phone number is mandatory
 * @returns {{ isValid: boolean, error: string | null, sanitized: string }}
 */
export function validatePhoneNumber(phone, options = { required: true }) {
  const { required = true } = options;

  if (!phone || typeof phone !== "string") {
    return {
      isValid: !required,
      error: required ? "Contact phone number is required." : null,
      sanitized: "",
    };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return {
      isValid: !required,
      error: required ? "Contact phone number is required." : null,
      sanitized: "",
    };
  }

  // Strip spaces, hyphens, parentheses, and dots for analysis
  const cleanDigits = trimmed.replace(/[\s\-().]/g, "");

  // 1. Ethiopian regular expression:
  // Starts with optional +251, 251, or 0, followed by 7 or 9 and 8 more digits
  const ethiopianRegex = /^(?:\+251|251|0)?([79]\d{8})$/;
  const ethMatch = cleanDigits.match(ethiopianRegex);
  if (ethMatch) {
    return {
      isValid: true,
      error: null,
      sanitized: trimmed,
    };
  }

  // 2. International validation via libphonenumber-js
  try {
    const formatted = cleanDigits.startsWith("+")
      ? cleanDigits
      : cleanDigits.startsWith("0")
      ? `+251${cleanDigits.slice(1)}`
      : `+${cleanDigits}`;

    if (isValidPhoneNumber(formatted, "ET") || isValidPhoneNumber(formatted)) {
      return {
        isValid: true,
        error: null,
        sanitized: trimmed,
      };
    }
  } catch {
    // Continue to fallback check
  }

  // 3. General numeric fallback: Optional leading '+', followed by 9 to 15 digits
  if (/^\+?\d{9,15}$/.test(cleanDigits)) {
    return {
      isValid: true,
      error: null,
      sanitized: trimmed,
    };
  }

  return {
    isValid: false,
    error: "Please enter a valid phone number (e.g., +251 91 122 3344 or 0911223344).",
    sanitized: trimmed,
  };
}

/**
 * Gracefully formats or falls back a phone number for UI display
 * @param {string|null|undefined} phone
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export function formatPhoneDisplay(phone, fallback = "—") {
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return fallback;
  }
  return phone.trim();
}
