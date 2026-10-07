/**
 * Image addresses that can't load in a browser: the backend currently returns
 * upload URLs on an unconfigured host ("https://pub-REPLACE.r2.dev/…"), and
 * those were saved on some profiles. Treat them as "no image" so people see
 * their initials instead of a broken picture. Reported in
 * docs/backend/open-requests.md (Uploads).
 */
export function usableImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;
  if (/pub-REPLACE|REPLACE_ME|example\.com/i.test(u)) return null;
  if (!/^https?:\/\//i.test(u) && !u.startsWith("/")) return null;
  return u;
}
