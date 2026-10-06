"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getReturnUrl } from "@/lib/utils/redirect";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  AuthFooter,
  AuthHeader,
  EmailSuggestion,
  Field,
  FormAlert,
  OrDivider,
  PasswordStrength,
  PasswordInput,
  SubmitButton,
  authLink,
  emailInputProps,
  inputClass,
  passwordStrength,
  useAuthNext,
} from "./auth-ui";

const email = z.string().trim().email({ message: "Enter a valid email address, like you@example.com." });

const signInSchema = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password." }),
});

// The backend needs firstName and lastName of at least 2 characters each.
const signUpSchema = z.object({
  firstName: z.string().trim().min(2, { message: "Enter your first name (2 letters or more)." }),
  lastName: z.string().trim().min(2, { message: "Enter your last name (2 letters or more)." }),
  email,
  password: z
    .string()
    .min(8, { message: "Use at least 8 characters." })
    .refine((p) => passwordStrength(p).level >= 2, { message: "Too weak. Mix in numbers or capital letters." }),
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
  const { applying, href } = useAuthNext();
  const prefilledEmail = params.get("email") ?? "";
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
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: prefilledEmail, password: "" },
  });
  const typedEmail = useWatch({ control, name: "email" }) ?? "";

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
        router.push(href("/verify-email", { email: data.email, sent: "1" }));
        return;
      }
      // Generic on purpose: never reveal whether the email has an account.
      setError(err.status === 401 ? "The email or password is incorrect." : err.message);
    }
  };

  return (
    <>
      <AuthHeader
        title={applying ? "Sign in to apply" : "Sign in to Zigex"}
        description={
          applying
            ? "You'll go straight back to the opportunity once you're signed in."
            : "Pick up where you left off with your applications."
        }
      />

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
            <>
              <input
                id={id}
                {...emailInputProps}
                autoFocus={!prefilledEmail}
                enterKeyHint="next"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                {...register("email")}
              />
              <EmailSuggestion value={typedEmail} onAccept={(v) => setValue("email", v, { shouldValidate: true })} />
            </>
          )}
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          aside={
            // Carry the typed email over so they don't type it twice.
            <Link href={href("/forgot-password", { email: typedEmail.trim() || undefined })} className={`${authLink} text-sm`}>
              Forgot password?
            </Link>
          }
        >
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              autoComplete="current-password"
              placeholder="Enter your password"
              autoFocus={Boolean(prefilledEmail)}
              enterKeyHint="go"
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
        <Link href={href("/sign-up")} className={authLink}>
          Create a free account
        </Link>
      </AuthFooter>
    </>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { applying, href } = useAuthNext();
  const [error, setError] = useState<ReactNode>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });
  const typedEmail = useWatch({ control, name: "email" }) ?? "";
  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = async (data: SignUpData) => {
    setError(null);
    try {
      await api.post("/auth/register/student", data);
      router.push(href("/verify-email", { email: data.email, sent: "1" }));
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setError(
          <>
            There&apos;s already an account for {data.email}.{" "}
            <Link href={href("/sign-in", { email: data.email })} className="font-semibold underline underline-offset-2">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href={href("/forgot-password", { email: data.email })} className="font-semibold underline underline-offset-2">
              reset your password
            </Link>
            .
          </>
        );
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
        title={applying ? "Create an account to apply" : "Create your student account"}
        description={
          applying
            ? "It's free and takes about a minute. We'll bring you back to the opportunity afterwards."
            : "Free for students. Apply to internships, programs and events with one profile."
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error && <FormAlert tone="error">{error}</FormAlert>}

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Field label="First name" error={errors.firstName?.message}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                autoComplete="given-name"
                autoCapitalize="words"
                placeholder="Amina"
                autoFocus
                enterKeyHint="next"
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
                autoCapitalize="words"
                placeholder="Fon"
                enterKeyHint="next"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                {...register("lastName")}
              />
            )}
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message} hint="We'll send a code here to confirm it.">
          {({ id, describedBy, invalid }) => (
            <>
              <input
                id={id}
                {...emailInputProps}
                enterKeyHint="next"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                {...register("email")}
              />
              <EmailSuggestion value={typedEmail} onAccept={(v) => setValue("email", v, { shouldValidate: true })} />
            </>
          )}
        </Field>

        <Field label="Password" error={errors.password?.message}>
          {({ id, describedBy, invalid }) => (
            <>
              <PasswordInput
                id={id}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                enterKeyHint="done"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("password")}
              />
              {!invalid && <PasswordStrength password={password} />}
            </>
          )}
        </Field>

        <SubmitButton busy={isSubmitting} busyLabel="Creating account…">
          Create account
        </SubmitButton>

        <p className="-mt-1 text-[13px] leading-relaxed text-[#7B869C]">
          By creating an account you agree to our{" "}
          <Link href="/privacy" className="text-[#4A5670] underline underline-offset-2 hover:text-[#0B1B3F]">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      {/* Below the form on sign-up, so the page fits a laptop screen without scrolling. */}
      {hasGoogle && (
        <>
          <OrDivider />
          <GoogleSignInButton text="signup_with" />
        </>
      )}

      <AuthFooter>
        Already have an account?{" "}
        <Link href={href("/sign-in")} className={authLink}>
          Sign in
        </Link>
      </AuthFooter>
    </>
  );
}
