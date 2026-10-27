/**
 * One rule for "is this still open?" everywhere (board, detail page, program
 * cards): a deadline date is open until the end of that day in Cameroon.
 *
 * The backend sends dates as "2026-11-01" or "2026-11-01T00:00:00.000Z";
 * read as an instant, that is midnight UTC, so the board used to call the
 * last day "Closed" while the detail page still said open.
 */

const TZ = "Africa/Douala";

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** "YYYY-MM-DD" of an instant, in Cameroon. */
const cameroonDay = (d: Date) => dayFormat.format(d);

/** The calendar day a backend date means, or null when unreadable. */
export function deadlineDay(value: string | null | undefined): string | null {
  if (!value) return null;
  // A date, or a date stored at midnight UTC, means that calendar day.
  const m = /^(\d{4}-\d{2}-\d{2})(?:$|T00:00(?::00(?:\.0+)?)?(?:Z|\+00:00)?$)/.exec(value.trim());
  if (m) return m[1];
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : cameroonDay(d);
}

/** Calendar days from today (Cameroon) to that day: 0 = today, -1 = yesterday. */
export function daysUntil(value: string | null | undefined, now = new Date()): number | null {
  const day = deadlineDay(value);
  if (!day) return null;
  const [y, m, d] = day.split("-").map(Number);
  const [ty, tm, td] = cameroonDay(now).split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000);
}

/** True once the whole day has passed in Cameroon. Unreadable dates never close anything. */
export function isPast(value: string | null | undefined, now = new Date()): boolean {
  const days = daysUntil(value, now);
  return days !== null && days < 0;
}
