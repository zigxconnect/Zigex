export type SessionRole = "student" | "company" | "supervisor" | "user";

export type Session = {
  userId: string;
  email: string;
  role: SessionRole;
  exp?: number;
};

/**
 * Reads the backend JWT's payload WITHOUT verifying its signature.
 *
 * Only for routing decisions (proxy.ts redirects, showing signed-in UI).
 * It is not a security boundary: the backend verifies the signature on every
 * data request, so a forged token gets the user nothing but a 401.
 * Returns null for malformed or expired tokens.
 */
export function readSession(token: string | undefined): Session | null {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null;

    const userId = payload.userId ?? payload.sub ?? payload.id;
    if (!userId || !payload.role) return null;
    return { userId, email: payload.email, role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}
