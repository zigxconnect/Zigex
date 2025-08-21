// import { VerifyOtpForm } from "@/app/_components/sections/auth/VerifyotpForm";
import { VerifyOtpForm } from "@/components/sections/auth/VerifyotpForm";
import { Suspense } from "react";

/**
 * A wrapper component is needed to use the `useSearchParams` hook,
 * as the hook can only be used in Client Components wrapped in a Suspense boundary.
 */
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
    // Wrap the component in Suspense, which is required when a child component
    // uses `useSearchParams`. This provides a fallback UI while the parameters are read.
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
