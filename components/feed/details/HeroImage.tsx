"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The opportunity's picture, always whole: flyers carry dates, prices and
 * conditions in their text, so nothing may be cropped. The frame takes the
 * picture's own shape and scales with the screen (pinch-zoom works as on any
 * page). A very tall flyer is capped at most of the screen's height; the space
 * beside it shows a soft, blurred copy of the picture.
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  // Width ÷ height of the picture, once it has loaded.
  const [ratio, setRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const measure = (img: HTMLImageElement) => {
    if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
  };
  // A cached picture can finish loading before React attaches onLoad: measure it on mount too.
  useEffect(() => {
    if (ref.current?.complete) measure(ref.current);
  }, [src]);

  if (failed) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-[#EEF2FA] ring-1 ring-[#DCE5F5]"
      style={{ aspectRatio: ratio ? `${ratio}` : "16 / 9", maxHeight: "min(80vh, 900px)" }}
    >
      <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
      <img
        src={src}
        alt={alt}
        ref={ref}
        onLoad={(e) => measure(e.currentTarget)}
        onError={() => setFailed(true)}
        className={`relative h-full w-full object-contain transition-opacity duration-300 ${ratio ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
