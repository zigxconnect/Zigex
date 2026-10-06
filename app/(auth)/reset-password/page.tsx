import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/sections/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password" };

function FormFallback() {
  return <div className="h-[420px] rounded-2xl bg-[#F8FAFF] motion-safe:animate-pulse" aria-busy="true" aria-label="Loading" />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
