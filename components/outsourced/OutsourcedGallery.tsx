"use client";

import { useState } from "react";
import { HeroImage } from "@/components/feed/details/HeroImage";

/** The post's flyers: the chosen one whole and large, and the others as thumbnails to switch to. */
export function OutsourcedGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;
  const shown = Math.min(current, images.length - 1);
  return (
    <div>
      <HeroImage key={images[shown]} src={images[shown]} alt={images.length > 1 ? `${title}, image ${shown + 1} of ${images.length}` : title} />
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="More images">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === shown}
                className={`block h-20 w-16 overflow-hidden rounded-lg bg-[#EEF2FA] ring-2 transition focus-visible:outline-none focus-visible:ring-[#155DFC] sm:h-24 sm:w-20 ${i === shown ? "ring-[#155DFC]" : "ring-transparent opacity-70 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
