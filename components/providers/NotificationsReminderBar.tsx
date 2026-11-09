"use client";

import { useCallback, useEffect, useState } from "react";
import { BellOff, Loader2, Share, X } from "lucide-react";
import { devicePushIsOn, enableDevicePush } from "@/lib/push-subscribe";
import { confirmPushOn } from "@/lib/push-feedback";
import { NOTIFY_DISMISSED_KEY, PUSH_CHANGED_EVENT, dismissedRecently, isIOS, isStandalone } from "@/lib/pwa";

type State = "hidden" | "off" | "blocked" | "install-first";

const HIDDEN_THIS_VISIT = "zigex_notify_bar_hidden";

/**
 * Signed-in pages: a slim reminder at the top until this device receives Zigex
 * notifications. Off (after "Not now" on the prompt): a Turn on button. Blocked:
 * how to allow them again. iPhone in Safari: install first (iOS only allows
 * notifications in the installed app). Closing it hides it for this visit only.
 */
export function NotificationsReminderBar() {
  const [state, setState] = useState<State>("hidden");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const check = useCallback(async () => {
    try {
      if (sessionStorage.getItem(HIDDEN_THIS_VISIT)) return setState("hidden");
    } catch {
      // Storage blocked: show it.
    }
    if (!key) return setState("hidden");
    if (isIOS() && !isStandalone()) return setState("install-first");
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("hidden");
    if (Notification.permission === "denied") return setState("blocked");
    if (await devicePushIsOn(key).catch(() => false)) return setState("hidden");
    // Never asked yet: the "Turn on notifications" card asks first; the bar takes over after "Not now".
    if (Notification.permission === "default" && !dismissedRecently(NOTIFY_DISMISSED_KEY)) return setState("hidden");
    setState("off");
  }, [key]);

  useEffect(() => {
    const timer = window.setTimeout(check, 2500);
    const onChange = () => void check();
    window.addEventListener(PUSH_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(PUSH_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [check]);

  const hideForThisVisit = () => {
    try {
      sessionStorage.setItem(HIDDEN_THIS_VISIT, "1");
    } catch {
      // ignore
    }
    setState("hidden");
  };

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await enableDevicePush(key!);
      if (result === "on") {
        setState("hidden");
        void confirmPushOn();
      } else {
        setState(result === "blocked" ? "blocked" : "off");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notifications couldn't be turned on. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "hidden") return null;

  return (
    <div role="status" className="mb-5 flex items-start gap-3 rounded-xl bg-[#FFF8E6] px-4 py-3 ring-1 ring-[#F5D78A]">
      <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-[#B54708]" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm text-[#5C3B00]">
        {state === "off" && (
          <p>
            <span className="font-semibold">Notifications are off on this device.</span> Turn them on so you don&apos;t miss new
            opportunities and replies to your applications.
          </p>
        )}
        {state === "blocked" && (
          <p>
            <span className="font-semibold">Notifications are blocked for Zigex.</span> To allow them, tap the lock or settings icon
            next to the address bar, set Notifications to Allow, then reload the page.
          </p>
        )}
        {state === "install-first" && (
          <p>
            <span className="font-semibold">Get notifications on your iPhone:</span> tap{" "}
            <Share className="inline h-4 w-4 align-[-0.15em]" aria-label="Share" /> in Safari, choose Add to Home Screen, then
            open Zigex from your home screen.
          </p>
        )}
        {error && <p className="mt-1 text-[#B42318]" role="alert">{error}</p>}
      </div>
      {state === "off" && (
        <button
          type="button"
          onClick={turnOn}
          disabled={busy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#155DFC] px-3 text-sm font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Turn on
        </button>
      )}
      <button
        type="button"
        onClick={hideForThisVisit}
        aria-label="Hide for now"
        className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8A5A00] hover:bg-[#FCEBC0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
