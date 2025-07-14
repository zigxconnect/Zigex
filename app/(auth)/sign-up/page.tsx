import { AuthForm } from "@/app/components/sections/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return <AuthForm type="signUp" />;
}
