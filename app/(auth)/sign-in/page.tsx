// import { AuthForm } from "@/app/_components/sections/auth/AuthForm";
import { AuthForm } from "@/components/sections/auth/AuthForm";
import { checkAuthStatus } from "@/lib/actions/auth.action";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};

/**
 * This is now a Server Component. It runs on the server before rendering.
 * Its job is to check if a user is already authenticated.
 */
export default async function SignInPage() {
  try {
    await checkAuthStatus();

    redirect("/dashboard");
  } catch (error) {}

  return <AuthForm type="signIn" />;
}
