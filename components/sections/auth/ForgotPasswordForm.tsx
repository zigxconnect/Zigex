"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/uiComponent/Spinner";
import Link from "next/link";
import { Mail, AlertTriangle, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [formState, setFormState] = useState<"idle" | "success">("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    // Optional: wrap fetch with a timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const responseData = await response.json();
        setSubmittedEmail(data.email);
        setFormState("success");
      } else {
        let errorMsg = "An error occurred.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          try {
            errorMsg = await response.text();
          } catch {}
        }
        throw new Error(errorMsg);
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  if (formState === "success") {
    return (
      <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-2xl">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a password reset link to <br />
          <span className="font-semibold text-gray-800">{submittedEmail}</span>
        </p>
        <div className="mt-6">
          <Link
            href="/sign-in"
            className="text-sm text-orange-500 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Forgot Password
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="mt-1 text-gray-900"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="flex items-center text-xs text-red-500 mt-1">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {apiError && (
          <p className="flex items-center justify-center text-sm text-red-500 text-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {apiError}
          </p>
        )}

        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 text-base py-2.5 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Send Reset Link"}
        </Button>
      </form>
      <div className="text-center mt-4">
        <Link
          href="/sign-in"
          className="text-sm text-orange-500 hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
