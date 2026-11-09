"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Share, SquarePlus, X } from "lucide-react";
import { INSTALL_DISMISSED_KEY, dismissedRecently, installedHere, isIOSSafari, isPhoneOrTablet, isStandalone, rememberDismissed } from "@/lib/pwa";

type Mode = "hidden" | "prompt" | "ios";

/**
 * "Install Zigex" from the first visit, on every device that can install it
 * (phones and computers), so students get notifications (iPhones only allow them
 * in the installed app). Uses the browser's own install dialog where there is one
 * (Android, Chrome, Edge) and explains Share → Add to Home Screen in Safari.
 * Never shown once Zigex is installed on the device; "Not now" asks again the next day.
 */
export function InstallAppBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [busy, setBusy] = useState(false);
  const [aboveTabBar, setAboveTabBar] = useState(false);

  useEffect(() => {
    if (installedHere() || dismissedRecently(INSTALL_DISMISSED_KEY)) return;

    const update = () => {
      if (isStandalone()) return setMode("hidden");
      if (window.__zigexInstallPrompt) return setMode("prompt");
      // Computers only get the banner when the browser can install apps.
      if (isIOSSafari()) return setMode("ios");
    };
    // Give the page a moment first: the browser's install offer arrives shortly after load.
    const timer = window.setTimeout(() => {
      setAboveTabBar(Boolean(document.querySelector('nav[aria-label="Main"]')));
      update();
    }, 3000);
    const installed = () => setMode("hidden");
    window.addEventListener("zigex:installable", update);
    window.addEventListener("zigex:installed", installed);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("zigex:installable", update);
      window.removeEventListener("zigex:installed", installed);
    };
  }, []);

  const dismiss = () => {
    rememberDismissed(INSTALL_DISMISSED_KEY);
    setMode("hidden");
  };

  const install = async () => {
    const offer = window.__zigexInstallPrompt;
    if (!offer) return;
    setBusy(true);
    try {
      await offer.prompt();
      const { outcome } = await offer.userChoice;
      // The offer can only be used once either way.
      window.__zigexInstallPrompt = null;
      if (outcome !== "accepted") rememberDismissed(INSTALL_DISMISSED_KEY);
      setMode("hidden");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-banner-title"
      className={`fixed inset-x-3 z-50 mx-auto max-w-md rounded-2xl bg-[#0B1B3F] p-4 text-white shadow-[0_18px_40px_-12px_rgba(11,27,63,0.6)] ${
        aboveTabBar ? "bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]" : "bottom-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Download className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="install-banner-title" className="font-heading text-base font-semibold">
            Install Zigex on your {isPhoneOrTablet() ? "phone" : "computer"}
          </p>
          <p className="mt-0.5 text-sm text-white/75">
            Get notified about new opportunities and your recommendations, and open Zigex from your home screen.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {mode === "prompt" ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            disabled={busy}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Install the app
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="h-11 rounded-xl px-4 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Not now
          </button>
        </div>
      ) : (
        <ol className="mt-3 space-y-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm">
          <li className="flex items-center gap-2">
            <span className="font-semibold">1.</span> Tap <Share className="h-4 w-4" aria-label="Share" /> at the bottom of Safari.
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">2.</span> Choose <SquarePlus className="h-4 w-4" aria-hidden="true" /> Add to Home Screen.
          </li>
        </ol>
      )}
    </div>
  );
}
