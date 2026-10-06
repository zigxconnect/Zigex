"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/sections/auth/OtpInput";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { getReturnUrl } from "@/lib/utils/redirect";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const formSchema = z.object({
  otp: z.string().length(OTP_LENGTH, `Your code must be ${OTP_LENGTH} digits.`),
});
type FormData = z.infer<typeof formSchema>;
type FormMessage = { type: "success" | "error"; text: string } | null;

/**
 * Student email verification against the backend (POST /auth/verify-email).
 * A successful verify returns a token, which the /api/v1 passthrough stores
 * in the session cookie — so the student is signed in straight away.
 */
export const VerifyEmailForm = () => {
  const router = useRouter();
  const email = useSearchParams().get("email");

  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { otp: "" } });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async ({ otp }: FormData) => {
    if (!email) return;
    setFormMessage(null);
    try {
      const res = await api.post<{ user?: unknown }>("/auth/verify-email", { email, otp });
      // Older backend builds may verify without issuing a token — fall back to sign-in.
      if (!res.data?.user) {
        router.push(`/sign-in?verified=1`);
        return;
      }
      window.location.href = getReturnUrl("/feed");
    } catch (err) {
      setError("otp", {
        type: "manual",
        message:
          err instanceof ApiClientError && err.status === 400
            ? "Invalid or expired code. Please try again."
            : "Could not verify your code. Please try again.",
      });
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setFormMessage(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setFormMessage({ type: "success", text: "A new code has been sent to your email." });
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFormMessage({
        type: "error",
        text: err instanceof ApiClientError ? err.message : "Failed to send a new code.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-xl">Missing Information</CardTitle>
          <CardDescription>The email address is missing. Please sign up or sign in again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
            Return to Sign-In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-semibold text-foreground break-all">{email}</span>. Check your spam folder if
          you don&apos;t see it.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <OtpInput length={OTP_LENGTH} onChange={field.onChange} disabled={isSubmitting} />
              )}
            />
            {errors.otp && <p className="text-sm text-destructive text-center pt-2">{errors.otp.message}</p>}
          </div>

          {formMessage && <FormStatusMessage {...formMessage} />}

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#155DFC] hover:bg-[#1A3CB9] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-sm">
        <p className="text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="font-semibold text-primary hover:underline rounded-sm disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Click to resend"}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

const FormStatusMessage = ({ type, text }: NonNullable<FormMessage>) => {
  const isError = type === "error";
  const Icon = isError ? ShieldAlert : ShieldCheck;
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg text-sm",
        isError ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{text}</span>
    </div>
  );
};
