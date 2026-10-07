"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An <img> that stays invisible until it has really loaded and disappears if
 * it fails, so whatever is behind it (usually initials) shows instead of the
 * browser's broken-image icon. Also catches images that failed before the
 * page's JavaScript started (server-rendered pages). A picture only a few
 * pixels wide is a placeholder or test upload, never a real photo, so it is
 * treated as missing too.
 */
const MIN_SIZE = 16;
const usable = (img: HTMLImageElement) => img.naturalWidth >= MIN_SIZE && img.naturalHeight >= MIN_SIZE;

export function SafeImg({ style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setState(usable(img) ? "ok" : "failed");
  }, [props.src]);

  if (state === "failed" || !props.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...props}
      style={{ ...style, visibility: state === "ok" ? "visible" : "hidden" }}
      onLoad={(e) => setState(usable(e.currentTarget) ? "ok" : "failed")}
      onError={() => setState("failed")}
    />
  );
}
