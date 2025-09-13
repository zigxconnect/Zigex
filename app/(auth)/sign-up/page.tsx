// import { AuthForm } from "@/app/_components/sections/auth/AuthForm";

import { AuthForm } from "@/components/sections/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return <AuthForm type="signUp" />;
}
