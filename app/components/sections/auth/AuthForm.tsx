"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "../../ui/Logo";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";

type AuthFormProps = {
  type: "signIn" | "signUp";
};

export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate async submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log({
        type,
        fullName: isSignUp ? fullName : undefined,
        email,
        password,
      });
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <div className="text-center">
        <Logo isLink={false} className="justify-center" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-slate-500">
          {isSignUp ? "Get started on your journey." : "Sign in to continue."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-semibold text-blue-600 hover:underline"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Link>
      </p>
    </div>
  );
};
