import "server-only";
import { cache } from "react";
import { serverApi } from "../server-client";
import { ApiClientError } from "../errors";
import { toProfilePatch } from "../profile-shape";

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
 * and the fields the backend does not accept yet (dropped, not saved).
 */
export async function updateMyProfile(updates: Record<string, unknown>) {
  const { body, unsupported } = toProfilePatch(updates);
  if (unsupported.length) {
    console.warn(`[profile] not saved, no backend field yet: ${unsupported.join(", ")}`);
  }
  const res = await serverApi.patch<StudentProfileRow>("/students/me", body);
  return { profile: res.data ?? null, unsupported };
}
