import { AuthForm } from "@/app/_components/sections/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return <AuthForm type="signIn" />;
}
