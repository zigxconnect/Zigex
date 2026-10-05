import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";
import { readSession } from "@/lib/api/jwt";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=()",
};

// Pages anyone can open. Signed-in students are bounced off the auth pages.
const AUTH_PAGES = ["/sign-in", "/sign-up", "/verify-email", "/forgot-password"];
const PUBLIC_PAGES = ["/", "/demo", "/feed", "/update-password", ...AUTH_PAGES];

// API routes that must work without a session.
const PUBLIC_API_PREFIXES = [
  // Passthrough to the backend, which enforces its own auth.
  "/api/v1/",
  "/api/cron/",
  // Legacy company auth — moves out with the admin app (feat/admin-split).
  "/api/auth/",
];

// Company/admin area: still on Supabase until it is split into its own app.
const LEGACY_ADMIN_PREFIXES = ["/admin", "/company", "/verify-otp", "/api/companies", "/api/admin"];

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

  if (LEGACY_ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return legacyAdminProxy(request);
  }

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

  const isPublic = PUBLIC_PAGES.includes(pathname) || pathname.startsWith("/feed/");

  if (!session) {
    return isPublic ? withSecurityHeaders(NextResponse.next()) : signInRedirect(request);
  }

  // This app is for students; companies and supervisors use the admin app.
  if (session.role !== "student") {
    return isPublic ? withSecurityHeaders(NextResponse.next()) : redirectTo(request, "/sign-in?error=wrong_portal");
  }

  if (AUTH_PAGES.includes(pathname)) {
    return redirectTo(request, "/feed");
  }

  return withSecurityHeaders(NextResponse.next());
}

/**
 * Supabase-session guard for the company/admin area, kept only until
 * feat/admin-split moves it into its own app. Delete with that split.
 */
async function legacyAdminProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const publicPaths = ["/company/sign-up", "/verify-otp"];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (publicPaths.includes(pathname)) return withSecurityHeaders(response);
    if (pathname.startsWith("/api/")) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    return signInRedirect(request);
  }

  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyProfile?.role !== "company" && !publicPaths.includes(pathname)) {
    return pathname.startsWith("/api/")
      ? withSecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }))
      : redirectTo(request, "/feed");
  }

  if (publicPaths.includes(pathname) && companyProfile?.role === "company") {
    return redirectTo(request, "/admin/dashboard");
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Protect all routes except static/image/favicon/pwa-assets
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|push-sw.js|icons/|images/).*)",
  ],
};
