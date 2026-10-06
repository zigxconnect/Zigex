/**
 * Opportunity page — app/(public)/feed/[id]/page.tsx. Public and shareable;
 * the page body lives in OpportunityDetail (shared with /programs/[id]).
 */

import { OpportunityDetail, opportunityMetadata } from "@/components/feed/details/OpportunityDetail";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return opportunityMetadata((await params).id);
}

export default async function FeedDetailPage({ params }: Props) {
  return <OpportunityDetail id={(await params).id} back={{ href: "/feed", label: "All opportunities" }} />;
}
