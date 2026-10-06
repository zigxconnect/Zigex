import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/sections/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in | Zigex" };

function FormFallback() {
  return <div className="h-[420px] rounded-2xl bg-[#F8FAFF] motion-safe:animate-pulse" aria-busy="true" aria-label="Loading" />;
}

// Signed-in students never reach this page: proxy.ts redirects them to /feed.
export default function SignInPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <AuthForm type="signIn" />
    </Suspense>
  );
}
