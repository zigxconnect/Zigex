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
 * Converts a string into a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

/**
 * Checks if a string is a valid UUID.
 */
export function isUUID(text: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(text);
}
