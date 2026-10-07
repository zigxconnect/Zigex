"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SIZE = 16;
const usable = (img: HTMLImageElement) => img.naturalWidth >= MIN_SIZE && img.naturalHeight >= MIN_SIZE;

/** Same address, but skips the browser's copy (the backend reuses one address per avatar). */
function fresh(src: string) {
  if (!/^https?:\/\//i.test(src)) return null;
  return `${src}${src.includes("?") ? "&" : "?"}r=${Date.now()}`;
}

/**
 * An <img> that stays invisible until it has really loaded and disappears if
 * it fails, so whatever is behind it (usually initials) shows instead of the
 * browser's broken-image icon. Also catches images that failed before the
 * page's JavaScript started (server-rendered pages). A picture only a few
 * pixels wide is a placeholder, never a real photo, so it counts as a failure.
 * On the first failure it tries once more without the browser cache: a new
 * photo uploaded to the same address would otherwise stay hidden behind the
 * old cached one.
 */
export function SafeImg({ style, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
  return src ? <Img key={src} src={src} style={style} {...props} /> : null;
}

function Img({ style, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [current, setCurrent] = useState(src);
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");
  const retried = useRef(false);

  const fail = () => {
    const again = !retried.current && fresh(src);
    retried.current = true;
    if (again) {
      setCurrent(again);
      setState("loading");
    } else setState("failed");
  };

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      if (usable(img)) setState("ok");
      else fail();
    }
    // Only on mount: later loads report through onLoad/onError.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "failed") return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...props}
      src={current}
      style={{ ...style, visibility: state === "ok" ? "visible" : "hidden" }}
      onLoad={(e) => (usable(e.currentTarget) ? setState("ok") : fail())}
      onError={fail}
    />
  );
}
