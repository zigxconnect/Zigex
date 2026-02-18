import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          const headers = new Headers(request.headers);
          headers.set('cookie', request.cookies.toString());
          response = NextResponse.next({
            request: { headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          const headers = new Headers(request.headers);
          headers.set('cookie', request.cookies.toString());
          response = NextResponse.next({
            request: { headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // === SECURITY HEADERS ===
  const headers = response.headers;
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // console.log(`[Proxy] Pathname: ${pathname}, User Authenticated: ${!!user}`);
  if (user) {
    // console.log(`[Proxy] User ID: ${user.id}`);
  }

  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/company/sign-up",
    "/api/auth/callback",
    "/verify-otp",
    "/forgot-password",
    "/update-password",
    "/demo",
  ];

  // Helper helper to create a redirect that preserves session cookies
  const createRedirectResponse = (targetPath: string) => {
    const redirectUrl = new URL(targetPath, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy all cookies from our intermediate 'response' object to the redirect
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
      });
    });
    return redirectResponse;
  };

  // --- 1. Handle Unauthenticated Users ---
  const publicApiPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/verify-otp",
    "/api/auth/verify-otp-server",
    "/api/auth/resend-otp",
    "/api/auth/callback",
    "/api/auth/company/register",
    "/api/cron/reminders",
    // add more public API endpoints as needed
  ];
  if (!user) {
    if (
      publicPaths.includes(pathname) ||
      pathname === "/create-profile" ||
      pathname === "/profile-complete" ||
      publicApiPaths.includes(pathname)
    ) {
      return response;
    }
    // If API route, return JSON error instead of redirect
    if (pathname.startsWith('/api')) {
      const errorResponse = new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
      // Even error responses should try to sync cookies if any were updated (e.g. clearing stale ones)
      response.cookies.getAll().forEach((cookie) => {
        errorResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return errorResponse;
    }
    return createRedirectResponse("/sign-in");
  }

  // --- 2. Handle Authenticated Users ---

  if (pathname === "/update-password") {
    return response;
  }

  const { data: studentProfile, error: studentError } = await supabase
    .from("student_profiles")
    .select("role, profile_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: companyProfile, error: companyError } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Log any errors for debugging
  if (studentError) {
    console.error("[Proxy] Error fetching student profile:", studentError);
  }
  if (companyError) {
    console.error("[Proxy] Error fetching company profile:", companyError);
  }

  // Determine user role, or mark as "unassigned" if neither profile exists
  let userRole: "student" | "company" | "unassigned" = "unassigned";
  if (studentProfile?.role === "student") {
    userRole = "student";
  } else if (companyProfile?.role === "company") {
    userRole = "company";
  }

  const isStudentProfileComplete =
    studentProfile?.profile_status === "complete";

  // --- 3. Handle Unassigned Users (No Profile Yet) ---
  if (userRole === "unassigned") {
    if (
      pathname !== "/create-profile" &&
      pathname !== "/company/sign-up" &&
      !pathname.startsWith("/api")
    ) {
      return createRedirectResponse("/create-profile");
    }
    return response;
  }

  // --- 4. Enforce Profile Creation for Students ---
  if (userRole === "student" && !isStudentProfileComplete) {
    if (pathname !== "/create-profile" && !pathname.startsWith("/api")) {
      return createRedirectResponse("/create-profile");
    }
    return response;
  }

  // --- 5. Redirect Authenticated Users from Restricted Pages ---

  // Create a list of all pages an authenticated and fully set-up user should NOT be able to access.
  const authRedirectPaths = [
    ...publicPaths.filter((path) => path !== "/demo"),
    "/create-profile",
    "/profile-complete",
  ];

  // If the user is on any of these restricted pages, redirect them to their dashboard.
  if (authRedirectPaths.includes(pathname)) {
    if (userRole === "company") {
      return createRedirectResponse("/admin/dashboard");
    }
    if (userRole === "student") {
      return createRedirectResponse("/dashboard");
    }
  }

  // --- 6. Role-Based Authorization ---
  if (pathname.startsWith("/admin") && userRole !== "company") {
    return createRedirectResponse("/dashboard");
  }

  const studentPaths = [
    "/dashboard",
    "/profile-settings",
    "/upload-resume",
    "/applied-internships",
    "/track-progress",
    "/chat",
  ];
  if (
    studentPaths.some((p) => pathname.startsWith(p)) &&
    userRole !== "student"
  ) {
    return createRedirectResponse("/admin/dashboard");
  }

  return response;
}

export const config = {
  matcher: [
    // Protect all routes except static/image/favicon/pwa-assets
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};

