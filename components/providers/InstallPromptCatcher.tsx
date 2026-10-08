"use client";

import { useEffect } from "react";

/** The browser's install offer (Chrome/Edge/Android); not in TypeScript's DOM types yet. */
export type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

declare global {
  interface Window {
    __zigexInstallPrompt?: InstallPromptEvent | null;
  }
}

/**
 * Browsers offer "install this app" once, early, often before the student
 * opens Settings. Keep that offer (instead of the browser's own mini-bar) so
 * Settings can show an "Install the app" button whenever it's opened.
 */
export function InstallPromptCatcher() {
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      window.__zigexInstallPrompt = e as InstallPromptEvent;
      window.dispatchEvent(new Event("zigex:installable"));
    };
    const onInstalled = () => {
      window.__zigexInstallPrompt = null;
      window.dispatchEvent(new Event("zigex:installed"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  return null;
}
