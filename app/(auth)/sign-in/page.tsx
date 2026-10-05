import { AuthForm } from "@/components/sections/auth/AuthForm";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/uiComponent/Spinner";

export const metadata: Metadata = {
  title: "Sign In",
};

// Signed-in students never reach this page: proxy.ts redirects them to /feed.
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-2xl flex items-center justify-center min-h-[650px]">
          <Spinner />
        </div>
      }
    >
      <AuthForm type="signIn" />
    </Suspense>
  );
}
