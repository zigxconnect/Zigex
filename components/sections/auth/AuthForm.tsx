"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getReturnUrl } from "@/lib/utils/redirect";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  AuthFooter,
  AuthHeader,
  Field,
  FormAlert,
  OrDivider,
  PasswordInput,
  SubmitButton,
  authLink,
  inputClass,
} from "./auth-ui";

const email = z.string().trim().email({ message: "Enter a valid email address, like name@example.com." });

const signInSchema = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password." }),
});

// The backend needs firstName and lastName of at least 2 characters each.
const signUpSchema = z.object({
  firstName: z.string().trim().min(2, { message: "Enter your first name (2 letters or more)." }),
  lastName: z.string().trim().min(2, { message: "Enter your last name (2 letters or more)." }),
  email,
  password: z.string().min(8, { message: "Use at least 8 characters." }),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

const hasGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

/** Seconds to wait after the backend rate-limits us. */
function retryAfterSeconds(error: ApiClientError): number {
  const body = error.body as { retryAfter?: number } | undefined;
  return Number(body?.retryAfter) || 60;
}

function useCooldown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return [seconds, setSeconds] as const;
}

export const AuthForm = ({ type }: { type: "signIn" | "signUp" }) =>
  type === "signIn" ? <SignInForm /> : <SignUpForm />;

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useCooldown();

  // Messages carried over from redirects.
  const notice =
    params.get("verified") === "1"
      ? "Your email is verified. Sign in to continue."
      : params.get("reset") === "1"
        ? "Your password was changed. Sign in with your new password."
        : null;
  const portalError =
    params.get("error") === "wrong_portal"
      ? "That account belongs to a company. Companies sign in on the Zigex company portal."
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInData) => {
    setError(null);
    try {
      const res = await api.post<{ user: { role: string } }>("/auth/login", data);
      if (res.data.user.role !== "student") {
        await api.post("/auth/logout").catch(() => {});
        setError("That account belongs to a company. Companies sign in on the Zigex company portal.");
        return;
      }
      // Full navigation so proxy.ts and server components see the new cookie.
      window.location.href = getReturnUrl("/feed");
    } catch (err) {
      if (!(err instanceof ApiClientError)) {
        setError("We couldn't reach Zigex. Check your connection and try again.");
        return;
      }
      if (err.status === 429) {
        setCooldown(retryAfterSeconds(err));
        setError("Too many sign-in attempts. Wait a minute, then try again.");
        return;
      }
      // Account exists but the email code was never entered: send a fresh one.
      if (err.status === 401 && /verify your email/i.test(err.message)) {
        await api.post("/auth/resend-otp", { email: data.email }).catch(() => {});
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}&sent=1`);
        return;
      }
      // Generic on purpose: never reveal whether the email has an account.
      setError(err.status === 401 ? "The email or password is incorrect." : err.message);
    }
  };

  return (
    <>
      <AuthHeader title="Sign in to Zigex" description="Pick up where you left off with your applications." />

      {hasGoogle && (
        <>
          <GoogleSignInButton text="signin_with" />
          <OrDivider />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {(error || portalError || notice) && (
          <FormAlert tone={error || portalError ? "error" : "success"}>{error ?? portalError ?? notice}</FormAlert>
        )}

        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...register("email")}
            />
          )}
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          aside={
            <Link href="/forgot-password" className={`${authLink} text-sm`}>
              Forgot password?
            </Link>
          }
        >
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              autoComplete="current-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register("password")}
            />
          )}
        </Field>

        <SubmitButton busy={isSubmitting} busyLabel="Signing in…" disabled={cooldown > 0}>
          {cooldown > 0 ? `Try again in ${cooldown}s` : "Sign in"}
        </SubmitButton>
      </form>

      <AuthFooter>
        New to Zigex?{" "}
        <Link href="/sign-up" className={authLink}>
          Create a free account
        </Link>
      </AuthFooter>
    </>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpData) => {
    setError(null);
    try {
      await api.post("/auth/register/student", data);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}&sent=1`);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setError("An account with this email already exists. Sign in instead, or reset your password.");
        return;
      }
      setError(
        err instanceof ApiClientError
          ? err.status === 429
            ? "Too many attempts. Wait a minute, then try again."
            : err.message
          : "We couldn't reach Zigex. Check your connection and try again."
      );
    }
  };

  return (
    <>
      <AuthHeader
        title="Create your student account"
        description="Free for students. Apply to internships, programs and events with one profile."
      />

      {hasGoogle && (
        <>
          <GoogleSignInButton text="signup_with" />
          <OrDivider />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                autoComplete="given-name"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                {...register("firstName")}
              />
            )}
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                autoComplete="family-name"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                {...register("lastName")}
              />
            )}
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message} hint="We'll send a 6-digit code to confirm it.">
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...register("email")}
            />
          )}
        </Field>

        <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register("password")}
            />
          )}
        </Field>

        <SubmitButton busy={isSubmitting} busyLabel="Creating account…">
          Create account
        </SubmitButton>

        <p className="text-[13px] leading-relaxed text-[#7B869C]">
          By creating an account you agree to our{" "}
          <Link href="/privacy" className="text-[#4A5670] underline underline-offset-2 hover:text-[#0B1B3F]">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <AuthFooter>
        Already have an account?{" "}
        <Link href="/sign-in" className={authLink}>
          Sign in
        </Link>
      </AuthFooter>
    </>
  );
}
