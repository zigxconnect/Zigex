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
import { toast } from "react-hot-toast";

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
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center text-sm uppercase">
      <span className="bg-card px-3 text-muted-foreground font-medium">Or</span>
    </div>
  </div>
);

export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [signInCooldown, setSignInCooldown] = useState(0);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const [supabase] = useState(() => createClient());
  const googleButtonRef = typeof window !== 'undefined' ? (window as any).googleButtonRef : null;

  // Fetch CSRF token on mount
  useEffect(() => {
    if (!isSignUp) {
      fetch("/api/auth/login")
        .then((res) => res.json())
        .then((data) => setCsrfToken(data.csrfToken))
        .catch(() => setCsrfToken(null));
    }
  }, [isSignUp]);

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
      } catch { }
      toast.error(decoded);
    }
  }, [searchParams]);

  // Cooldown timer for sign-in to avoid spamming OTP requests
  useEffect(() => {
    if (signInCooldown <= 0) return;
    const t = setInterval(
      () => setSignInCooldown((c) => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [signInCooldown]);

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
    // console.log("[AuthForm] handleGoogleSignIn triggered");
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isGoogleScriptLoaded = typeof window !== 'undefined' && (window as any).google;

    // console.log("[AuthForm] Google Client ID exists:", !!googleClientId);
    // console.log("[AuthForm] Google Script loaded:", !!isGoogleScriptLoaded);

    if (!isGoogleScriptLoaded || !googleClientId) {
      // console.log("[AuthForm] Falling back to standard OAuth flow");
      await startStandardOAuth();
    } else {
      // console.log("[AuthForm] Google script is loaded, the invisible overlay should have handled this click. If you see this, the overlay might have failed.");
      // As an emergency fallback, trigger the ID token prompt manually
      (window as any).google.accounts.id.prompt();
    }
  };
  // Initialize Google Identity Services
  useEffect(() => {
    let isMounted = true;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      console.warn("[AuthForm] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing");
    }

    if (googleClientId && (window as any).google) {
      console.log("[AuthForm] Initializing Google Identity Services");
      const google = (window as any).google;

      google.accounts.id.initialize({
        client_id: googleClientId,
        itp_support: true,
        use_fedcm_for_prompt: true,
        callback: async (response: any) => {
          if (!isMounted) return;
          console.log("[AuthForm] Google ID Token received, signing in with Supabase...");
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (error) {
            console.error("[AuthForm] Supabase ID Token Auth Error:", error);
            toast.error(error.message);
          } else {
            console.log("[AuthForm] Supabase sign-in successful, user:", data.user?.id);
            toast.success("Logged in successfully!");

            // Refresh session to ensure cookies are synced
            await supabase.auth.refreshSession();

            // Check if profile exists and is complete
            const { data: profile } = await supabase
              .from("student_profiles")
              .select("profile_status")
              .eq("user_id", data.user?.id)
              .maybeSingle();

            // Redirect based on profile status
            if (profile?.profile_status === "complete") {
              window.location.href = "/dashboard";
            } else {
              window.location.href = "/create-profile";
            }
          }
        },
      });

      // Render the official Google button INVISIBLY on top of our custom button
      const parent = document.getElementById("google-button-overlay");
      if (parent) {
        console.log("[AuthForm] Rendering invisible Google button onto overlay");
        google.accounts.id.renderButton(parent, {
          theme: "filled_black",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: isSignUp ? "signup_with" : "signin_with",
          width: 400,
        });
      }
    } else {
      console.log("[AuthForm] Google script or Client ID not ready for Identity Services");
    }

    return () => {
      isMounted = false;
    };
  }, [isSignUp, router, supabase]);
      // console.warn("[AuthForm] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing");
      // console.log("[AuthForm] Initializing Google Identity Services");
      // console.log("[AuthForm] Google ID Token received, signing in with Supabase...");
      // console.error("[AuthForm] Supabase ID Token Auth Error:", error);
      // console.log("[AuthForm] Supabase sign-in successful, user:", data.user?.id);
      // console.log("[AuthForm] Rendering invisible Google button onto overlay");
      // console.log("[AuthForm] Google script or Client ID not ready for Identity Services");

  const startStandardOAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else if (data.url) {
      router.push(data.url);
    }
  };

  const onSubmit = async (data: FormData) => {
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
        toast.success("Verification email sent! Please check your inbox.");
      } catch (err) {
        toast.error((err as Error).message);
      }
    } else {
      // Sign-in logic
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
          },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const responseData = await response.json();
        if (response.status === 429) {
          // Rate limit exceeded
          const ra = response.headers?.get?.("Retry-After");
          const retryAfter = ra ? Number(ra) : responseData.retryAfter || 10;
          setSignInCooldown(Number.isFinite(retryAfter) ? retryAfter : 10);
          const errorMsg = responseData.error || "Too many login attempts. Please wait before retrying.";
          setRateLimitError(errorMsg);
          toast.error(errorMsg);
          return;
        }
        if (!response.ok)
          throw new Error(responseData.error || "Login failed.");
        // If the server indicates an OTP was sent (company flow), redirect
        // to the verify page and include the email in the query string.
        if (responseData?.otpSent) {
          const ra = response.headers?.get?.("Retry-After");
          const retryAfter = ra ? Number(ra) : responseData.retryAfter || 10;
          setSignInCooldown(Number.isFinite(retryAfter) ? retryAfter : 10);
          toast.success("OTP sent to your email.");
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } else {
          toast.success("Logged in successfully!");
          router.push(
            responseData.profileComplete ? "/dashboard" : "/create-profile"
          );
        }
      } catch (err) {
        toast.error((err as Error).message);
      }
    }
  };


  if (isSignUp && emailSent) {
    return (
      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center min-h-[650px] relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Animated Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
            <MailCheck className="w-10 h-10 text-white" />
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Check your inbox!
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-sm">
            We&apos;ve sent a verification link to your email address. Click the link to activate your account.
          </p>

          {/* Visual Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Spam Notice Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg">📁</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Not in your inbox?
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Check your <span className="font-bold">Spam</span> or <span className="font-bold">Promotions</span> folder. Sometimes emails take a minute to arrive.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Sign In */}
          <p className="mt-6 text-sm text-muted-foreground">
            Already verified?{" "}
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-2xl flex flex-col justify-center min-h-[650px]">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <currentContent.Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          {currentContent.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{currentContent.subtitle}</p>
      </div>
      <div className="mt-5 space-y-3">
        {/* Custom Google Button matching App Theme with Invisible Overlay */}
        <div className="relative w-full">
          {/* The visible custom button */}
          <SocialButton
            icon={GoogleIcon}
            onClick={handleGoogleSignIn} // Now has fallback logic
            text={`${currentContent.socialButtonText} with Google`}
          />
          {/* The invisible official Google button layered on top */}
          <div
            id="google-button-overlay"
            className="absolute inset-0 z-10 opacity-0 overflow-hidden"
            style={{ transform: 'scale(1.05)' }} // Slight scale to ensure full coverage
          />
        </div>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="mt-1 text-foreground focus:border-primary focus:ring-2 focus:ring-ring"
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
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="mt-1 text-foreground focus:border-primary focus:ring-2 focus:ring-ring"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline cursor-pointer"
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
              className="focus:border-primary focus:ring-2 focus:ring-ring"
              {...register("password")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {isSignUp && (
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long.
            </p>
          )}
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full !mt-6 text-base py-2.5 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all duration-200"
          disabled={isSubmitting || signInCooldown > 0}
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
      {signInCooldown > 0 && (
        <p className="text-center text-sm text-red-500 mt-2">
          {rateLimitError
            ? `${rateLimitError} (${signInCooldown}s)`
            : `Please wait ${signInCooldown}s before retrying sign-in.`}
        </p>
      )}
      <div className="space-y-4 text-center mt-5">
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
      <p className="text-center text-xs text-muted-foreground/60 pt-4 mt-2">{finePrint}</p>
    </div>
  );
};

