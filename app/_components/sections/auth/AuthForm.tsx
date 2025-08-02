"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { SocialButton } from "./SocialButton";
import { GoogleIcon } from "./GoogleIcon";
import { Cloud, GraduationCap, Eye, EyeOff, Linkedin } from "lucide-react";

type AuthFormProps = { type: "signIn" | "signUp" };

// A reusable visual divider component with text.
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

/**
 * AuthForm Component
 * The complete, reusable form with full API integration for both user
 * registration (sign-up) and authentication (sign-in) with intelligent redirection.
 */
export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const router = useRouter();

  // State management for all form fields, loading status, and error messages
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The complete configuration object holding all dynamic text and icons.
  const content = {
    signIn: {
      Icon: Cloud,
      title: "Welcome Back",
      subtitle: "Sign in to your FutureProspect account",
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

  // Handles form submission by calling the appropriate API endpoint.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isSignUp) {
      // --- SIGN UP LOGIC ---
      try {
        // Step 1: Register the user
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName }),
        });
        const registerData = await registerResponse.json();
        if (!registerResponse.ok) {
          throw new Error(registerData.error || "Sign-up failed.");
        }

        // Step 2: CRITICAL - Immediately log the user in to create a session
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(
            loginData.error ||
              "Auto-login failed after sign-up. Please try logging in manually."
          );
        }

        // Step 3: After sign-up, always redirect to the profile creation page.
        router.push("/create-profile");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- SIGN IN LOGIC ---
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error || "Login failed. Please check your credentials."
          );
        }

        // Intelligently redirect based on the API response
        if (data.profileComplete) {
          router.push("/dashboard");
        } else {
          router.push("/create-profile");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex flex-col justify-center min-h-[650px]">
      {/* Header Section */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <currentContent.Icon className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {currentContent.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{currentContent.subtitle}</p>
      </div>

      {/* Social Login Section */}
      <div className="mt-5 space-y-3">
        <SocialButton
          icon={Linkedin}
          text={`${currentContent.socialButtonText} with LinkedIn`}
          className="bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
        />
        <SocialButton
          icon={GoogleIcon}
          text={`${currentContent.socialButtonText} with Google`}
        />
      </div>
      <Divider />

      {/* Main Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            {!isSignUp && (
              <Link
                href="#"
                className="text-sm text-orange-500 hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={
                isSignUp ? "Create a strong password" : "Enter your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error message display */}
        {error && (
          <p className="text-sm text-red-500 text-center pt-1">{error}</p>
        )}

        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 text-base py-2.5"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : currentContent.buttonText}
        </Button>
      </form>

      {/* Spacer and Footer Links */}
      <div className="flex-grow"></div>
      <p className="text-center text-sm text-gray-600 mt-5">
        {currentContent.linkText}{" "}
        <Link
          href={currentContent.linkHref}
          className="font-semibold text-orange-500 hover:underline cursor-pointer"
        >
          {currentContent.linkActionText}
        </Link>
      </p>
      <p className="text-center text-xs text-gray-400 pt-2 mt-2">{finePrint}</p>
    </div>
  );
};
