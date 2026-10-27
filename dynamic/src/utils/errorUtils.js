/**
 * errorUtils.js
 * 
 * Dynamic error extraction utility for API responses across Finance, Property, and Admin modules.
 * Standardizes error passthrough from Axios error responses (error.response?.data?.message),
 * Fetch/apiClient errors (error.data?.message), and NestJS class-validator arrays.
 */

/**
 * Dynamically extract the exact validation or error message from backend API responses.
 * If the backend sends an array of validation errors, parses it and returns the primary message.
 *
 * @param {any} error - Caught error object from API call
 * @param {string} [fallback] - Fallback message if extraction fails
 * @returns {string} Clean, dynamically extracted error string
 */
export function extractErrorMessage(error, fallback = "Operation failed. Please check your inputs and try again.") {
  if (!error) return fallback;

  // 1. Check Axios response data or apiClient data
  const data = error.response?.data ?? error.data;

  if (data) {
    const rawMsg = data.message ?? data.error ?? data.detail;

    if (rawMsg !== undefined && rawMsg !== null) {
      // If the backend sends an array of validation errors, parse it and display the primary message
      if (Array.isArray(rawMsg)) {
        const first = rawMsg.find((m) => typeof m === "string" && m.trim().length > 0);
        if (first) return first.trim();
        if (rawMsg.length > 0) return String(rawMsg[0]);
      } else if (typeof rawMsg === "string" && rawMsg.trim()) {
        return rawMsg.trim();
      } else if (typeof rawMsg === "object") {
        return JSON.stringify(rawMsg);
      }
    }

    // If data itself is a string message
    if (typeof data === "string" && data.trim() && !data.startsWith("<")) {
      return data.trim();
    }
  }

  // 2. Standard Error instance message
  if (typeof error.message === "string" && error.message.trim() && !error.message.startsWith("<")) {
    return error.message.trim();
  }

  // 3. String error
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return fallback;
}
