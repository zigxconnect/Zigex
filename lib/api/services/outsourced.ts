import "server-only";
import { ApiClientError, parseResponse } from "../errors";
import { usableImageUrl } from "@/lib/images";
import type { OutsourcedFilters, OutsourcedSection } from "@/lib/outsourced-filters";

export { OUTSOURCED_SECTIONS, type OutsourcedSection } from "@/lib/outsourced-filters";

/**
 * Opportunities Zigex shares but doesn't manage (summits, foreign programs,
 * fellowships), from the admin API's public routes. Students apply on the
 * organiser's own site. Guide: docs/backend/2026-11-07-outsourced-opportunities.md
 * in the Zigex-admin repo.
 */
const ADMIN_API_URL = (process.env.ADMIN_API_URL ?? "https://adminapi.zigexconnect.com").replace(/\/$/, "");
const TIMEOUT_MS = 10_000;

export type OutsourcedOpportunity = {
  id: string;
  /** Readable address ("cern-short-term-internship-in-switzerland"). */
  slug: string | null;
  section: OutsourcedSection;
  type: string;
  title: string;
  organization: string;
  description: string;
  country: string;
  city: string | null;
  is_local: boolean;
  funding: string;
  apply_url: string;
  deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  is_open: boolean;
  created_at?: string | null;
};

export type OutsourcedCounts = Record<OutsourcedSection, number>;
export type OutsourcedPage = {
  items: OutsourcedOpportunity[];
  total: number;
  page: number;
  total_pages: number;
  /** How many match the other filters in each section, for the tab numbers. */
  counts?: OutsourcedCounts;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${ADMIN_API_URL}/api/public/opportunities${path}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return (await parseResponse<T>(res)).data as T;
}

/** A link students can follow: only http(s), so a bad value can never run script. */
function safeLink(url: unknown) {
  try {
    const parsed = new URL(String(url));
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
  } catch {
    return "";
  }
}

const clean = (row: OutsourcedOpportunity): OutsourcedOpportunity => ({
  ...row,
  apply_url: safeLink(row.apply_url),
  cover_image_url: usableImageUrl(row.cover_image_url),
});

/** The API sorts Cameroon first, then the soonest deadline: keep its order. */
export async function listOutsourced(filters: OutsourcedFilters): Promise<OutsourcedPage> {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: "24" });
  if (filters.section) params.set("section", filters.section);
  if (filters.local !== null) params.set("local", String(filters.local));
  if (filters.funding) params.set("funding", filters.funding);
  if (filters.type) params.set("type", filters.type);
  if (filters.q) params.set("q", filters.q);
  const data = await get<OutsourcedPage>(`?${params}`);
  return { ...data, items: data.items.map(clean) };
}

/** Every open one (at most 150), for the main opportunities board and the landing page. */
export async function listAllOutsourced(): Promise<OutsourcedOpportunity[]> {
  const items: OutsourcedOpportunity[] = [];
  for (let page = 1; page <= 3; page++) {
    const data = await get<OutsourcedPage>(`?page=${page}&pageSize=50`);
    items.push(...data.items.map(clean));
    if (page >= data.total_pages) break;
  }
  return items;
}

export async function getOutsourced(id: string): Promise<OutsourcedOpportunity | null> {
  try {
    return clean(await get<OutsourcedOpportunity>(`/${encodeURIComponent(id)}`));
  } catch (error) {
    // Unknown ids and drafts answer 404; anything else is a real failure, not "not found".
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}
