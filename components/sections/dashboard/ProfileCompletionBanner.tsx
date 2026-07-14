"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, UserCircle2 } from "lucide-react";

const DISMISS_KEY = "zigex_profile_completion_banner_dismissed";

interface ProfileCompletionBannerProps {
  profileStatus?: string | null;
}

export function ProfileCompletionBanner({
  profileStatus,
}: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (profileStatus === "complete" || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
      <UserCircle2 className="hidden h-5 w-5 shrink-0 text-blue-700 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-blue-900">
          Finish setting up your profile
        </p>
        <p className="mt-0.5 text-sm text-blue-700">
          A complete profile helps you get matched with the right
          opportunities.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/dashboard/edit-profile"
          className="whitespace-nowrap rounded-full bg-blue-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Complete profile
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1.5 text-blue-700 transition-colors hover:bg-blue-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
