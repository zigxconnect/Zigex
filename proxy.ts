import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";
import { readSession } from "@/lib/api/jwt";
import { sanitizeRedirectUrl } from "@/lib/utils/redirect";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=()",
};

// Pages anyone can open. Signed-in students are bounced off the auth pages.
const AUTH_PAGES = ["/sign-in", "/sign-up", "/verify-email", "/forgot-password"];
// /offline is precached by the installed app and must never redirect; /privacy is linked from the public footer.
const PUBLIC_PAGES = ["/", "/demo", "/feed", "/privacy", "/terms", "/offline", "/reset-password", "/update-password", ...AUTH_PAGES];

// API routes that must work without a session: the passthrough to the
// backend (which enforces its own auth) and the deploy health check.
const PUBLIC_API_PREFIXES = ["/api/v1/", "/api/health"];

// Company and supervisor pages live in the admin app now.
// Not "/company": /company/[id] is the student-facing company page.
const ADMIN_APP_PREFIXES = ["/admin", "/company/sign-up", "/verify-otp", "/supervisor"];
const ADMIN_APP_URL = (process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "https://admin.zigexconnect.com").replace(/\/$/, "");

function withSecurityHeaders(response: NextResponse) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  return response;
}

function redirectTo(request: NextRequest, path: string) {
  return withSecurityHeaders(NextResponse.redirect(new URL(path, request.url)));
}

function signInRedirect(request: NextRequest) {
  const url = new URL("/sign-in", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/") && !pathname.startsWith("//")) {
    url.searchParams.set("next", pathname + search);
  }
  return withSecurityHeaders(NextResponse.redirect(url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Old links and bookmarks to company/supervisor pages: send them to the admin app.
  if (ADMIN_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(`${ADMIN_APP_URL}${pathname}${request.nextUrl.search}`);
  }

  // Friendly aliases (the backend's notification links use these).
  const alias: Record<string, string> = { "/dashboard/applications": "/dashboard/applied-internships" };
  if (alias[pathname]) return redirectTo(request, alias[pathname] + request.nextUrl.search);

  // Old notification links (/notifications/<opportunity id>) showed placeholder
  // data; the opportunity page resolves any internship, program or event id.
  const oldNotification = pathname.match(/^\/notifications\/([^/]+)$/);
  if (oldNotification) return redirectTo(request, `/feed/${oldNotification[1]}`);

  const session = readSession(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const isApi = pathname.startsWith("/api/");

  if (isApi) {
    if (session || PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return withSecurityHeaders(NextResponse.next());
    }
    return withSecurityHeaders(
      NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 })
    );
  }

  // Share images must load for link-preview bots (WhatsApp, X…), which are never signed in.
  const isShareImage = /\/(opengraph|twitter)-image(-[\w]+)?$/.test(pathname);
  const isPublic =
    isShareImage || PUBLIC_PAGES.includes(pathname) || pathname.startsWith("/feed/") || pathname.startsWith("/company/");

  if (!session) {
    return isPublic ? withSecurityHeaders(NextResponse.next()) : signInRedirect(request);
  }

  // This app is for students; companies and supervisors use the admin app.
  if (session.role !== "student") {
    return isPublic ? withSecurityHeaders(NextResponse.next()) : redirectTo(request, "/sign-in?error=wrong_portal");
  }

  // Signed-in students skip the marketing page and land on their feed.
  if (pathname === "/") {
    return redirectTo(request, "/feed");
  }

  // Already signed in: honour where they were heading (e.g. an old sign-in tab
  // or a shared /sign-in?next=/programs/... link) instead of dropping them on the feed.
  if (AUTH_PAGES.includes(pathname)) {
    return redirectTo(request, sanitizeRedirectUrl(request.nextUrl.searchParams.get("next")));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Everything except build assets and static files: public/ images, the PWA
    // files, robots.txt and sitemap.xml must load for signed-out visitors and crawlers.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|push-sw.js|icons/|images/|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|webmanifest|js|css|map|woff2?|ttf|pdf|mp4)$).*)",
  ],
};
