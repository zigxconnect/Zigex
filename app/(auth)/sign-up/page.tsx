import { AuthForm } from "@/app/_components/sections/auth/AuthForm";
import { checkAuthStatus } from "@/lib/actions/auth.action";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up",
};

/**
 * This is now also a Server Component.
 * It uses the same pattern as the SignInPage to protect the route
 * from already authenticated users.
 */
export default async function SignUpPage() {
  try {
    await checkAuthStatus();

    redirect("/dashboard");
  } catch (error) {}

  return <AuthForm type="signUp" />;
}
