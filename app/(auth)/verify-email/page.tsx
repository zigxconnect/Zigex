import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/sections/auth/VerifyEmailForm";

export const metadata: Metadata = { title: "Verify your email" };

function FormFallback() {
  return <div className="h-[420px] rounded-2xl bg-[#F8FAFF] motion-safe:animate-pulse" aria-busy="true" aria-label="Loading" />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
