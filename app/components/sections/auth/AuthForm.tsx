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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      type,
      fullName: isSignUp ? fullName : undefined,
      email,
      password,
    });
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

        <Button type="submit" className="w-full !mt-6">
          {isSignUp ? "Create Account" : "Sign In"}
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
