import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Normalize image source URLs for next/image.
 * @param src - The image source URL
 * @param fallback - The fallback image source URL
 * @returns The normalized image source URL
 * @example
 * ```typescript
 * const src = normalizeImageSrc("https://example.com/image.jpg");
 * ```
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

/**
 * @description Get the base URL of the site.
 * @returns The base URL of the site
 */
export const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};
