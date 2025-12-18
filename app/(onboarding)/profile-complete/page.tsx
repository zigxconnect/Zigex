"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileCompletePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const redirectDelay = 3000;

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, redirectDelay);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (redirectDelay / 50);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(progressInterval);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="relative w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-orange-400 rounded-full opacity-20 filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-2 w-16 h-16 bg-blue-400 rounded-full opacity-20 filter blur-xl animate-pulse delay-500"></div>

        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        {/* Staggered Text Animations */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
          Profile Complete!
        </h1>
        <p className="mt-2 text-md text-gray-600 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
          You&apos;re all set. Welcome to the ZIGEX community.
        </p>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-500">
          <Link href="/dashboard">
            <Button className="w-full group">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md animate-in fade-in duration-500 delay-400">
        <p className="text-sm text-gray-500 mb-2">
          Redirecting automatically...
        </p>
        <div className="bg-gray-200 rounded-full h-1.5 w-full overflow-hidden">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
