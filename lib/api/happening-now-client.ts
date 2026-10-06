import { api } from "./browser-client";
import { whenAvailable } from "./errors";

/**
 * Happening Now (docs/backend-missing-endpoints.md → Stories and Happening
 * Now): the latest live company post and its view counter. Spec'd: empty
 * until deployed.
 */

export type HappeningNowItem = {
  id: string;
  /** The post this media belongs to; view counts are per post. */
  postId: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  caption: string;
  company: string;
  viewCount: number;
  isLive?: boolean;
  created_at?: string;
};

type LatestPost = {
  id: string;
  company: string;
  images?: string[];
  video?: string | null;
  captions?: string[] | string | null;
  is_live?: boolean;
  view_count?: number;
  created_at?: string;
};

const captionAt = (captions: LatestPost["captions"], i: number) =>
  Array.isArray(captions) ? (captions[i] ?? "") : (captions ?? "");

/** The latest post, one grid item per image plus one for its video. */
export async function fetchHappeningNow(): Promise<HappeningNowItem[]> {
  const post = await whenAvailable(async () => (await api.get<LatestPost | null>("/happening-now/latest")).data, null);
  if (!post) return [];

  const base = {
    postId: post.id,
    company: post.company,
    viewCount: post.view_count ?? 0,
    isLive: post.is_live,
    created_at: post.created_at,
  };
  const images = (post.images ?? []).map((src, i) => ({
    ...base,
    id: `${post.id}-image-${i}`,
    type: "image" as const,
    src,
    caption: captionAt(post.captions, i),
  }));
  const video = post.video
    ? [{ ...base, id: `${post.id}-video`, type: "video" as const, src: post.video, caption: captionAt(post.captions, images.length) }]
    : [];
  return [...video, ...images];
}

/** Counts one view of a post; resolves to the new total, or null if unavailable. */
export async function recordHappeningNowView(postId: string): Promise<number | null> {
  return whenAvailable(
    async () => (await api.post<{ view_count: number }>(`/happening-now/${encodeURIComponent(postId)}/view`)).data?.view_count ?? null,
    null
  ).catch(() => null);
}
