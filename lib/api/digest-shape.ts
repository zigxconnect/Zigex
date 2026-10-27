/**
 * The AI service's weekly digest (GET /v1/digests/student/{id}), as the UI
 * shows it.
 *
 * Shape from zigxconnect/zila-knowledge-base-with-search, app/core/digest_agent.py
 * (build_digest). Items are opportunities found on the web for the student's
 * segment (department + location), not Zigex postings: every item links out to
 * the organiser's site. The service only returns digests whose status is
 * "published"; anything else is a 404.
 */

export type DigestItem = {
  key: string;
  title: string;
  summary: string | null;
  /** Why it fits this student's group (`why_relevant`). */
  reason: string | null;
  /** internship, job, hackathon, scholarship, conference, workshop, fellowship, competition, other */
  category: string | null;
  eventDate: string | null;
  deadline: string | null;
  location: string | null;
  url: string;
  /** Site the link goes to, e.g. "mtn.cm". */
  domain: string;
  image: { url: string; caption: string; credit: string | null } | null;
};

export type Digest = {
  week: string | null;
  weekLabel: string | null;
  headline: string | null;
  intro: string | null;
  generatedAt: string | null;
  items: DigestItem[];
};

type Row = Record<string, unknown>;

const isRow = (v: unknown): v is Row => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.replace(/\s+/g, " ").trim() : null);
const httpUrl = (v: unknown): string | null => {
  const s = str(v);
  return s && /^https?:\/\//i.test(s) ? s : null;
};

/** "2026-W43" → "Week of 19 Oct"; any other value is shown as is. */
export function weekLabel(week: string | null): string | null {
  if (!week) return null;
  const m = /^(\d{4})-?W(\d{1,2})$/i.exec(week.trim());
  if (!m) return week;
  const [year, num] = [Number(m[1]), Number(m[2])];
  // Monday of ISO week 1 is the Monday on or before 4 January.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (num - 1) * 7);
  return `Week of ${monday.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}`;
}

function toItem(raw: unknown, index: number): DigestItem | null {
  if (!isRow(raw)) return null;
  const title = str(raw.title);
  const url = httpUrl(raw.url);
  // The service always sets both; without a link the item can't be acted on.
  if (!title || !url) return null;

  const imageUrl = httpUrl(raw.image_url);
  let domain = str(raw.domain);
  if (!domain) {
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      domain = url;
    }
  }

  return {
    key: `${index}-${url}`,
    title,
    summary: str(raw.summary),
    reason: str(raw.why_relevant),
    category: str(raw.category),
    eventDate: str(raw.event_date),
    deadline: str(raw.deadline),
    location: str(raw.location),
    url,
    domain,
    image: imageUrl ? { url: imageUrl, caption: str(raw.image_caption) ?? title, credit: str(raw.image_credit) } : null,
  };
}

/** Null when the response holds nothing the student can read. */
export function toDigest(raw: unknown): Digest | null {
  if (!isRow(raw)) return null;
  const items = (Array.isArray(raw.items) ? raw.items : []).map(toItem).filter((i): i is DigestItem => i !== null);
  if (items.length === 0) return null;

  const week = str(raw.week);
  return {
    week,
    weekLabel: weekLabel(week),
    headline: str(raw.headline),
    intro: str(raw.intro),
    generatedAt: str(raw.generated_at),
    items,
  };
}

const shortDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** "Closes 3 Nov" / "Closes tomorrow" / "Closed" from the item's ISO deadline. */
export function deadlineLabel(deadline: string | null, now = new Date()): { text: string; urgent: boolean; past: boolean } | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return { text: deadline, urgent: false, past: false };
  const days = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return { text: "Closed", urgent: false, past: true };
  if (days === 0) return { text: "Closes today", urgent: true, past: false };
  if (days === 1) return { text: "Closes tomorrow", urgent: true, past: false };
  return { text: days <= 7 ? `Closes in ${days} days` : `Closes ${shortDate(date)}`, urgent: days <= 7, past: false };
}

/** "On 12 Nov" for events, conferences and hackathons. */
export function eventDateLabel(eventDate: string | null): string | null {
  if (!eventDate) return null;
  const date = new Date(eventDate);
  return Number.isNaN(date.getTime()) ? eventDate : `On ${shortDate(date)}`;
}
