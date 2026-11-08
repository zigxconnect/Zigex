import type { BoardKind } from "@/components/feed/board/board-types";

/**
 * Addresses of opportunities. They use the readable name the backend stores
 * ("cern-short-term-internship-in-switzerland"), never the database id; an id
 * is only used for a post that doesn't have its name yet, and pages opened by id
 * redirect to the name.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID.test(value);

type Posting = { id: string; slug?: string | null };

/** The last part of the address: the slug, else the id. */
export const postingKey = (p: Posting) => (typeof p.slug === "string" && p.slug.trim() ? p.slug.trim() : p.id);

/** The shareable address, the one search engines index (programs too live under /feed). */
export const publicPostingPath = (p: Posting) => `/feed/${encodeURIComponent(postingKey(p))}`;

/** Where the app opens it: programs inside the app at /programs, shared ones at /opportunities, the rest at /feed. */
export const postingPath = (kind: BoardKind, p: Posting) =>
  kind === "programs"
    ? `/programs/${encodeURIComponent(postingKey(p))}`
    : kind === "outsourced"
      ? `/opportunities/${encodeURIComponent(postingKey(p))}`
      : publicPostingPath(p);

/** An outside link students may follow (http or https only), or null. */
export function externalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
