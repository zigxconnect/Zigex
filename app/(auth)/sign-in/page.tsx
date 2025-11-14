import { AuthForm } from "@/components/sections/auth/AuthForm";
import { checkAuthStatus } from "@/lib/actions/auth.action";
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Spinner } from "@/components/uiComponent/Spinner";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  try {
    await checkAuthStatus();
    redirect("/feed");
  } catch (error) {}

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex items-center justify-center min-h-[650px]">
          <Spinner />
        </div>
      }
    >
      <AuthForm type="signIn" />
    </Suspense>
  );
}
