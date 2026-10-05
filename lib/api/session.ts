import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, DEFAULT_TOKEN_MAX_AGE } from "./config";

/** Seconds until the JWT's `exp`, or the default when it can't be read. */
function tokenMaxAge(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (typeof payload.exp === "number") {
      return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    }
  } catch {
    // Malformed token — fall through to the default; the backend rejects it anyway.
  }
  return DEFAULT_TOKEN_MAX_AGE;
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

/** Call from a Server Action or Route Handler after login / verify-email. */
export async function setAccessToken(token: string): Promise<void> {
  (await cookies()).set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokenMaxAge(token),
  });
}

export async function clearAccessToken(): Promise<void> {
  (await cookies()).delete(ACCESS_TOKEN_COOKIE);
}
