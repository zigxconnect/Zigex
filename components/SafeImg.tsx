"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An <img> that stays invisible until it has really loaded and disappears if
 * it fails, so whatever is behind it (usually initials) shows instead of the
 * browser's broken-image icon. Also catches images that failed before the
 * page's JavaScript started (server-rendered pages).
 */
export function SafeImg({ style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "ok" : "failed");
  }, [props.src]);

  if (state === "failed" || !props.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...props}
      style={{ ...style, visibility: state === "ok" ? "visible" : "hidden" }}
      onLoad={() => setState("ok")}
      onError={() => setState("failed")}
    />
  );
}
