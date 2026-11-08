import type { MetadataRoute } from "next";
import { listPublicFeed, type FeedKind } from "@/lib/api/services/feed";
import { SITE_URL } from "@/lib/seo";
import { listPublicProfileUsernames } from "@/lib/api/services/public-profile";
import { listAllOutsourced } from "@/lib/api/services/outsourced";
import { slugifyUsername } from "@/lib/utils";
import { publicPostingPath } from "@/lib/postings";

// Rebuilt at most once an hour; the feed lists it reads are cached anyway.
export const revalidate = 3600;

const KINDS: FeedKind[] = ["internships", "programs", "events"];

/**
 * Public pages only: home, Explore, privacy, every open opportunity
 * (/feed/<name>, the shareable address), every company with one and every
 * student profile its owner made public.
 * Signed-in pages aren't listed; robots.txt keeps crawlers out of them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/opportunities`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const lists = await Promise.allSettled(KINDS.map((kind) => listPublicFeed(kind)));
  const companies = new Set<string>();
  for (const result of lists) {
    if (result.status !== "fulfilled") continue;
    for (const row of result.value) {
      if (!row?.id) continue;
      const updated = row.updated_at ?? row.created_at;
      pages.push({
        url: `${SITE_URL}${publicPostingPath(row)}`,
        ...(updated && { lastModified: new Date(updated) }),
        changeFrequency: "weekly",
        priority: 0.8,
      });
      const companyId = row.company_id ?? row.company_profiles?.id ?? row.company?.id;
      if (companyId) companies.add(String(companyId));
    }
  }
  for (const id of companies) {
    pages.push({ url: `${SITE_URL}/company/${encodeURIComponent(id)}`, changeFrequency: "weekly", priority: 0.5 });
  }
  // Opportunities Zigex shares from other organisers.
  for (const o of await listAllOutsourced().catch(() => [])) {
    pages.push({ url: `${SITE_URL}/opportunities/${encodeURIComponent(o.slug || o.id)}`, changeFrequency: "weekly", priority: 0.7 });
  }
  // Students who made their profile public, so a search for their name finds it.
  for (const p of await listPublicProfileUsernames()) {
    pages.push({
      url: `${SITE_URL}/profile/${encodeURIComponent(slugifyUsername(p.username))}`,
      ...(p.updated_at && { lastModified: new Date(p.updated_at) }),
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }
  return pages;
}
