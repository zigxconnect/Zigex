import { api } from "./browser-client";
import { ApiClientError } from "./errors";
import {
  applicationKind,
  hydrateApplications,
  normaliseApplication,
  type ApplicationKind,
  type ApplicationRow,
} from "./applications-shape";

/**
 * Browser-side access to the signed-in student's applications (GET /applications),
 * newest first. With `withPostings` (default) each row gets its internship /
 * program / event attached, fetching it from the feed when the backend omits it.
 */
export async function listMyApplications(
  kind?: ApplicationKind,
  { withPostings = true }: { withPostings?: boolean } = {}
): Promise<ApplicationRow[]> {
  const res = await api.get<ApplicationRow[]>("/applications");
  const rows = (res.data ?? []).filter((row) => !kind || applicationKind(row) === kind);

  const result = withPostings
    ? await hydrateApplications(rows, async (path, id) => {
        try {
          return (await api.get<Record<string, any>>(`/feed/${path}/${encodeURIComponent(id)}`)).data;
        } catch (error) {
          if (error instanceof ApiClientError && error.status === 404) return null;
          throw error;
        }
      })
    : rows.map(normaliseApplication);

  return result.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}

/** PATCH /applications/{id}/withdraw — only allowed while pending or reviewed. */
export async function withdrawMyApplication(id: string): Promise<ApplicationRow> {
  return (await api.patch<ApplicationRow>(`/applications/${encodeURIComponent(id)}/withdraw`)).data;
}
