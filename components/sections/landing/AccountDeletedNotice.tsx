"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

/** Shown once on the home page after a student deletes their account. */
export function AccountDeletedNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("account") === "deleted") {
      setShow(true);
      params.delete("account");
      window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    }
  }, []);
  if (!show) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_16px_40px_-12px_rgba(11,27,63,0.35)] ring-1 ring-[#DCE5F5]">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#067647]" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-[#0B1B3F]">Your account has been deleted</p>
        <p className="mt-0.5 text-[#4A5670]">Thanks for being part of Zigex. You&apos;re welcome back any time.</p>
      </div>
      <button type="button" onClick={() => setShow(false)} aria-label="Dismiss" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
