import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/sections/auth/AuthForm";

export const metadata: Metadata = { title: "Create your account" };

function FormFallback() {
  return <div className="h-[420px] rounded-2xl bg-[#F8FAFF] motion-safe:animate-pulse" aria-busy="true" aria-label="Loading" />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <AuthForm type="signUp" />
    </Suspense>
  );
}
