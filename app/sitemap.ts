import type { MetadataRoute } from "next";
import { listPublicFeed, type FeedKind } from "@/lib/api/services/feed";
import { SITE_URL } from "@/lib/seo";

// Rebuilt at most once an hour; the feed lists it reads are cached anyway.
export const revalidate = 3600;

const KINDS: FeedKind[] = ["internships", "programs", "events"];

/**
 * Public pages only: home, Explore, privacy, every open opportunity
 * (/feed/<id>, the shareable address) and every company with one.
 * Signed-in pages aren't listed; robots.txt keeps crawlers out of them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const lists = await Promise.allSettled(KINDS.map((kind) => listPublicFeed(kind)));
  const companies = new Set<string>();
  for (const result of lists) {
    if (result.status !== "fulfilled") continue;
    for (const row of result.value) {
      if (!row?.id) continue;
      const updated = row.updated_at ?? row.created_at;
      pages.push({
        url: `${SITE_URL}/feed/${encodeURIComponent(row.id)}`,
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
  return pages;
}
