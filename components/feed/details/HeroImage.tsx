"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Opportunity image that works for photos and flyers alike: wide photos fill
 * the frame; square or tall images (usually flyers with their own text) are
 * shown whole on a blurred copy of themselves, so nothing gets cut off.
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [fit, setFit] = useState<"cover" | "contain" | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const measure = (img: HTMLImageElement) => {
    // Close to 16:9 or wider reads as a photo; anything squarer is treated as a flyer.
    if (img.naturalWidth && img.naturalHeight) setFit(img.naturalWidth / img.naturalHeight >= 1.45 ? "cover" : "contain");
  };
  // A cached image can finish loading before React attaches onLoad; measure it on mount too.
  useEffect(() => {
    if (ref.current?.complete) measure(ref.current);
  }, [src]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EEF2FA] ring-1 ring-[#DCE5F5] sm:aspect-[16/9]">
      {fit === "contain" && (
        <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
      )}
      <img
        src={src}
        alt={alt}
        ref={ref}
        onLoad={(e) => measure(e.currentTarget)}
        onError={() => setFit("cover")}
        className={`relative h-full w-full transition-opacity duration-300 ${fit === "contain" ? "object-contain" : "object-cover"} ${fit ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
