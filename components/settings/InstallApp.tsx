"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2, Share, SquarePlus } from "lucide-react";

type State = "checking" | "installed" | "available" | "ios" | "unavailable";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIosSafari = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);

/**
 * "Install the app": opens the browser's install dialog where it exists
 * (Chrome, Edge, Android); on iPhone, explains Share → Add to Home Screen.
 */
export function InstallApp() {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const update = () => {
      if (isStandalone()) return setState("installed");
      if (window.__zigexInstallPrompt) return setState("available");
      if (isIosSafari()) return setState("ios");
      setState("unavailable");
    };
    update();
    const installed = () => setState("installed");
    window.addEventListener("zigex:installable", update);
    window.addEventListener("zigex:installed", installed);
    return () => {
      window.removeEventListener("zigex:installable", update);
      window.removeEventListener("zigex:installed", installed);
    };
  }, []);

  const install = async () => {
    const offer = window.__zigexInstallPrompt;
    if (!offer) return;
    setBusy(true);
    try {
      await offer.prompt();
      const { outcome } = await offer.userChoice;
      // The offer can only be used once either way.
      window.__zigexInstallPrompt = null;
      setState(outcome === "accepted" ? "installed" : "unavailable");
    } finally {
      setBusy(false);
    }
  };

  if (state === "checking") return <div className="h-12" aria-hidden="true" />;

  if (state === "installed") {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-[#067647]" role="status">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Zigex is installed on this device.
      </p>
    );
  }

  if (state === "available") {
    return (
      <div>
        <button
          type="button"
          onClick={install}
          disabled={busy}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
          Install the app
        </button>
        <p className="mt-2 text-sm text-[#4A5670]">Opens from your home screen like any app, and shows notifications.</p>
      </div>
    );
  }

  if (state === "ios") {
    return (
      <ol className="space-y-2 text-sm text-[#0B1B3F]">
        <li className="flex items-center gap-2">
          <span className="font-semibold">1.</span> Tap <Share className="h-4 w-4 text-[#155DFC]" aria-label="Share" /> at the bottom of Safari.
        </li>
        <li className="flex items-center gap-2">
          <span className="font-semibold">2.</span> Choose <SquarePlus className="h-4 w-4 text-[#155DFC]" aria-hidden="true" /> Add to Home Screen.
        </li>
      </ol>
    );
  }

  return (
    <p className="text-sm text-[#4A5670]">
      To install Zigex, open this page in Chrome on Android or a computer, or in Safari on iPhone.
    </p>
  );
}
