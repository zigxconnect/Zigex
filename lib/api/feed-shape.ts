/**
 * The backend reads the old Supabase tables, so feed rows keep their column
 * names. The joined company was exposed as `company` (lists) or
 * `company_profiles` (details) by the old queries; give every item both so
 * existing components keep working.
 *
 * TODO(backend): response bodies are undocumented in Swagger. When schemas
 * are published, adjust this one function.
 */
export function normaliseFeedItem<T extends Record<string, any>>(row: T): T & { company: any; company_profiles: any } {
  const company = row.company ?? row.company_profiles ?? row.company_profile ?? null;
  return { ...row, company, company_profiles: company };
}
