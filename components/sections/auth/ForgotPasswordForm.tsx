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
    try {
      // Add timeout via AbortController to avoid hanging requests
      const controller = new AbortController();
      const timeoutMs = 30000; // 30 seconds
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (response.ok) {
        setSubmittedEmail(data.email);
        setFormState("success");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reset link.");
      }
    } catch (err) {
      // Handle aborted requests separately. Use safe typing to check the name property.
      const maybeName = (err as { name?: unknown } | null)?.name;
      if (typeof maybeName === "string" && maybeName === "AbortError") {
        setApiError("The request timed out. Please try again.");
      } else {
        setApiError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
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
          We have sent a password reset link to <br />
          <span className="font-semibold text-gray-800">{submittedEmail}</span>
        </p>
        <div className="mt-6">
          {/* MODIFIED: Changed link color to blue */}
          <Link
            href="/sign-in"
            className="text-sm text-blue-600 hover:underline"
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
        {/* MODIFIED: Changed icon background to blue-500 */}
        <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Forgot Password
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          No worries, we will send you reset instructions.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            // MODIFIED: Added blue focus styles
            className="mt-1 text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
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

        {/* MODIFIED: Changed button from orange to blue */}
        <Button
          type="submit"
          className="w-full mt-6! text-base py-2.5 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Send Reset Link"}
        </Button>
      </form>
      <div className="text-center mt-4">
        {/* MODIFIED: Changed link color to blue */}
        <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
