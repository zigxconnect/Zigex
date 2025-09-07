"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { KeyRound } from "lucide-react";
import { Spinner } from "@/components/uiComponenet/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/uiComponenet/input";

const formSchema = z.object({
  token: z.string().length(6, { message: "Your code must be 6 digits." }),
});
type FormData = z.infer<typeof formSchema>;

export const VerifyOtpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const supabase = createClient();

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    if (!email) return alert("Email not found. Please try signing in again.");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.token,
      type: "email",
    });

    if (error) {
      alert(error.message || "Invalid OTP. Please try again.");
    } else {
      router.push("/admin/dashboard");
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to send code.");

      setResendSuccess("A new code has been sent to your email.");
      setCountdown(30);
    } catch (error) {
      setResendError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl text-center text-red-500">
        <p>Error: Email parameter is missing.</p>
        <p>
          Please{" "}
          <a href="/sign-in" className="underline font-semibold">
            return to the sign-in page
          </a>{" "}
          and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-gray-800">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <Input
            placeholder="123456"
            {...register("token")}
            disabled={isSubmitting}
            className="mt-1 tracking-[1em] text-center"
          />
          {errors.token && (
            <p className="text-xs text-red-500 mt-1">{errors.token.message}</p>
          )}
        </div>
        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner /> Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {resendSuccess && (
          <p className="text-green-600 mb-2">{resendSuccess}</p>
        )}
        {resendError && <p className="text-red-600 mb-2">{resendError}</p>}
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isResending || countdown > 0}
          className="text-orange-500 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-wait"
        >
          {isResending
            ? "Sending..."
            : countdown > 0
            ? `Resend code in ${countdown}s`
            : "Didn't receive a code? Resend"}
        </button>
      </div>
    </div>
  );
};
