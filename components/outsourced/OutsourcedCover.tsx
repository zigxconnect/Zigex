"use client";

import { useState } from "react";
import { Globe2 } from "lucide-react";
import { CoverImage } from "@/components/CoverImage";

/** The whole cover on a blurred copy of itself (nothing cropped), or a branded tile when there is none or it fails. */
export function OutsourcedCover({ src, sizes, priority }: { src: string | null; sizes: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E8EFFF] to-[#F3F7FF]">
        <Globe2 className="h-10 w-10 text-[#155DFC]/40" />
      </div>
    );
  }
  return (
    <>
      <CoverImage src={src} sizes={sizes} className="scale-110 object-cover opacity-50 blur-xl" />
      <CoverImage src={src} sizes={sizes} priority={priority} onFail={() => setFailed(true)} className="object-contain" />
    </>
  );
}
