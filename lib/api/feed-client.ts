import { api } from "./browser-client";
import { normaliseFeedItem } from "./feed-shape";

/**
 * A company's programs, for the "more from this company" sections.
 * TODO(backend): no company filter on GET /feed/programs yet, so we filter here.
 */
export async function fetchCompanyPrograms(companyId: string | undefined) {
  if (!companyId) return [];
  const res = await api.get<Record<string, any>[]>("/feed/programs?limit=100");
  return (res.data ?? []).map(normaliseFeedItem).filter((p) => p.company_id === companyId);
}
