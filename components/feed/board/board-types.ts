import { usableImageUrl } from "@/lib/images";
import { externalUrl } from "@/lib/postings";
import type { FeedKind, FeedRow } from "@/lib/api/services/feed";
import type { OutsourcedOpportunity } from "@/lib/api/services/outsourced";
import { placeLabel, typeLabel } from "@/components/outsourced/outsourced-labels";

/** Zigex postings by type, plus opportunities Zigex shares from other organisers. */
export type BoardKind = FeedKind | "outsourced";
import { daysUntil, isPast } from "@/lib/utils/deadline";

/** One opportunity, flattened for the /feed board (no per-type branching in the UI). */
export type BoardItem = {
  id: string;
  /** Readable address ("cern-short-term-internship-in-switzerland"); null until the backend has one. */
  slug: string | null;
  kind: BoardKind;
  /** What it is, when the kind alone doesn't say ("Fellowship", "Summit or conference"). */
  typeLabel?: string;
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
  /**
   * Set when students apply on the organiser's own site: Apply opens it, and
   * Zigex doesn't take or manage the application.
   */
  applyUrl: string | null;
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
    slug: typeof row.slug === "string" && row.slug ? row.slug : null,
    kind,
    title: row.title,
    companyName: company?.company_name ?? "Zigex partner",
    companyLogo: usableImageUrl(company?.logo_url),
    companyVerified: Boolean(company?.is_verified),
    image: usableImageUrl(row[IMAGE_COLUMN[kind]]),
    location: row.location ?? row.venue ?? null,
    workMode: mode && WORK_MODES.has(mode) ? (mode as BoardItem["workMode"]) : null,
    closesAt: row.deadline ?? row.application_deadline ?? null,
    startsAt: row.start_date ?? null,
    endsAt: row.end_date ?? null,
    hasFee: Boolean(row.is_paid),
    priceXaf: typeof row.price_xaf === "number" ? row.price_xaf : null,
    postedAt: row.created_at ?? null,
    skills: Array.isArray(row.required_skills) ? row.required_skills.filter(Boolean).slice(0, 3) : [],
    applyUrl: externalUrl(row.application_url ?? row.apply_url ?? row.external_apply_url ?? (kind === "events" ? row.registration_link : null)),
  };
}

/**
 * An opportunity another organiser runs, shown with Zigex's own: it opens at
 * /opportunities/<name>, and Apply goes to the organiser's site.
 */
export function fromOutsourced(o: OutsourcedOpportunity): BoardItem {
  return {
    id: o.id,
    slug: o.slug,
    kind: "outsourced",
    typeLabel: typeLabel(o.type) || undefined,
    title: o.title,
    companyName: o.organization,
    companyLogo: null,
    companyVerified: false,
    image: o.cover_image_url,
    location: placeLabel(o) || null,
    workMode: null,
    closesAt: o.deadline,
    startsAt: o.start_date,
    endsAt: o.end_date,
    hasFee: false,
    priceXaf: null,
    postedAt: o.created_at ?? null,
    skills: [],
    applyUrl: o.apply_url || null,
  };
}

/** Closed: applications ended, or the event/program already finished. */
export function isClosed(item: BoardItem, now = Date.now()): boolean {
  if (item.closesAt) return isPast(item.closesAt, new Date(now));
  if (item.kind === "events" && item.startsAt) return new Date(item.startsAt).getTime() < now - 24 * 60 * 60 * 1000;
  return false;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The one date line a student cares about for this item. */
export function timing(item: BoardItem): { text: string; urgent: boolean } | null {
  if (item.closesAt) {
    const days = daysUntil(item.closesAt) ?? 0;
    if (days < 0) return { text: "Closed", urgent: false };
    return { text: days === 0 ? "Closes today" : `Closes in ${days} day${days === 1 ? "" : "s"}`, urgent: days <= 7 };
  }
  if (item.startsAt) {
    const date = new Date(item.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return { text: (daysUntil(item.startsAt) ?? 0) < 0 ? `Started ${date}` : `Starts ${date}`, urgent: false };
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
