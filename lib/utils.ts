import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize image source URLs for next/image.
 * - If src is falsy, returns the provided fallback
 * - If src starts with '//' or missing protocol, prefix with 'https:'
 * - Otherwise returns src unchanged
 */
export function normalizeImageSrc(src?: string | null, fallback = "/placeholder.png") {
  if (!src) return fallback;
  try {
    // If already an absolute URL, return as-is
    const url = new URL(src, "https://example.com");
    if (url.protocol === "http:" || url.protocol === "https:") {
      return src;
    }
  } catch (e) {
    // If invalid URL but starts with //, add https:
    if (src.startsWith("//")) return `https:${src}`;
    // If src looks like a relative path, return as-is so next/image can handle localPatterns
    if (src.startsWith("/")) return src;
  }

  // As a last resort, ensure it's a valid https URL
  if (!/^https?:\/\//i.test(src)) return `https://${src}`;
  return src;
}
