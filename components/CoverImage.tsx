"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Hosts next.config.mjs lets the image optimiser fetch. Keep in sync with
 * images.remotePatterns: an unlisted host would make next/image throw.
 */
const OPTIMISED_HOSTS = ["tmvipinvvhgklmqwvows.supabase.co", "files.zigexconnect.com", "cdn.sanity.io"];
const canOptimise = (src: string) => {
  try {
    const { hostname, protocol } = new URL(src);
    return protocol === "https:" && (OPTIMISED_HOSTS.includes(hostname) || hostname.endsWith(".r2.dev"));
  } catch {
    return src.startsWith("/");
  }
};

/**
 * A card or hero image filling its (relative) parent. Flyers are uploaded at
 * full size (often 300–500 KB); through the optimiser phones get a resized
 * WebP of a few dozen KB. Unknown hosts fall back to a plain <img>.
 */
export function CoverImage({
  src,
  sizes,
  className,
  priority = false,
  onFail,
}: {
  src: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  onFail?: () => void;
}) {
  const [plain, setPlain] = useState(!canOptimise(src));
  if (plain) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" loading={priority ? "eager" : "lazy"} onError={onFail} className={`absolute inset-0 h-full w-full ${className ?? ""}`} />;
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      // If the optimiser can't fetch it, try the original once before giving up.
      onError={() => setPlain(true)}
      className={className}
    />
  );
}
