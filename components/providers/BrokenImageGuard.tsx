"use client";

import { useEffect } from "react";

/**
 * Last line of defence for every image on the site: one that fails to load is
 * hidden, so nobody sees the browser's broken-image icon and whatever sits
 * behind it shows instead. It comes back if a later attempt loads.
 */
export function BrokenImageGuard() {
  useEffect(() => {
    const hide = (img: HTMLImageElement) => {
      img.style.visibility = "hidden";
    };
    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) hide(e.target);
    };
    const onLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement && e.target.style.visibility === "hidden" && e.target.naturalWidth > 0) {
        e.target.style.visibility = "";
      }
    };
    // These events don't bubble, so listen on the way down. Images that failed
    // before this ran (server-rendered pages) are caught by the loop below.
    document.addEventListener("error", onError, true);
    document.addEventListener("load", onLoad, true);
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) hide(img);
    });
    return () => {
      document.removeEventListener("error", onError, true);
      document.removeEventListener("load", onLoad, true);
    };
  }, []);
  return null;
}
