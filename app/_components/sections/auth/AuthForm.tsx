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
 * The complete, reusable form for both user sign-in and sign-up.
 * It adapts its content and functionality based on the `type` prop and
 * handles redirection after a successful form submission.
 */
export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

  // Handles form submission and redirects the user.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send data to your backend API here.
    // We simulate a successful response and then redirect.

    if (isSignUp) {
      // After signing up, redirect to the create-profile page.
      router.push("/create-profile");
    } else {
      // After signing in, redirect to the main dashboard.
      router.push("/dashboard");
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
              type="text"
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            placeholder="Enter your email address"
            className="mt-1"
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
              type={showPassword ? "text" : "password"}
              placeholder={
                isSignUp ? "Create a strong password" : "Enter your password"
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 text-base py-2.5"
        >
          {currentContent.buttonText}
        </Button>
      </form>

      {/* Spacer to push footer content down */}
      <div className="flex-grow"></div>

      {/* Footer Links */}
      <p className="text-center text-sm text-gray-600 mt-5">
        {currentContent.linkText}{" "}
        <Link
          href={currentContent.linkHref}
          className="font-semibold text-orange-500 hover:underline cursor-pointer"
        >
          {currentContent.linkActionText}
        </Link>
      </p>

      {/* Fine Print */}
      <p className="text-center text-xs text-gray-400 pt-2 mt-2">{finePrint}</p>
    </div>
  );
};