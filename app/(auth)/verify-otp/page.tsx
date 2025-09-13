import { VerifyOtpForm } from "@/components/sections/auth/VerifyotpForm";
import { Suspense } from "react";

const VerifyOtpPageContent = () => {
  return <VerifyOtpForm />;
};

/**
 * This is the page component for the OTP verification route.
 * It lives at the URL /verify-otp.
 * Its only responsibility is to render the main VerifyOtpForm component.
 */
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
