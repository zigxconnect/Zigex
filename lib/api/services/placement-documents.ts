import "server-only";
import { serverApi, serverApiRaw } from "../server-client";
import { ApiClientError, isEndpointMissing } from "../errors";
import { getFeedItem } from "./feed";
import { displayName, getMyProfile } from "./profile";
import { listLogs } from "./attendance";
import { isStub } from "../applications-shape";

/**
 * Data for the internship logbook and monthly receipt documents.
 *
 * Spec'd: GET /applications/{id}/logbook and /applications/{id}/receipt may
 * return a PDF (streamed through as-is) or JSON { student, internship,
 * company, supervisor?, logs[] } that our HTML templates render. Until they
 * ship, the same data is assembled from GET /applications/{id}, the
 * student's logs and GET /students/me — so the documents work today.
 *
 * The result keeps the shape the templates were written for (the old
 * Supabase rows): `app.internships.company_profiles`, `app.supervisor_profiles`.
 */

type DocumentData = {
  app: Record<string, any>;
  studentProfile: Record<string, any> | null;
  logs: Record<string, any>[];
};

export type PlacementDocument = { pdf: Response } | DocumentData | { error: number; message: string };

const enc = encodeURIComponent;

function fromDocumentJson(data: Record<string, any>): DocumentData {
  const internship = { ...(data.internship ?? {}), company_profiles: data.company ?? data.internship?.company ?? null };
  return {
    app: {
      ...(data.application ?? {}),
      internships: internship,
      supervisor_profiles: data.supervisor ?? null,
      duration: data.application?.duration ?? data.internship?.duration,
      payment_ledger: data.payment_ledger ?? data.application?.payment_ledger ?? [],
    },
    // The backend's full_name can be the sign-up placeholder ("Student"): prefer first + last name.
    studentProfile: data.student ? { ...data.student, full_name: displayName(data.student) || data.student.full_name } : null,
    logs: data.logs ?? [],
  };
}

async function fromExistingEndpoints(applicationId: string, withLogs: boolean): Promise<PlacementDocument> {
  let app: Record<string, any>;
  try {
    app = (await serverApi.get<Record<string, any>>(`/applications/${enc(applicationId)}`)).data;
  } catch (error) {
    if (error instanceof ApiClientError && [401, 403, 404].includes(error.status)) {
      return { error: error.status, message: error.status === 404 ? "Application not found" : "Access Forbidden" };
    }
    throw error;
  }

  const internshipId = app.internship_id ?? app.internship?.id;
  const [internship, studentProfile, logs] = await Promise.all([
    // A stub ({ id, title }) isn't enough for the documents: load the full posting.
    [app.internship, app.internships].find((o) => o && !isStub(o)) ?? (internshipId ? getFeedItem("internships", internshipId) : null),
    getMyProfile(),
    withLogs && internshipId ? listLogs(internshipId).catch(() => []) : [],
  ]);

  return {
    app: {
      ...app,
      internships: internship ? { ...internship, company_profiles: internship.company_profiles ?? internship.company ?? app.company_profiles ?? null } : null,
      supervisor_profiles: app.supervisor_profiles ?? app.supervisor ?? null,
    },
    studentProfile,
    logs: [...logs].sort((a, b) => String(a.log_date ?? "").localeCompare(String(b.log_date ?? ""))),
  };
}

export async function loadPlacementDocument(
  applicationId: string,
  kind: "logbook" | "receipt",
  search = ""
): Promise<PlacementDocument> {
  const res = await serverApiRaw(`/applications/${enc(applicationId)}/${kind}${search}`);
  const contentType = res.headers.get("content-type") ?? "";

  if (res.ok && contentType.includes("application/pdf")) return { pdf: res };
  if (res.ok) return fromDocumentJson(((await res.json()) as { data?: Record<string, any> }).data ?? {});

  const body = await res.json().catch(() => null);
  const error = new ApiClientError(res.status, body?.error?.message ?? res.statusText, body?.error?.code, body);
  if (isEndpointMissing(error)) return fromExistingEndpoints(applicationId, kind === "logbook");
  return { error: res.status, message: error.message };
}
