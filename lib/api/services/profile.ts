import "server-only";
import { cache } from "react";
import { serverApi } from "../server-client";
import { ApiClientError } from "../errors";
import { toProfilePatch, withoutSpecFields } from "../profile-shape";

/**
 * The signed-in student's profile (GET /students/me).
 * TODO(backend): response body is undocumented; assumed to be the
 * student_profiles row with its snake_case columns.
 */
export type StudentProfileRow = { id: string; user_id: string; [column: string]: any };

/** Null when signed out (401) or when the student has no profile row (404). */
export const getMyProfile = cache(async (): Promise<StudentProfileRow | null> => {
  try {
    const res = await serverApi.get<StudentProfileRow>("/students/me");
    return res.data ?? null;
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 404)) return null;
    throw error;
  }
});

/**
 * PATCH /students/me from snake_case form fields. Returns the updated profile
 * and the fields that were not saved.
 *
 * Sends the spec'd fields (username, languages, ...) too. If the backend
 * rejects the request as invalid (it has not shipped them yet), retries once
 * without them, so saving the rest of the profile keeps working meanwhile.
 */
export async function updateMyProfile(updates: Record<string, unknown>) {
  const { body, unsupported } = toProfilePatch(updates);
  if (unsupported.length) {
    console.warn(`[profile] not saved, unknown field: ${unsupported.join(", ")}`);
  }
  try {
    const res = await serverApi.patch<StudentProfileRow>("/students/me", body);
    return { profile: res.data ?? null, unsupported };
  } catch (error) {
    const fallback = withoutSpecFields(body);
    const rejected = error instanceof ApiClientError && (error.status === 400 || error.status === 422);
    if (!rejected || fallback.dropped.length === 0) throw error;

    console.warn(`[profile] backend rejected spec'd fields, retrying without: ${fallback.dropped.join(", ")}`);
    const res = await serverApi.patch<StudentProfileRow>("/students/me", fallback.body);
    return { profile: res.data ?? null, unsupported: [...unsupported, ...fallback.dropped] };
  }
}
