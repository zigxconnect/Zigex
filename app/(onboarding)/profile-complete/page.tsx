"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

/**
 * This is the correct code for the Profile Complete success page.
 * It shows a confirmation message and redirects to the dashboard.
 */
export default function ProfileCompletePage() {
  const router = useRouter();

  // This hook handles the automatic redirection after 3 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <div className="w-24 h-24">
        <CheckCircle className="w-full h-full text-green-500 animate-in fade-in zoom-in duration-500" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-gray-900">
        Profile Created!
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Enjoy your journey with FutureProspect.
      </p>
      <div className="mt-8 text-sm text-gray-500 flex items-center gap-2">
        <span>Redirecting you to your dashboard</span>
        {/* ... (loading spinner dots) ... */}
      </div>
    </div>
  );
}
