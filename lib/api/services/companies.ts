import "server-only";
import { serverApi } from "../server-client";
import { ApiClientError, whenAvailable } from "../errors";
import { listFeed, type FeedKind } from "./feed";

/**
 * Public company pages (the Oct 2026 backend endpoint request → Discovery and
 * social): GET /companies, GET /companies/{id}, and the feed's companyId
 * filter for their listings. Empty until deployed.
 */

export type CompanyRow = Record<string, any> & { id: string; company_name: string };

export async function listCompanies(): Promise<CompanyRow[]> {
  return whenAvailable(async () => (await serverApi.get<CompanyRow[]>("/companies?limit=100")).data ?? [], []);
}

export async function getCompany(id: string): Promise<CompanyRow | null> {
  try {
    return await whenAvailable(
      async () => (await serverApi.get<CompanyRow>(`/companies/${encodeURIComponent(id)}`)).data ?? null,
      null
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

const POSTING_TYPE: Record<FeedKind, "Internship" | "Program" | "Event"> = {
  internships: "Internship",
  programs: "Program",
  events: "Event",
};

const IMAGE_FIELD: Record<FeedKind, string> = {
  internships: "cover_image_url",
  programs: "program_picture_url",
  events: "event_picture_url",
};

function isOpen(row: Record<string, any>) {
  const end = row.deadline ?? row.end_date;
  if (!end) return true;
  const date = new Date(end);
  date.setHours(23, 59, 59, 999);
  return date >= new Date();
}

/** A company's postings, newest first, shaped like the old company page expected. */
export async function getCompanyPostings(companyId: string) {
  const kinds: FeedKind[] = ["internships", "programs", "events"];
  const lists = await Promise.all(kinds.map((kind) => listFeed(kind, undefined, companyId).catch(() => [])));

  const postings = lists
    .flatMap((rows, i) =>
      rows
        .filter((row) => row.company_id === companyId || row.company?.id === companyId)
        .map((row) => ({ row, kind: kinds[i] }))
    )
    .sort((a, b) => new Date(b.row.created_at).getTime() - new Date(a.row.created_at).getTime())
    .map(({ row, kind }) => ({
      id: row.id,
      title: row.title,
      type: POSTING_TYPE[kind],
      createdAt: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: isOpen(row) ? "Active" : "Expired",
      // Optional count the backend may embed; not exposed otherwise.
      applicantCount: row.applications_count ?? 0,
      imageUrl: row[IMAGE_FIELD[kind]],
    }));

  return {
    postings,
    stats: {
      total: postings.length,
      active: postings.filter((p) => p.status === "Active").length,
      applications: postings.reduce((sum, p) => sum + p.applicantCount, 0),
    },
  };
}
