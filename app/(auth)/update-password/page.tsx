import { Suspense } from "react";
import { UpdatePasswordForm } from "@/components/sections/auth/UpdatePasswordForm";

function UpdatePasswordFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-6 text-muted-foreground font-medium animate-pulse tracking-tight text-[15px]">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Suspense fallback={<UpdatePasswordFallback />}>
        <UpdatePasswordForm />
      </Suspense>
    </div>
  );
}
