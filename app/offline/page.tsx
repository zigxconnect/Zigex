import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import TryAgainButton from "./TryAgainButton";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false },
};

/**
 * Shown by the installed app (service worker fallback) when a page can't be
 * fetched. Precached, so it must not depend on the backend or remote images.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#F8FAFF]">
      <div className="flex items-center gap-2.5 px-5 py-4 sm:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-96.png" alt="" width={32} height={32} className="h-8 w-8" />
        <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF]">
            <WifiOff className="h-7 w-7 text-[#155DFC]" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">You&apos;re offline</h1>
          <p className="mx-auto mt-2 max-w-sm text-base leading-relaxed text-[#4A5670]">
            Zigex needs a connection to load this page. Check your Wi-Fi or mobile data; the page reloads by itself when you&apos;re back online.
          </p>
          <div className="mt-7">
            <TryAgainButton />
          </div>
        </div>
      </div>
    </main>
  );
}
