import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/sections/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password | Zigex" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
