/**
 * Program page — app/(dashboard)/programs/[id]/page.tsx. Reached from
 * Programs, so the sidebar shows Programs and the way back leads there.
 * Same page body as /feed/[id] (OpportunityDetail).
 */

import { OpportunityDetail, opportunityMetadata } from "@/components/feed/details/OpportunityDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return opportunityMetadata((await params).id);
}

export default async function ProgramPage({ params }: Props) {
  return <OpportunityDetail id={(await params).id} back={{ href: "/dashboard/programs", label: "Programs" }} />;
}
