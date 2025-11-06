import { AuthForm } from "@/components/sections/auth/AuthForm";
import { Suspense } from "react";
import { Spinner } from "@/components/uiComponent/Spinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <Suspense 
      fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex items-center justify-center min-h-[650px]">
          <Spinner />
        </div>
      }
    >
      <AuthForm type="signUp" />
    </Suspense>
  );
}