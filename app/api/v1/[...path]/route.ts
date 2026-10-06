import { NextResponse, type NextRequest } from "next/server";
import { API_PREFIX, BACKEND_URL, DEFAULT_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from "@/lib/api/config";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/api/session";

/**
 * Same-origin passthrough to the standalone backend.
 *
 *   browser → /api/v1/<path> (this app) → BACKEND_URL/api/v1/<path>
 *
 * - Attaches the JWT from our httpOnly cookie as a Bearer token.
 * - On login / verify-email / reset-password / google, moves the returned token into that cookie and
 *   strips it from the JSON so it never reaches client-side JS.
 * - On logout, clears the cookie even if the backend call fails.
 */

// Endpoints whose successful response carries data.token.
const TOKEN_ISSUING_PATHS = new Set(["auth/login", "auth/verify-email", "auth/reset-password", "auth/google"]);

// Request headers worth forwarding. Browser cookies are deliberately NOT
// forwarded — the backend only ever sees the Bearer token.
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "accept-language", "if-none-match"];
const FORWARDED_RESPONSE_HEADERS = ["content-type", "etag", "cache-control", "x-request-id", "ratelimit-remaining", "ratelimit-reset", "retry-after"];

type RouteContext = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, { params }: RouteContext) {
  const path = (await params).path.join("/");
  const target = `${BACKEND_URL}${API_PREFIX}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Lets the backend rate-limit per end user instead of per frontend server.
  const clientIp = req.headers.get("x-forwarded-for");
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(path.startsWith("uploads/") ? UPLOAD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error(`[api/v1] ${req.method} /${path} failed:`, error);
    if (path === "auth/logout") await clearAccessToken();
    return NextResponse.json(
      {
        success: false,
        error: timedOut
          ? { code: "UPSTREAM_TIMEOUT", message: "The server took too long to respond. Please try again." }
          : { code: "UPSTREAM_UNAVAILABLE", message: "Service temporarily unavailable. Please try again." },
      },
      { status: timedOut ? 504 : 502 }
    );
  }

  if (path === "auth/logout") await clearAccessToken();
  // An expired/invalid token is useless — drop it so the proxy treats the user as signed out.
  if (upstream.status === 401 && token) await clearAccessToken();

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  if (upstream.ok && TOKEN_ISSUING_PATHS.has(path)) {
    const payload = await upstream.json();
    if (payload?.data?.token) {
      await setAccessToken(payload.data.token);
      delete payload.data.token;
    }
    return NextResponse.json(payload, { status: upstream.status, headers: responseHeaders });
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
