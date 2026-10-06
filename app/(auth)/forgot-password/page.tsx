import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/sections/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

function FormFallback() {
  return <div className="h-[320px] rounded-2xl bg-[#F8FAFF] motion-safe:animate-pulse" aria-busy="true" aria-label="Loading" />;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
