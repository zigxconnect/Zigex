"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudOff, Loader2, RotateCw, WifiOff } from "lucide-react";

/**
 * What a student sees when a page can't load (slow or failed network, or the
 * server not answering). Never "server-side exception": it says what happened
 * in plain words, retries for them when the connection comes back, and keeps a
 * short reference for support.
 */
export function ErrorScreen({ error, reset, compact = false }: { error: Error & { digest?: string }; reset: () => void; compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [offline, setOffline] = useState(false);

  // Retrying has to refetch the page's server data, not just re-render it.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  useEffect(() => {
    console.error(error);
    setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    const goOnline = () => {
      setOffline(false);
      retry();
    };
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const Icon = offline ? WifiOff : CloudOff;

  return (
    <div className={compact ? "flex justify-center px-4 py-16 sm:py-24" : "flex min-h-dvh items-center justify-center bg-[#F8FAFF] px-4 py-16"}>
      <div role="alert" className="w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF]">
          <Icon className="h-7 w-7 text-[#155DFC]" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-[#0B1B3F]">
          {offline ? "You're offline" : "This page didn't load"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-base leading-relaxed text-[#4A5670]">
          {offline
            ? "Check your Wi-Fi or mobile data. We'll reload the page as soon as you're back online."
            : "The connection was too slow or Zigex didn't answer in time. Try again in a moment."}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <RotateCw className="h-5 w-5" aria-hidden="true" />}
            {pending ? "Trying again…" : "Try again"}
          </button>
          <Link
            href="/feed"
            className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-base font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-white"
          >
            Go to opportunities
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-sm text-[#7B869C]">
            If this keeps happening, email us this reference: <span className="select-all font-medium text-[#4A5670]">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
