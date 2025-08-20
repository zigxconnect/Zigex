"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { Button } from "@/app/_components/ui/Button";
// import { Input } from "@/app/_components/ui/Input";
// import { Spinner } from "@/app/_components/ui/Spinner";
import { SocialButton } from "./SocialButton";
import { GoogleIcon } from "./GoogleIcon";
import { Cloud, GraduationCap, Eye, EyeOff, Linkedin } from "lucide-react";
import { Input } from "@/components/uiComponenet/input";
import { Spinner } from "@/components/uiComponenet/Spinner";
import { Button } from "@/components/ui/Button";

// Schema for the Sign Up form
const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

// Schema for the Sign In form
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
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

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

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    if (isSignUp) {
      try {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!registerResponse.ok)
          throw new Error(
            (await registerResponse.json()).error || "Sign-up failed."
          );
        router.push("/create-profile");
      } catch (err) {
        setApiError((err as Error).message);
      }
    } else {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const responseData = await response.json();
        if (!response.ok)
          throw new Error(responseData.error || "Login failed.");

        if (responseData.otpSent) {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } else {
          if (responseData.profileComplete) {
            router.push("/dashboard");
          } else {
            router.push("/create-profile");
          }
        }
      } catch (err) {
        setApiError((err as Error).message);
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex flex-col justify-center min-h-[650px]">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <currentContent.Icon className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {currentContent.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{currentContent.subtitle}</p>
      </div>
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
              className="mt-1 text-gray-900"
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
            className="mt-1 text-gray-900"
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
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="Enter your password"
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
          variant="orange"
          type="submit"
          className="w-full !mt-6 text-base py-2.5 flex items-center justify-center gap-2"
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
              className="font-semibold text-orange-500 hover:underline"
            >
              Sign up as a company
            </Link>
          </p>
        )}
        <p className="text-sm text-gray-600">
          {currentContent.linkText}{" "}
          <Link
            href={currentContent.linkHref}
            className="font-semibold text-orange-500 hover:underline cursor-pointer"
          >
            {currentContent.linkActionText}
          </Link>
        </p>
      </div>
      <p className="text-center text-xs text-gray-400 pt-4 mt-2">{finePrint}</p>
    </div>
  );
};
