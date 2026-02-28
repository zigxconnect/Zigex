"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/uiComponent/Spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, { message: "Must include an uppercase letter." })
      .regex(/[0-9]/, { message: "Must include a number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof updatePasswordSchema>;

const StrengthMeter = ({ password = "" }: { password?: string }) => {
  const checks = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.met).length;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-500 ${i <= score
              ? score <= 2 ? "bg-red-400" : score === 3 ? "bg-amber-400" : "bg-emerald-500"
              : "bg-gray-100"
              }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check, i) => (
          <span key={i} className={`text-[10px] flex items-center gap-1 transition-colors ${check.met ? "text-emerald-600 font-medium" : "text-gray-400"}`}>
            <div className={`w-1 h-1 rounded-full ${check.met ? "bg-emerald-500" : "bg-gray-300"}`} />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const UpdatePasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [hasVerificationFailed, setHasVerificationFailed] = useState(false);
  const [formState, setFormState] = useState<"idle" | "success">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [supabase] = useState(() => createClient());

  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";

  useEffect(() => {
    // Check for errors passed from the callback route
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      console.error("[UpdatePasswordForm] Auth Error:", errorParam, errorDescription);
      setApiError(errorDescription?.replace(/\+/g, " ") || "The reset link is invalid or has expired.");
      setHasVerificationFailed(true);
      return;
    }

    // Safety timeout: If we don't have a session after 8 seconds, something is wrong
    verificationTimeoutRef.current = setTimeout(() => {
      if (!isSessionReady) {
        setHasVerificationFailed(true);
        setApiError("Authentication session could not be established. Please try requesting a new link.");
      }
    }, 8000);

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsSessionReady(true);
        if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsSessionReady(true);
        if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    };
  }, [supabase, searchParams, isSessionReady]);

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;

      setFormState("success");
      toast.success("Security updated successfully");

      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setApiError(err.message || "Failed to update password.");
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {hasVerificationFailed ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Access Denied</h1>
            <p className="mt-3 text-gray-500 leading-relaxed text-[15px]">
              {apiError || "This link is no longer valid or the session has expired for security reasons."}
            </p>
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full mt-8 h-12 bg-gray-900 hover:bg-black text-white rounded-xl transition-all shadow-sm"
            >
              Request New Link
            </Button>
          </motion.div>
        ) : !isSessionReady ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Spinner className="h-8 w-8 text-blue-500" />
            <p className="mt-6 text-gray-500 font-medium animate-pulse">Establishing secure connection...</p>
          </motion.div>
        ) : formState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Identity Secured</h1>
            <p className="mt-3 text-gray-500 text-[15px]">
              Your password has been changed. <br /> Taking you to your dashboard now.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50"
          >
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <LockKeyhole size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Password</h1>
              <p className="text-gray-500 mt-2 text-[15px]">Update your credentials to secure your account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-700 ml-1">NEW PASSWORD</label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-300 ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""
                      }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 ml-1">
                    <AlertTriangle size={12} /> {errors.password.message}
                  </p>
                )}

                <StrengthMeter password={passwordValue} />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-700 ml-1">CONFIRM PASSWORD</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-300 ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""
                    }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 ml-1">
                    <AlertTriangle size={12} /> {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-200/50 disabled:opacity-70 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-4 w-4 text-white" />
                      <span>Securing...</span>
                    </div>
                  ) : (
                    "Update Security"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => router.push("/sign-in")}
                className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Return to Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
