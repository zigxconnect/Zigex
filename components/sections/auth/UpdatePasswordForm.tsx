"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/uiComponent/Spinner";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof updatePasswordSchema>;

const PasswordStrengthIndicator = ({
  password = "",
}: {
  password?: string;
}) => {
  const checks = [
    { regex: /.{8,}/, message: "8 characters minimum" },
    { regex: /[A-Z]/, message: "One uppercase letter" },
    { regex: /[a-z]/, message: "One lowercase letter" },
    { regex: /[0-9]/, message: "One number" },
  ];
  const passedChecks = checks.filter((check) =>
    check.regex.test(password)
  ).length;
  const strength = passedChecks;

  const strengthColors = [
    "", // 0 (unused)
    "bg-red-500", // 1
    "bg-yellow-500", // 2
    "bg-blue-500", // 3
    "bg-green-500", // 4
  ];

  if (!password) {
    return null; // Don't show the indicator if there's no password input yet
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-200">
        <div
          className={`h-full ${strengthColors[strength] || ""} transition-all duration-300`}
          style={{ width: `${strength * 25}%` }}
        />
      </div>
      <ul className="grid grid-cols-2 gap-x-4 text-xs text-gray-500">
        {checks.map((check, i) => (
          <li
            key={i}
            className={`flex items-center transition-colors duration-300 ${
              check.regex.test(password) ? "text-green-600" : ""
            }`}
          >
            <CheckCircle
              size={12}
              className="mr-1.5 flex-shrink-0"
              style={{
                opacity: check.regex.test(password) ? 1 : 0.3,
              }}
            />
            {check.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const UpdatePasswordForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [formState, setFormState] = useState<"idle" | "success">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
  });

  const passwordValue = useWatch({ control, name: "password" });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsSessionReady(true);
    });
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setIsSessionReady(true);
    };
    checkSession();
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw new Error(error.message);
      setFormState("success");
      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  if (!isSessionReady) {
    return (
      <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Verifying Link...</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we securely verify your request.
        </p>
        <div className="mt-4">
          <Spinner />
        </div>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-2xl">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Password Updated!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your password has been changed successfully. Redirecting you to sign
          in...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        {/* MODIFIED: Changed icon background to blue-500 */}
        <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <LockKeyhole className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Set New Password
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Please create a new, secure password.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              // MODIFIED: Added blue focus styles
              className="focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center text-xs text-red-500 mt-1">
              <AlertTriangle size={14} className="mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>

        <PasswordStrengthIndicator password={passwordValue} />

        <div>
          <label className="text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              // MODIFIED: Added blue focus styles
              className="focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="flex items-center text-xs text-red-500 mt-1">
              <AlertTriangle size={14} className="mr-1" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {apiError && (
          <p className="flex items-center justify-center text-sm text-red-500 text-center">
            <AlertTriangle size={14} className="mr-2" />
            {apiError}
          </p>
        )}

        {/* MODIFIED: Changed button from orange to blue */}
        <Button
          type="submit"
          className="w-full !mt-6 text-base py-2.5 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Update Password"}
        </Button>
      </form>
    </div>
  );
};
