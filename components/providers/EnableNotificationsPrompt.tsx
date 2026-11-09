"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2, X } from "lucide-react";
import { devicePushIsOn, enableDevicePush } from "@/lib/push-subscribe";
import { confirmPushOn } from "@/lib/push-feedback";
import {
  INSTALL_DISMISSED_KEY,
  NOTIFY_DISMISSED_KEY,
  dismissedRecently,
  installedHere,
  isIOS,
  isPhoneOrTablet,
  isStandalone,
  rememberDismissed,
} from "@/lib/pwa";

/**
 * Signed-in students: "Turn on notifications" for new opportunities and their
 * recommendations. On a phone it waits until Zigex is installed (or the student
 * chose not to install), so it never shows together with the install banner;
 * on an iPhone it only shows in the installed app, the only place iOS allows it.
 */
export function EnableNotificationsPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aboveTabBar, setAboveTabBar] = useState(false);
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!key || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    if (Notification.permission !== "default" || dismissedRecently(NOTIFY_DISMISSED_KEY)) return;
    const installedOrDeclined = installedHere() || dismissedRecently(INSTALL_DISMISSED_KEY);
    if (isPhoneOrTablet() && !installedOrDeclined) return;
    if (isIOS() && !isStandalone()) return;

    const timer = window.setTimeout(async () => {
      if (await devicePushIsOn(key).catch(() => false)) return;
      setAboveTabBar(Boolean(document.querySelector('nav[aria-label="Main"]')));
      setShow(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [key]);

  const dismiss = () => {
    rememberDismissed(NOTIFY_DISMISSED_KEY);
    setShow(false);
  };

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      const state = await enableDevicePush(key!);
      if (state !== "on") rememberDismissed(NOTIFY_DISMISSED_KEY);
      setShow(false);
      if (state === "on") void confirmPushOn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notifications couldn't be turned on. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="notify-prompt-title"
      className={`fixed inset-x-3 z-50 mx-auto max-w-md rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] shadow-[0_18px_40px_-12px_rgba(11,27,63,0.35)] sm:left-auto sm:right-6 sm:mx-0 ${
        aboveTabBar ? "bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] lg:bottom-6" : "bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:bottom-6"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#155DFC]">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="notify-prompt-title" className="font-heading text-base font-semibold text-[#0B1B3F]">Turn on notifications</p>
          <p className="mt-0.5 text-sm text-[#4A5670]">
            Hear about new internships, programs and events, and when your recommendations are ready.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#B42318]" role="alert">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={turnOn}
          disabled={busy}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Turn on
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="h-11 rounded-xl px-4 text-sm font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
