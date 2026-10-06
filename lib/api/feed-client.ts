import { api } from "./browser-client";
import { normaliseFeedItem } from "./feed-shape";

/**
 * A company's programs, for the "more from this company" sections.
 * Uses the spec'd `companyId` filter, and filters here too until the backend applies it.
 */
export async function fetchCompanyPrograms(companyId: string | undefined) {
  if (!companyId) return [];
  const res = await api.get<Record<string, any>[]>(`/feed/programs?limit=100&companyId=${encodeURIComponent(companyId)}`);
  return (res.data ?? []).map(normaliseFeedItem).filter((p) => p.company_id === companyId);
}
