import "server-only";
import { serverApi } from "../server-client";
import { ApiClientError } from "../errors";
import { getFeedItem } from "./feed";
import {
  hydrateApplications,
  normaliseApplication,
  targetId,
  type ApplicationKind,
  type ApplicationRow,
} from "../applications-shape";

/** Application reads and writes against the backend (/applications, /uploads). */

export type CreateApplicationInput = {
  application_type: ApplicationKind;
  internship_id?: string;
  program_id?: string;
  event_id?: string;
  department?: string;
  location?: string;
  work_mode?: "remote" | "onsite" | "hybrid";
  duration_months?: number;
  expectations?: string;
  comments?: string;
};

/**
 * The signed-in student's applications, newest first. With `withPostings`
 * (default) each row gets its internship / program / event attached.
 */
export async function listApplications({ withPostings = true }: { withPostings?: boolean } = {}): Promise<
  ApplicationRow[]
> {
  const res = await serverApi.get<ApplicationRow[]>("/applications");
  const rows = withPostings
    ? await hydrateApplications(res.data ?? [], (path, id) => getFeedItem(path, id))
    : (res.data ?? []).map(normaliseApplication);
  return rows.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}

/** The latest application to an internship / program / event, or null. 401 (signed out) → null. */
export async function findApplicationFor(postingId: string): Promise<ApplicationRow | null> {
  try {
    const rows = await listApplications({ withPostings: false });
    return rows.find((row) => targetId(row) === postingId) ?? null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}

export async function createApplication(input: CreateApplicationInput): Promise<ApplicationRow> {
  const res = await serverApi.post<ApplicationRow>("/applications", input);
  return res.data;
}

export async function withdrawApplication(id: string): Promise<ApplicationRow> {
  const res = await serverApi.patch<ApplicationRow>(`/applications/${encodeURIComponent(id)}/withdraw`);
  return res.data;
}

async function toUploadBody(file: File) {
  return { base64: Buffer.from(await file.arrayBuffer()).toString("base64"), mimetype: file.type };
}

/** Accepted by POST /uploads/cv. */
export const CV_MIME_TYPES = ["application/pdf", "application/msword"];
/** Accepted by POST /uploads/cover-letter/{applicationId}. */
export const COVER_LETTER_MIME_TYPES = ["application/pdf"];

/**
 * Replaces the student's CV (it is stored on the profile, not per application).
 * TODO(backend): no per-application resume upload yet.
 */
export async function uploadCv(file: File) {
  const res = await serverApi.post<{ key: string; signedUrl: string }>("/uploads/cv", await toUploadBody(file), {
    timeoutMs: 60_000,
  });
  return res.data;
}

export async function uploadCoverLetter(applicationId: string, file: File) {
  const res = await serverApi.post<{ key?: string; url?: string }>(
    `/uploads/cover-letter/${encodeURIComponent(applicationId)}`,
    await toUploadBody(file),
    { timeoutMs: 60_000 }
  );
  return res.data;
}

/** The fields of GET /students/me that the apply flows use (DB column names). */
export type ApplicantProfile = {
  full_name?: string;
  email?: string;
  phone?: string;
  university?: string;
  linkedin_url?: string;
  hard_skills?: string[];
  bio?: string;
  avatar_url?: string;
  [column: string]: any;
};

export async function getApplicantProfile(): Promise<ApplicantProfile | null> {
  try {
    const res = await serverApi.get<ApplicantProfile>("/students/me");
    return res.data ?? null;
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 404)) return null;
    throw error;
  }
}

/**
 * Turns a backend error into the { error, status } the apply routes return.
 * POST /applications answers 400 for duplicates as well as missing targets.
 */
export function applicationErrorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    const duplicate = error.status === 400 && /already|duplicate/i.test(error.message);
    return { error: error.message || fallback, status: duplicate ? 409 : error.status };
  }
  console.error(fallback, error);
  return { error: fallback, status: 500 };
}
