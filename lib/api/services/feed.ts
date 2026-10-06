import "server-only";
import { serverApi } from "../server-client";
import { ApiClientError } from "../errors";
import { normaliseFeedItem as normalise } from "../feed-shape";

/** Feed reads from the backend (GET /feed/internships|programs|events). */

export type FeedKind = "internships" | "programs" | "events";

// Untyped until the backend documents its response bodies (see feed-shape.ts).
export type FeedRow = { id: string; title: string; [column: string]: any };

const PAGE_LIMIT = 100;
// Safety cap: the feed renders everything at once, like the old Supabase query.
const MAX_PAGES = 5;

/** Signed-out visitors get 401 from the backend; treat that as an empty feed. */
function isUnauthorized(error: unknown) {
  return error instanceof ApiClientError && error.status === 401;
}

export async function listFeed(kind: FeedKind, search?: string, companyId?: string): Promise<FeedRow[]> {
  const rows: FeedRow[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
    if (search) params.set("search", search);
    // Spec'd filter; until the backend applies it, callers filter by company_id themselves.
    if (companyId) params.set("companyId", companyId);

    try {
      const res = await serverApi.get<FeedRow[]>(`/feed/${kind}?${params}`);
      rows.push(...(res.data ?? []).map(normalise));
      if (!res.meta || page >= res.meta.totalPages) break;
    } catch (error) {
      if (isUnauthorized(error)) return [];
      throw error;
    }
  }
  return rows;
}

export async function getFeedItem(kind: FeedKind, id: string): Promise<FeedRow | null> {
  try {
    const res = await serverApi.get<FeedRow>(`/feed/${kind}/${encodeURIComponent(id)}`);
    return res.data ? normalise(res.data) : null;
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 404 || error.status === 401)) return null;
    throw error;
  }
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Detail pages are linked by UUID or by a slug of the title. The backend only
 * looks up by id, so a slug is resolved by searching each feed for the title.
 */
export async function findFeedItemBySlug(slug: string): Promise<{ kind: FeedKind; item: FeedRow } | null> {
  const search = slug.replace(/-/g, " ").trim();
  const kinds: FeedKind[] = ["internships", "programs", "events"];

  const results = await Promise.all(kinds.map((kind) => listFeed(kind, search).catch(() => [])));
  for (const [i, rows] of results.entries()) {
    const exact = rows.find((row) => row.title && slugify(row.title) === slug.toLowerCase());
    const item = exact ?? rows[0];
    if (item) return { kind: kinds[i], item };
  }
  return null;
}

/** Other listings from the same company (GET /feed/{kind}?companyId=, filtered here too). */
export async function listCompanyFeed(kind: FeedKind, companyId: string, excludeId?: string, limit = 6) {
  const rows = await listFeed(kind, undefined, companyId);
  return rows.filter((row) => row.company_id === companyId && row.id !== excludeId).slice(0, limit);
}
