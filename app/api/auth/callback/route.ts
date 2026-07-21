// app/api/auth/callback/route.ts

import {
  createSupabaseServerClient,
  supabaseAdmin,
  type SupabaseServerClient,
} from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getURL } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

// Resolves where the user should land after their session is established,
// applying the same company/student profile rules regardless of whether the
// session came from a PKCE `code` exchange or hash-delivered tokens (the
// shape returned by admin.generateLink(), which can never do PKCE since the
// link is minted server-to-server with no browser-held code_verifier).
async function finalizeAuthSession(
  supabase: SupabaseServerClient,
  user: User,
  origin: string,
  next: string
): Promise<string> {
  const { data: companyProfile } = await supabaseAdmin
    .from("company_profiles")
    .select("user_id")
    .eq("email", user.email)
    .maybeSingle();

  if (companyProfile) {
    await supabase.auth.signOut();

    const redirectUrl = new URL("/sign-in", origin);
    redirectUrl.searchParams.set("error", "company_otp_required");
    redirectUrl.searchParams.set(
      "error_description",
      "Company accounts must sign in with email and password to receive a verification code."
    );
    return redirectUrl.toString();
  }

  // If the user is not a company, proceed with the normal student flow.
  const { data: studentProfile, error: profileError } = await supabaseAdmin
    .from("student_profiles")
    .select("user_id, profile_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching student profile:", profileError);
    return `${origin}/auth/auth-code-error`;
  }

  if (studentProfile && studentProfile.profile_status === "complete") {
    return `${origin}${next}`;
  }

  if (!studentProfile) {
    const metadata = (user.user_metadata || {}) as Record<string, unknown>;
    // Leave full_name undefined (never null) when unknown so the
    // insert omits the column entirely and the DB default ('Student')
    // applies — an explicit NULL would violate its NOT NULL constraint.
    const full_name = metadata.full_name || metadata.name || undefined;
    const avatar_url = metadata.avatar_url || metadata.picture || null;

    await supabaseAdmin.from("student_profiles").insert({
      user_id: user.id,
      email: user.email,
      ...(full_name ? { full_name } : {}),
      avatar_url,
      profile_status: "incomplete",
    });
  }

  // Deferred completion: land the user on the dashboard even with an
  // incomplete profile (or on /update-password for recovery flows). The
  // dashboard surfaces a dismissible banner prompting them to finish setup
  // at /dashboard/edit-profile.
  return `${origin}${next}`;
}

// Renders a client-side script that reads the hash fragment (never sent to
// the server) left behind by admin.generateLink()-issued confirmation links
// — e.g. #access_token=...&refresh_token=...&type=signup — and forwards the
// tokens to POST /api/auth/callback so the session can be established
// server-side and the usual profile-redirect logic applied.
function hashTokenBridgePage(origin: string, next: string) {
  const body = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Signing you in…</title></head>
  <body>
    <script>
      (function () {
        var params = new URLSearchParams(window.location.hash.slice(1));
        var access_token = params.get("access_token");
        var refresh_token = params.get("refresh_token");

        if (!access_token || !refresh_token) {
          window.location.replace(${JSON.stringify(`${origin}/auth/auth-code-error`)});
          return;
        }

        fetch(${JSON.stringify(`${origin}/api/auth/callback`)}, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
            next: ${JSON.stringify(next)},
          }),
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            window.location.replace(data.redirect || ${JSON.stringify(`${origin}/auth/auth-code-error`)});
          })
          .catch(function () {
            window.location.replace(${JSON.stringify(`${origin}/auth/auth-code-error`)});
          });
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Built from NEXT_PUBLIC_SITE_URL rather than request.url's origin — behind
  // a reverse proxy that doesn't forward the original Host header, that origin
  // resolves to the app's internal address (e.g. localhost) instead of the
  // public domain, sending users to the wrong host after auth.
  const origin = getURL().replace(/\/$/, "");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth exchange error:", error.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      if (data?.user) {
        const target = await finalizeAuthSession(
          supabase,
          data.user,
          origin,
          next
        );
        return NextResponse.redirect(target);
      }
    } catch (err) {
      console.error("Auth callback unexpected error:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // No `code` query param — this is expected for admin.generateLink() signup
  // links, which deliver the session as access_token/refresh_token in the URL
  // hash instead. The hash never reaches this server-side handler, so hand
  // off to a client script that can read it.
  return hashTokenBridgePage(origin, next);
}

export async function POST(request: Request) {
  const origin = getURL().replace(/\/$/, "");

  let body: {
    access_token?: string;
    refresh_token?: string;
    next?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { redirect: `${origin}/auth/auth-code-error` },
      { status: 400 }
    );
  }

  const { access_token, refresh_token, next = "/dashboard" } = body;

  if (!access_token || !refresh_token) {
    return NextResponse.json(
      { redirect: `${origin}/auth/auth-code-error` },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error || !data?.user) {
    console.error("Auth setSession error:", error?.message);
    return NextResponse.json(
      { redirect: `${origin}/auth/auth-code-error` },
      { status: 400 }
    );
  }

  const target = await finalizeAuthSession(supabase, data.user, origin, next);
  return NextResponse.json({ redirect: target });
}
