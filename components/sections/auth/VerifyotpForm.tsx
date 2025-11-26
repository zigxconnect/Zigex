"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/sections/auth/OtpInput";

// --- Constants for maintainability ---
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

// --- Define the form schema using the constant ---
const formSchema = z.object({
  token: z
    .string()
    .length(OTP_LENGTH, `Your code must be ${OTP_LENGTH} digits.`),
});
type FormData = z.infer<typeof formSchema>;

// --- Type for unified form messages ---
type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

/**
 * A form component for verifying a user's OTP sent via email.
 * It handles OTP submission, validation, and a resend mechanism with a cooldown.
 */
export const VerifyOtpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "" },
  });

  // --- Countdown timer effect ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- Main form submission handler ---
  const onSubmit = async (data: FormData) => {
    if (!email) {
      setFormMessage({
        type: "error",
        text: "Email not found. Please try signing in again.",
      });
      return;
    }

    setFormMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: data.token }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("verify-otp-server error:", err, res.status);
        setError("token", {
          type: "manual",
          message: err?.error || "Invalid or expired code. Please try again.",
        });
        return;
      }

      // Success — server should have set the session cookies for middleware
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("verify-otp-server unexpected error", e);
      setFormMessage({ type: "error", text: "An unexpected error occurred." });
    }
  };

  // --- OTP resend handler ---
  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    setFormMessage(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send code.");
      }

      setFormMessage({
        type: "success",
        text: "A new code has been sent to your email.",
      });
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setFormMessage({ type: "error", text: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  // --- Graceful handling if email is missing from URL ---
  if (!email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-xl">Missing Information</CardTitle>
          <CardDescription>
            The email address is missing. Please return to the sign-in page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            className="w-full"
          >
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
        <CardTitle className="mt-4 text-2xl">Check your email</CardTitle>
        <CardDescription>
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-semibold text-foreground break-all">
            {email}
          </span>
          .
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Controller
              control={control}
              name="token"
              render={({ field }) => (
                <OtpInput
                  length={OTP_LENGTH}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.token && (
              <p className="text-sm text-destructive text-center pt-2">
                {errors.token.message}
              </p>
            )}
          </div>

          {formMessage && (
            <FormStatusMessage
              type={formMessage.type}
              text={formMessage.text}
            />
          )}

          <Button
            variant="orange"
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting ? "Verifying..." : "Verify & Sign In"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-sm">
        <p className="text-muted-foreground">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || countdown > 0}
            className="font-semibold text-orange-500 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${countdown}s`
                : "Click to resend"}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

/**
 * A small component to display success or error messages consistently.
 */
const FormStatusMessage = ({ type, text }: NonNullable<FormMessage>) => {
  const isError = type === "error";
  const Icon = isError ? ShieldAlert : ShieldCheck;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg text-sm",
        isError
          ? "bg-destructive/10 text-destructive"
          : "bg-emerald-500/10 text-emerald-700"
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{text}</span>
    </div>
  );
};
