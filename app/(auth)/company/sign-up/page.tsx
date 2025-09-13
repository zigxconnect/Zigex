// import { CompanyAuthForm } from "@/app/_components/sections/auth/CompanyAuthForm";
import { CompanyAuthForm } from "@/components/sections/auth/CompanyAuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Registration",
};

export default function CompanySignUpPage() {
  return <CompanyAuthForm />;
}
