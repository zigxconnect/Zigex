"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/browser-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";
import { getReturnUrl } from "@/lib/utils/redirect";

type GoogleCredentialResponse = { credential: string };
type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: Record<string, unknown>) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

const SCRIPT_WAIT_MS = 8000;

/**
 * "Continue with Google" through the backend: Google Identity Services gives
 * us an ID token, POST /auth/google exchanges it for our JWT (the /api/v1
 * passthrough stores it in the session cookie).
 *
 * The visible button is ours, so it matches the other 48px buttons. Google's
 * own button is rendered invisibly on top of it and receives the click (GIS
 * only hands out ID tokens through its own button). Without
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID the button still shows and explains that
 * Google sign-in isn't switched on yet.
 */
export function GoogleSignInButton({ text }: { text: "signin_with" | "signup_with" }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async ({ credential }: GoogleCredentialResponse) => {
      setBusy(true);
      setMessage(null);
      try {
        const res = await api.post<{ user: { role: string } }>("/auth/google", { idToken: credential });
        if (res.data.user.role !== "student") {
          await api.post("/auth/logout").catch(() => {});
          setMessage("That Google account belongs to a company. Companies sign in on the Zigex company portal.");
          setBusy(false);
          return;
        }
        window.location.href = getReturnUrl("/feed");
      } catch (error) {
        setBusy(false);
        setMessage(
          isEndpointMissing(error)
            ? "Google sign-in isn't available yet. Use your email and password for now."
            : error instanceof ApiClientError
              ? error.message
              : "Google sign-in didn't work. Try again, or use your email and password."
        );
      }
    };

    // The GSI script loads async from app/layout.tsx; wait for it briefly.
    const started = Date.now();
    const timer = setInterval(() => {
      const google = (window as unknown as { google?: GoogleIdentity }).google;
      const overlay = overlayRef.current;
      if (google?.accounts?.id && overlay) {
        clearInterval(timer);
        google.accounts.id.initialize({ client_id: clientId, callback: handleCredential, use_fedcm_for_prompt: true });
        google.accounts.id.renderButton(overlay, {
          theme: "outline",
          size: "large",
          text,
          width: Math.min(overlay.offsetWidth || 400, 400),
        });
        setReady(true);
      } else if (Date.now() - started > SCRIPT_WAIT_MS) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [clientId, text]);

  const label = text === "signup_with" ? "Sign up with Google" : "Continue with Google";

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          // Only reached when Google's overlay isn't there (no client ID, or the script didn't load).
          onClick={() =>
            setMessage(
              clientId
                ? "Google sign-in couldn't load. Check your connection, or use your email and password."
                : "Google sign-in isn't switched on yet. Use your email and password for now."
            )
          }
          disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DCE5F5] bg-white px-5 text-[15px] font-semibold text-[#0B1B3F] transition-colors hover:border-[#B9C8E6] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          <GoogleLogo />
          {busy ? "Signing in with Google…" : label}
        </button>
        {/* Google's real button, invisible, exactly over ours. */}
        {clientId && (
          <div
            ref={overlayRef}
            aria-hidden={!ready}
            className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl opacity-[0.01] ${
              ready && !busy ? "" : "pointer-events-none"
            } [&_iframe]:!h-12 [&>div]:w-full`}
          />
        )}
      </div>
      {message && (
        <p role="status" className="mt-2 text-[13px] text-[#4A5670]">
          {message}
        </p>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
