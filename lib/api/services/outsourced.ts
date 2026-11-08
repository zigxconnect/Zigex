import "server-only";
import { ApiClientError, parseResponse } from "../errors";
import { usableImageUrl } from "@/lib/images";

/**
 * Opportunities Zigex shares but doesn't manage (summits, foreign programs,
 * fellowships), from the admin API's public routes. Students apply on the
 * organiser's own site. Guide: docs/backend/2026-11-07-outsourced-opportunities.md
 * in the Zigex-admin repo.
 */
const ADMIN_API_URL = (process.env.ADMIN_API_URL ?? "https://adminapi.zigexconnect.com").replace(/\/$/, "");
const TIMEOUT_MS = 10_000;

export const OUTSOURCED_SECTIONS = ["general", "foreign", "fellowship"] as const;
export type OutsourcedSection = (typeof OUTSOURCED_SECTIONS)[number];

export type OutsourcedOpportunity = {
  id: string;
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
};

export type OutsourcedPage = { items: OutsourcedOpportunity[]; total: number; page: number; total_pages: number };

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
export async function listOutsourced(section: OutsourcedSection | null, page: number): Promise<OutsourcedPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: "24" });
  if (section) params.set("section", section);
  const data = await get<OutsourcedPage>(`?${params}`);
  return { ...data, items: data.items.map(clean) };
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
