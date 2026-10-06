import type { FeedKind, FeedRow } from "@/lib/api/services/feed";

/** One opportunity, flattened for the /feed board (no per-type branching in the UI). */
export type BoardItem = {
  id: string;
  kind: FeedKind;
  title: string;
  companyName: string;
  companyLogo: string | null;
  companyVerified: boolean;
  location: string | null;
  workMode: "remote" | "onsite" | "hybrid" | null;
  /** The date that matters most: when applications close, else when it starts. */
  closesAt: string | null;
  startsAt: string | null;
  /** The student pays to join ("paid" programs/internships charge a fee). */
  hasFee: boolean;
  priceXaf: number | null;
  postedAt: string | null;
  skills: string[];
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
    companyLogo: company?.logo_url ?? null,
    companyVerified: Boolean(company?.is_verified),
    location: row.location ?? row.venue ?? null,
    workMode: mode && WORK_MODES.has(mode) ? (mode as BoardItem["workMode"]) : null,
    closesAt: row.deadline ?? row.application_deadline ?? null,
    startsAt: row.start_date ?? null,
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
