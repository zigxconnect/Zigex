import { usableImageUrl } from "@/lib/images";
import type { FeedKind, FeedRow } from "@/lib/api/services/feed";

/** One opportunity, flattened for the /feed board (no per-type branching in the UI). */
export type BoardItem = {
  id: string;
  kind: FeedKind;
  title: string;
  companyName: string;
  companyLogo: string | null;
  companyVerified: boolean;
  /** Cover photo for the card (each type stores it in its own column). */
  image: string | null;
  location: string | null;
  workMode: "remote" | "onsite" | "hybrid" | null;
  /** The date that matters most: when applications close, else when it starts. */
  closesAt: string | null;
  startsAt: string | null;
  endsAt: string | null;
  /** The student pays to join ("paid" programs/internships charge a fee). */
  hasFee: boolean;
  priceXaf: number | null;
  postedAt: string | null;
  skills: string[];
};

const IMAGE_COLUMN: Record<FeedKind, string> = {
  internships: "cover_image_url",
  programs: "program_picture_url",
  events: "event_picture_url",
};

const WORK_MODES = new Set(["remote", "onsite", "hybrid"]);

export function toBoardItem(kind: FeedKind, row: FeedRow): BoardItem {
  const company = row.company ?? row.company_profiles ?? null;
  const mode = typeof row.type === "string" ? row.type.toLowerCase() : null;
  return {
    id: row.id,
    kind,
    title: row.title,
    companyName: company?.company_name ?? "Zigex partner",
    companyLogo: usableImageUrl(company?.logo_url),
    companyVerified: Boolean(company?.is_verified),
    image: typeof row[IMAGE_COLUMN[kind]] === "string" && row[IMAGE_COLUMN[kind]] ? row[IMAGE_COLUMN[kind]] : null,
    location: row.location ?? row.venue ?? null,
    workMode: mode && WORK_MODES.has(mode) ? (mode as BoardItem["workMode"]) : null,
    closesAt: row.deadline ?? row.application_deadline ?? null,
    startsAt: row.start_date ?? null,
    endsAt: row.end_date ?? null,
    hasFee: Boolean(row.is_paid),
    priceXaf: typeof row.price_xaf === "number" ? row.price_xaf : null,
    postedAt: row.created_at ?? null,
    skills: Array.isArray(row.required_skills) ? row.required_skills.filter(Boolean).slice(0, 3) : [],
  };
}

/** Closed: applications ended, or the event/program already finished. */
export function isClosed(item: BoardItem, now = Date.now()): boolean {
  if (item.closesAt) return new Date(item.closesAt).getTime() < now;
  if (item.kind === "events" && item.startsAt) return new Date(item.startsAt).getTime() < now - 24 * 60 * 60 * 1000;
  return false;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY_MS);
}

/** The one date line a student cares about for this item. */
export function timing(item: BoardItem): { text: string; urgent: boolean } | null {
  if (item.closesAt) {
    const days = daysFromNow(item.closesAt);
    if (days < 0) return { text: "Closed", urgent: false };
    return { text: days === 0 ? "Closes today" : `Closes in ${days} day${days === 1 ? "" : "s"}`, urgent: days <= 7 };
  }
  if (item.startsAt) {
    const date = new Date(item.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return { text: daysFromNow(item.startsAt) < 0 ? `Started ${date}` : `Starts ${date}`, urgent: false };
  }
  return null;
}

export function postedAgo(date: string | null) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
}
