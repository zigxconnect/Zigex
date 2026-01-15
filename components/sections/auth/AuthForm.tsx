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

  // Initialize Google Identity Services on mount
  useEffect(() => {
    let isMounted = true;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (googleClientId && (window as any).google) {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: googleClientId,
        itp_support: true,
        use_fedcm_for_prompt: true,
        callback: async (response: any) => {
          if (!isMounted) return;
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (error) {
            console.error("Supabase ID Token Auth Error:", error);
            if (error.message.toLowerCase().includes("audience")) {
              toast.error("Config Error: Add your Google Client ID to 'Authorized Client IDs' in Supabase Dashboard (Auth -> Providers -> Google).", { duration: 6000 });
            } else {
              toast.error(error.message);
            }
          } else {
            toast.success("Logged in successfully!");
            router.push(data.user ? "/dashboard" : "/create-profile");
          }
        },
      });

      // Render the official Google button
      const parent = document.getElementById("google-button-container");
      if (parent) {
        google.accounts.id.renderButton(parent, {
          theme: "outline",
          size: "large",
          width: 400, // Matches our form width
          text: isSignUp ? "signup_with" : "signin_with",
          shape: "rectangular",
        });
      }

      // Small delay for the One Tap prompt to avoid conflicts with button rendering
      setTimeout(() => {
        if (isMounted) {
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            }
          });
        }
      }, 500);
    }

    if (!isSignUp) {
      fetch("/api/auth/login")
        .then((res) => res.json())
        .then((data) => setCsrfToken(data.csrfToken))
        .catch(() => setCsrfToken(null));
    }

    return () => {
      isMounted = false;
    };
  }, [isSignUp, router, supabase.auth]);

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
    // If a Google Client ID is provided, we use the ID Token flow to avoid the Supabase URL on the consent screen.
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (googleClientId && (window as any).google) {
      const google = (window as any).google;

      // Since we initialize in useEffect, we just need to trigger the prompt here.
      // We use 'toggle_display: true' to ensure it shows if the user explicitly clicks.
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is blocked or skipped, we fall back to the standard OAuth flow 
          // to ensure the user can still sign in, but they will see the supabase.co URL.
          console.log("One Tap skipped or not displayed, falling back to standard OAuth");
          startStandardOAuth();
        }
      });
      return;
    }

    // Default Supabase OAuth flow
    await startStandardOAuth();
  };

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
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-2xl flex flex-col justify-center items-center text-center min-h-[650px]">
        <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <MailCheck className="w-9 h-9 text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Confirm your email
        </h1>
        <p className="mt-2 text-muted-foreground">
          We&lsquo;ve sent a verification link to your email address. Please
          click the link to continue.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Didn&lsquo;t receive it? Check your spam folder.
        </p>
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
        {/* Official Google Button Container */}
        <div id="google-button-container" className="w-full flex justify-center min-h-[44px]"></div>

        {/* Custom button as a fallback if Google script fails to load Client ID */}
        {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <SocialButton
            icon={GoogleIcon}
            onClick={handleGoogleSignIn}
            text={`${currentContent.socialButtonText} with Google`}
          />
        )}
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

