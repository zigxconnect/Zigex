"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
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

const SCRIPT_WAIT_MS = 5000;

/**
 * Google sign-in through the backend: Google Identity Services gives us an
 * ID token, POST /auth/google exchanges it for our JWT (the /api/v1
 * passthrough stores it in the session cookie). Spec'd in
 * docs/backend-missing-endpoints.md; shows "coming soon" until deployed.
 * Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.
 */
export function GoogleSignInButton({ text }: { text: "signin_with" | "signup_with" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async ({ credential }: GoogleCredentialResponse) => {
      try {
        const res = await api.post<{ user: { role: string } }>("/auth/google", { idToken: credential });
        if (res.data.user.role !== "student") {
          await api.post("/auth/logout").catch(() => {});
          toast.error("This is not a student account. Please use the company portal.");
          return;
        }
        toast.success("Logged in successfully!");
        window.location.href = getReturnUrl("/feed");
      } catch (error) {
        if (isEndpointMissing(error)) {
          toast("Google sign-in is coming soon. Please use your email and password.");
        } else {
          toast.error(error instanceof ApiClientError ? error.message : "Google sign-in failed. Please try again.");
        }
      }
    };

    // The GSI script loads async from app/layout.tsx; wait for it briefly.
    const started = Date.now();
    const timer = setInterval(() => {
      const google = (window as unknown as { google?: GoogleIdentity }).google;
      if (google?.accounts?.id && containerRef.current) {
        clearInterval(timer);
        google.accounts.id.initialize({ client_id: clientId, callback: handleCredential, use_fedcm_for_prompt: true });
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text,
          width: containerRef.current.offsetWidth || 360,
        });
      } else if (Date.now() - started > SCRIPT_WAIT_MS) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [clientId, text]);

  if (!clientId) return null;
  return <div ref={containerRef} className="flex w-full justify-center min-h-[44px]" />;
}
