"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";

/** Reloads now, and by itself as soon as the device is back online. */
export default function TryAgainButton() {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const back = () => window.location.reload();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        setBusy(true);
        window.location.reload();
      }}
      disabled={busy}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <RotateCw className="h-5 w-5" aria-hidden="true" />}
      {busy ? "Trying again…" : "Try again"}
    </button>
  );
}
