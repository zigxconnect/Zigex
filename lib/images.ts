/**
 * Image addresses that can't load in a browser: the backend currently returns
 * upload URLs on an unconfigured host ("https://pub-REPLACE.r2.dev/…"), and
 * those were saved on some profiles. Treat them as "no image" so people see
 * their initials instead of a broken picture. Reported in
 * docs/backend/open-requests.md (Uploads).
 */
/**
 * TEMPORARY (8 Oct 2026): the backend rewrote stored links to
 * files.zigexconnect.com, but that name has no DNS record yet (the domain's
 * DNS is at Hostinger, so the R2 custom domain was never created). The same
 * files are served by the bucket's r2.dev address. Remove once
 * https://files.zigexconnect.com/... loads in a browser.
 */
const FILES_HOST_FALLBACK = { from: "https://files.zigexconnect.com/", to: "https://pub-1dcd0f5533e34efc96bdebb29d58437b.r2.dev/" };

export function usableImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;
  if (/pub-REPLACE|REPLACE_ME|example\.com/i.test(u)) return null;
  if (!/^https?:\/\//i.test(u) && !u.startsWith("/")) return null;
  if (u.startsWith(FILES_HOST_FALLBACK.from)) return FILES_HOST_FALLBACK.to + u.slice(FILES_HOST_FALLBACK.from.length);
  return u;
}
