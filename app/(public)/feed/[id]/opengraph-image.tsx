import { getFeedItemById } from "@/lib/actions/feed/feed-detail.actions";
import { toBoardItem } from "@/components/feed/board/board-types";
import type { FeedKind } from "@/lib/api/services/feed";
import { opportunityImage, siteImage, OG_SIZE } from "@/lib/og";

export const alt = "Opportunity on Zigex";
export const size = OG_SIZE;
export const contentType = "image/png";
// Titles and deadlines change rarely; the flyer is fetched once an hour at most.
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { data } = await getFeedItemById((await params).id);
  if (!data || data._type === "announcements") return siteImage();
  return opportunityImage(toBoardItem(data._type as FeedKind, data));
}
