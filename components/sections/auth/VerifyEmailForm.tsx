"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { getReturnUrl } from "@/lib/utils/redirect";
import { OtpInput } from "./OtpInput";
import { AuthFooter, AuthHeader, FormAlert, SubmitButton, authLink, useAuthNext } from "./auth-ui";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Email verification (POST /auth/verify-email, POST /auth/resend-otp).
 * A successful verify returns a token, which the /api/v1 passthrough stores
 * in the session cookie, so the student is signed in straight away.
 */
export const VerifyEmailForm = () => {
  const params = useSearchParams();
  const email = params.get("email");
  const { href } = useAuthNext();
  const labelId = useId();
  const errorId = useId();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  // Arriving straight after sign-up means a code was just sent.
  const [countdown, setCountdown] = useState(params.get("sent") === "1" ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const verify = async (otp: string) => {
    if (!email || verifying) return;
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter all ${OTP_LENGTH} digits from the email.`);
      return;
    }
    setError(null);
    setNotice(null);
    setVerifying(true);
    try {
      const res = await api.post<{ user?: unknown }>("/auth/verify-email", { email, otp });
      // Older backend builds verify without issuing a token: sign in instead.
      window.location.href = res.data?.user ? getReturnUrl("/feed") : href("/sign-in", { verified: "1", email });
    } catch (err) {
      setVerifying(false);
      setCode("");
      setError(
        err instanceof ApiClientError && err.status === 400
          ? "That code is wrong or has expired. Check the latest email, or send a new code."
          : "We couldn't check the code. Check your connection and try again."
      );
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setNotice(`We sent a new code to ${email}.`);
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err instanceof ApiClientError && err.status === 429
          ? "You've asked for several codes. Wait a few minutes before asking again."
          : "We couldn't send a new code. Try again in a moment."
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <>
        <AuthHeader
          title="Verify your email"
          description="This link is missing your email address. Sign in, and we'll send you a fresh code if your email still needs verifying."
        />
        <Link
          href={href("/sign-in")}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#155DFC] text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
        >
          Go to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="Check your email"
        description={
          <>
            Enter the {OTP_LENGTH}-digit code we sent to <span className="font-semibold text-[#0B1B3F] [overflow-wrap:anywhere]">{email}</span>.
            It can take a minute to arrive; check your spam folder too.
          </>
        }
      />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="space-y-5"
      >
        {notice && <FormAlert tone="success">{notice}</FormAlert>}

        <div>
          <p id={labelId} className="mb-1.5 text-sm font-medium text-[#0B1B3F]">
            Verification code
          </p>
          <OtpInput
            length={OTP_LENGTH}
            value={code}
            onChange={(next) => {
              setCode(next);
              if (error) setError(null);
            }}
            onComplete={verify}
            autoFocus
            disabled={verifying}
            invalid={Boolean(error)}
            labelledBy={labelId}
            describedBy={error ? errorId : undefined}
          />
          {error && (
            <p id={errorId} role="alert" className="mt-2 text-[13px] text-[#B42318]">
              {error}
            </p>
          )}
        </div>

        <SubmitButton busy={verifying} busyLabel="Verifying…">
          Verify email
        </SubmitButton>
      </form>

      <AuthFooter>
        Didn&apos;t get the code?{" "}
        {countdown > 0 ? (
          <span className="text-[#7B869C]">Send a new one in {countdown}s</span>
        ) : (
          <button type="button" onClick={resend} disabled={resending} className={`${authLink} disabled:opacity-60`}>
            {resending ? "Sending…" : "Send a new code"}
          </button>
        )}
      </AuthFooter>
      <p className="mt-3 text-[15px] text-[#4A5670]">
        Wrong email?{" "}
        <Link href={href("/sign-up")} className={authLink}>
          Sign up again
        </Link>
      </p>
    </>
  );
};
