/**
 * URL Guard Utility
 *
 * Detects URL patterns (http:// or https://) in input values.
 * Used to prevent URLs from being entered in non-URL fields.
 */

const URL_PATTERN = /https?:\/\//i;

/**
 * Checks if a string contains a URL (http:// or https://).
 */
export function containsUrl(value: string): boolean {
    return URL_PATTERN.test(value);
}

/**
 * Zod-compatible refinement: returns true if the value does NOT contain a URL.
 * Usage: z.string().refine(noUrl, URL_NOT_ALLOWED_MESSAGE)
 */
export function noUrl(value: string): boolean {
    return !containsUrl(value);
}

/**
 * Error message shown when a URL is detected in a non-URL input field.
 */
export const URL_NOT_ALLOWED_MESSAGE = "URLs are not allowed in this field";
