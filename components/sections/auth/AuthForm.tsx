"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { getReturnUrl } from "@/lib/utils/redirect";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { GoogleSignInButton } from "./GoogleSignInButton";

// --- Schemas ---
const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    // The backend needs firstName + lastName, each at least 2 characters.
    .regex(/^\S{2,}(\s+\S+)*\s+\S{2,}$/, {
      message: "Please enter your first and last name.",
    }),
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

/** "Ada Lovelace King" → { firstName: "Ada", lastName: "Lovelace King" } */
function splitFullName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** Cooldown before the next sign-in attempt after the backend rate-limits us. */
function retryAfterSeconds(error: ApiClientError): number {
  const body = error.body as { retryAfter?: number } | undefined;
  return Number(body?.retryAfter) || 60;
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [signInCooldown, setSignInCooldown] = useState(0);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // Sign-in validates a subset of the sign-up fields (no fullName).
    resolver: (isSignUp ? zodResolver(signUpSchema) : zodResolver(signInSchema)) as unknown as Resolver<FormData>,
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "wrong_portal") {
      toast.error("This account is not a student account. Please use the company portal.", { duration: 6000 });
    }
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified! Please sign in.");
    }
  }, [searchParams]);

  // Cooldown timer after the backend rate-limits sign-in attempts
  useEffect(() => {
    if (signInCooldown <= 0) return;
    const t = setInterval(
      () => setSignInCooldown((c) => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [signInCooldown]);

  const content = {
    signIn: {
      title: "Welcome Back",
      subtitle: "Sign in to your ZIGEX account",
      buttonText: "Log In",
      linkText: "Don't have an account?",
      linkHref: "/sign-up",
      linkActionText: "Sign Up",
    },
    signUp: {
      title: "",
      subtitle: "Join thousands of students finding amazing internships",
      buttonText: "Create Account",
      linkText: "Already have an account?",
      linkHref: "/sign-in",
      linkActionText: "Sign In",
    },
  };
  const currentContent = content[type];
  const finePrint =
    "By continuing, you agree to our Terms of Service and Privacy Policy.";

  const goToVerifyEmail = (email: string) =>
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);

  const onSubmit = async (data: FormData) => {
    try {
      if (isSignUp) {
        await api.post("/auth/register/student", {
          email: data.email,
          password: data.password,
          ...splitFullName(data.fullName),
        });
        toast.success("Account created! Enter the code we emailed you.");
        goToVerifyEmail(data.email);
        return;
      }

      const res = await api.post<{ user: { role: string } }>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (res.data.user.role !== "student") {
        await api.post("/auth/logout").catch(() => {});
        toast.error("This is not a student account. Please use the company portal.");
        return;
      }

      toast.success("Logged in successfully!");
      // Full navigation so proxy.ts and server components see the new cookie.
      window.location.href = getReturnUrl("/feed");
    } catch (err) {
      if (!(err instanceof ApiClientError)) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      if (err.status === 429) {
        const msg = "Too many attempts. Please wait before retrying.";
        setSignInCooldown(retryAfterSeconds(err));
        setRateLimitError(msg);
        toast.error(msg);
        return;
      }
      // Login of an account that has not verified its OTP yet.
      if (!isSignUp && err.status === 401 && /verify your email/i.test(err.message)) {
        toast.error(err.message);
        await api.post("/auth/resend-otp", { email: data.email }).catch(() => {});
        goToVerifyEmail(data.email);
        return;
      }
      toast.error(
        err.status === 401 && !isSignUp ? "Invalid email or password." : err.message
      );
    }
  };

  return (
    <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden transition-all duration-300">
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-3xl" />
      
      <div className="text-center relative z-10">
        <div className="mx-auto w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 mb-3 transform hover:scale-105 transition-transform">
          <img
            src="https://i.ibb.co/Cp502Yby/logo.png"
            alt="Zigex Logo"
            className="w-9 h-9 object-contain drop-shadow-md"
          />
        </div>
        {currentContent.title && (
          <h1 className="mt-2 text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {currentContent.title}
          </h1>
        )}
        <p className={`mt-2 text-sm font-semibold ${currentContent.title ? 'text-slate-600 dark:text-slate-400' : 'text-[#155DFC] dark:text-blue-400 text-base'}`}>{currentContent.subtitle}</p>
      </div>
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <>
        <div className="mt-5 relative z-10">
          <GoogleSignInButton text={isSignUp ? "signup_with" : "signin_with"} />
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground font-medium">Or</span>
          </div>
        </div>
        </>
      ) : (
        <div className="mt-5" />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
        {isSignUp && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <label className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="mt-1 h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20 rounded-xl transition-all duration-300 shadow-sm placeholder:text-slate-400 font-medium"
              {...register("fullName")}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-xs font-bold text-rose-500 mt-1.5 animate-in slide-in-from-left-2">
                {errors.fullName.message}
              </p>
            )}
          </div>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <label className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">Email Address</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="mt-1 h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20 rounded-xl transition-all duration-300 shadow-sm placeholder:text-slate-400 font-medium"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs font-bold text-rose-500 mt-1.5 animate-in slide-in-from-left-2">{errors.email.message}</p>
          )}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
              Password
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-[#155DFC] hover:text-[#1A3CB9] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="••••••••"
              className="h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20 rounded-xl transition-all duration-300 shadow-sm placeholder:text-slate-400 font-medium"
              {...register("password")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-slate-400 hover:text-[#155DFC] transition-colors"
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {isSignUp && !errors.password && (
            <p className="text-xs font-medium text-slate-500 mt-1.5">
              Must be at least 6 characters long.
            </p>
          )}
          {errors.password && (
            <p className="text-xs font-bold text-rose-500 mt-1.5 animate-in slide-in-from-left-2">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full h-11 bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both"
          disabled={isSubmitting || (signInCooldown > 0 && !isSignUp)}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5 text-white" />
              <span>Please wait...</span>
            </div>
          ) : (
            currentContent.buttonText
          )}
        </Button>
      </form>
      <div className="flex-grow"></div>
      {signInCooldown > 0 && (
        <p className="text-center text-sm text-red-500 mt-2">
          {rateLimitError
            ? `${rateLimitError} (${signInCooldown}s)`
            : `Please wait ${signInCooldown}s before retrying sign-in.`}
        </p>
      )}
      <div className="space-y-3 text-center mt-4">
        {isSignUp && (
          <p className="text-sm text-muted-foreground">
            {/* Looking to hire?{" "} */}
            <Link
              href="/company/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              {/* Sign up as a company */}
            </Link>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {currentContent.linkText}{" "}
          <Link
            href={currentContent.linkHref}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            {currentContent.linkActionText}
          </Link>
        </p>
      </div>
      <p className="text-center text-xs text-muted-foreground/60 pt-2 mt-1">{finePrint}</p>
    </div>
  );
};

