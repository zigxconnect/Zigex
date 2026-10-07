"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copy your profile link (or use the phone's share sheet) to send it to a company or on WhatsApp. */
export function ShareProfile({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/profile/${encodeURIComponent(username)}`;
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ title: "My Zigex profile", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The user closed the share sheet, or the clipboard is blocked: nothing to do.
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE5F5] bg-white px-4 text-sm font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
    >
      {copied ? <Check className="h-4 w-4 text-[#067647]" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Link copied" : "Share profile"}
    </button>
  );
}
