/**
 * Filters for More opportunities (/opportunities), shared by the page and its
 * filter bar. They live in the address, so a filtered list can be shared.
 */

export const OUTSOURCED_SECTIONS = ["general", "foreign", "fellowship"] as const;
export type OutsourcedSection = (typeof OUTSOURCED_SECTIONS)[number];

export const OUTSOURCED_FUNDING = ["fully_funded", "partially_funded", "paid", "unpaid"] as const;
export const OUTSOURCED_TYPES = ["internship", "program", "scholarship", "fellowship", "competition", "conference", "grant", "training", "job", "other"] as const;

export type OutsourcedFilters = {
  section: OutsourcedSection | null;
  local: boolean | null;
  funding: (typeof OUTSOURCED_FUNDING)[number] | null;
  type: (typeof OUTSOURCED_TYPES)[number] | null;
  q: string;
  page: number;
};

const pick = <T extends string>(list: readonly T[], value: unknown): T | null => list.find((v) => v === value) ?? null;

/** Filters from the page address; anything unknown is ignored. */
export function readOutsourcedFilters(query: Record<string, string | string[] | undefined>): OutsourcedFilters {
  const one = (key: string) => (Array.isArray(query[key]) ? query[key]![0] : query[key]) ?? "";
  return {
    section: pick(OUTSOURCED_SECTIONS, one("section")),
    local: one("local") === "true" ? true : one("local") === "false" ? false : null,
    funding: pick(OUTSOURCED_FUNDING, one("funding")),
    type: pick(OUTSOURCED_TYPES, one("type")),
    q: one("q").trim().slice(0, 100),
    page: Math.max(1, Number.parseInt(one("page"), 10) || 1),
  };
}

/** The same filters as an address, so a filtered list can be shared. */
export function outsourcedHref(filters: Partial<OutsourcedFilters>) {
  const params = new URLSearchParams();
  if (filters.section) params.set("section", filters.section);
  if (filters.local !== null && filters.local !== undefined) params.set("local", String(filters.local));
  if (filters.funding) params.set("funding", filters.funding);
  if (filters.type) params.set("type", filters.type);
  if (filters.q) params.set("q", filters.q);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/opportunities?${query}` : "/opportunities";
}
