import "server-only";
import { cache } from "react";
import { readSession, type Session } from "./jwt";
import { getAccessToken } from "./session";
import { serverApi } from "./server-client";
import { ApiClientError } from "./errors";

/** Fast, local read of the signed-in user (no network). Null when signed out. */
export async function getSession(): Promise<Session | null> {
  return readSession(await getAccessToken());
}

/**
 * The signed-in user as confirmed by the backend (GET /auth/me).
 * Deduplicated per request. Returns null when signed out or the token is rejected.
 */
export const getCurrentUser = cache(async (): Promise<Session | null> => {
  if (!(await getSession())) return null;
  try {
    const res = await serverApi.get<{ user: Session }>("/auth/me");
    return res.data.user;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
});
