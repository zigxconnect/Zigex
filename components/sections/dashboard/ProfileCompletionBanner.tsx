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
    <div className="mb-6 flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-[#DCE5F5] sm:items-center">
      <UserCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#155DFC] sm:mt-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0B1B3F]">Finish setting up your profile</p>
          <p className="mt-0.5 text-sm text-[#4A5670]">Companies see your profile when you apply. A complete one gets more replies.</p>
        </div>
        <Link
          href="/dashboard/edit-profile"
          className="mt-3 inline-flex h-10 shrink-0 items-center rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 sm:mt-0"
        >
          Complete profile
        </Link>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss for now"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
