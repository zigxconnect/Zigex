/**
 * Redirect URL sanitization utilities.
 *
 * Centralizes all `next` / return-URL validation logic to prevent open-redirect
 * vulnerabilities. Every redirect that uses a user-supplied URL must pass through
 * `sanitizeRedirectUrl` before being used in a NextResponse.redirect() call.
 */

const ALLOWED_NEXT_PREFIXES = [
  "/feed",
  "/dashboard",
  "/programs",
  "/events",
  "/intern",
  "/student",
  "/profile",
  "/create-profile",
  "/profile-complete",
  "/update-password",
  "/notifications",
];

/**
 * Validates and returns a safe redirect path.
 *
 * Rules enforced:
 *  - Must be a non-empty string
 *  - Must start with `/` (relative path)
 *  - Must NOT start with `//` (protocol-relative — allows host injection)
 *  - Must NOT contain a protocol pattern like `https:` or `javascript:`
 *  - Must match one of the known-safe path prefixes in ALLOWED_NEXT_PREFIXES
 *
 * If any rule fails, the fallback path is returned instead.
 *
 * @param next       The candidate redirect URL (may be null / undefined)
 * @param fallback   The safe fallback to use when `next` is rejected (default: "/dashboard")
 * @returns          A validated, safe relative URL string
 */
export function sanitizeRedirectUrl(
  next: string | null | undefined,
  fallback = "/feed"
): string {
  if (!next || typeof next !== "string") return fallback;

  // Trim whitespace that could mask invalid prefixes
  const trimmed = next.trim();

  // Must start with a single slash — never allow protocol-relative (`//`) or absolute URLs
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;

  // Reject anything that smells like a protocol (e.g. `javascript:`, `data:`, `https:`)
  if (/[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed)) return fallback;

  // Must match one of the approved path prefixes
  const isAllowed = ALLOWED_NEXT_PREFIXES.some(
    (prefix) =>
      trimmed === prefix ||
      trimmed.startsWith(prefix + "/") ||
      trimmed.startsWith(prefix + "?")
  );

  return isAllowed ? trimmed : fallback;
}

/**
 * Reads the `next` query parameter from the current browser URL and returns a
 * sanitized redirect path. Safe to call in client-side code only.
 *
 * @param fallback  The safe fallback when the param is absent or invalid
 * @returns         A validated, safe relative URL string
 */
export function getReturnUrl(fallback = "/feed"): string {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  return sanitizeRedirectUrl(params.get("next"), fallback);
}
