"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SocialButton } from "./SocialButton";
import { GoogleIcon } from "./GoogleIcon";
import { Cloud, GraduationCap, Eye, EyeOff, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// --- Schemas ---
const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
type FormData = z.infer<typeof signUpSchema>;
type AuthFormProps = { type: "signIn" | "signUp" };

const Divider = () => (
  <div className="relative my-5">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white px-2 text-gray-500">OR</span>
    </div>
  </div>
);

export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  useEffect(() => {
    const errorDescription = searchParams.get("error_description");
    if (errorDescription) {
      const replaced = errorDescription.replace(/\+/g, " ");
      let decoded = replaced;
      try {
        decoded = decodeURIComponent(replaced);
      } catch {}
      setApiError(decoded);
    }
  }, [searchParams]);

  // --- THIS IS THE CORRECTED OBJECT ---
  const content = {
    signIn: {
      Icon: Cloud,
      title: "Welcome Back",
      subtitle: "Sign in to your ZIGEX account",
      buttonText: "Log In",
      socialButtonText: "Sign In",
      linkText: "Don't have an account?",
      linkHref: "/sign-up",
      linkActionText: "Sign Up",
    },
    signUp: {
      Icon: GraduationCap,
      title: "Create Your Student Account",
      subtitle: "Join thousands of students finding amazing internships",
      buttonText: "Create Account",
      socialButtonText: "Sign Up",
      linkText: "Already have an account?",
      linkHref: "/sign-in",
      linkActionText: "Sign In",
    },
  };
  const currentContent = content[type];
  const finePrint =
    "By continuing, you agree to our Terms of Service and Privacy Policy.";

  const handleGoogleSignIn = async () => {
    setApiError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setApiError(error.message);
    } else if (data.url) {
      router.push(data.url);
    }
  };

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    if (isSignUp) {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, origin: window.location.origin }),
        });
        const responseData = await response.json();
        if (!response.ok)
          throw new Error(responseData.error || "Sign-up failed.");
        setEmailSent(true);
      } catch (err) {
        setApiError((err as Error).message);
      }
    } else {
      // Sign-in logic
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const responseData = await response.json();
        if (!response.ok)
          throw new Error(responseData.error || "Login failed.");
        router.push(
          responseData.profileComplete ? "/dashboard" : "/create-profile"
        );
      } catch (err) {
        setApiError((err as Error).message);
      }
    }
  };

  if (isSignUp && emailSent) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex flex-col justify-center items-center text-center min-h-[650px]">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <MailCheck className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Confirm your email
        </h1>
        <p className="mt-2 text-gray-600">
          We&lsquo;ve sent a verification link to your email address. Please
          click the link to continue.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Didn&lsquo;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex flex-col justify-center min-h-[650px]">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <currentContent.Icon className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {currentContent.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{currentContent.subtitle}</p>
      </div>
      <div className="mt-5 space-y-3">
        <SocialButton
          icon={GoogleIcon}
          onClick={handleGoogleSignIn}
          text={`${currentContent.socialButtonText} with Google`}
        />
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="mt-1 text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              {...register("fullName")}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="mt-1 text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="Enter your password"
              className="focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              {...register("password")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        {apiError && (
          <p className="text-sm text-red-500 text-center pt-1">{apiError}</p>
        )}
        <Button
          type="submit"
          className="w-full !mt-6 text-base py-2.5 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              <span>Processing...</span>
            </>
          ) : (
            currentContent.buttonText
          )}
        </Button>
      </form>
      <div className="flex-grow"></div>
      <div className="space-y-4 text-center mt-5">
        {isSignUp && (
          <p className="text-sm text-gray-500">
            Looking to hire?{" "}
            <Link
              href="/company/sign-up"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign up as a company
            </Link>
          </p>
        )}
        <p className="text-sm text-gray-600">
          {currentContent.linkText}{" "}
          <Link
            href={currentContent.linkHref}
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {currentContent.linkActionText}
          </Link>
        </p>
      </div>
      <p className="text-center text-xs text-gray-400 pt-4 mt-2">{finePrint}</p>
    </div>
  );
};
