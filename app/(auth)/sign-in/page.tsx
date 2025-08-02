import { AuthForm } from "@/app/_components/sections/auth/AuthForm";
import { checkAuthStatus } from "@/lib/actions/auth.action";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};



export  default async function SignInPage() {
   try {
    const { user } = await checkAuthStatus();
    // If we get here, user is authenticated - redirect them
    redirect("/dashboard");
  } catch {
    // User is not authenticated - show sign in form
    // The redirect() in checkAuthStatus throws an error, so we catch it
    console.log("Problem redirecting the user")
  }

  return <AuthForm type="signIn" />;
}
