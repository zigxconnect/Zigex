import Link from "next/link";
import { latestFeed, type FeedKind } from "@/lib/api/services/feed";
import { toBoardItem, type BoardItem } from "@/components/feed/board/board-types";
import { OpportunityCard, OpportunityCardSkeleton } from "@/components/feed/board/OpportunityCard";
import { landingButton, landingContainer, landingSectionLead, landingSectionTitle } from "./landing-ui";

/**
 * The newest internships, programs and events, straight from the backend feed,
 * so visitors see real opportunities without leaving the landing page (the
 * pattern Handshake and Wellfound use under their heroes).
 *
 * The section is always present (users were losing it when the backend was
 * slow): skeleton cards while loading, the listings, or a short message with a
 * link to the full feed when there is nothing to show or the backend fails.
 */

async function loadLatest(): Promise<{ items: BoardItem[]; failed: boolean }> {
  const kinds: FeedKind[] = ["internships", "programs", "events"];
  const results = await Promise.allSettled(kinds.map((kind) => latestFeed(kind, 6)));
  const items = results
    .flatMap((result, i) => (result.status === "fulfilled" ? result.value.map((row) => toBoardItem(kinds[i], row)) : []))
    .sort((a, b) => new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime())
    .slice(0, 6);
  results.forEach((result, i) => {
    if (result.status === "rejected") console.error(`[landing] latest ${kinds[i]} failed:`, result.reason);
  });
  return { items, failed: results.every((result) => result.status === "rejected") };
}

/** Heading and "See all" link, shared by the loading, loaded and empty states. */
function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section id="opportunities" aria-labelledby="latest-title" className="bg-white py-16 sm:py-20 scroll-mt-20">
      <div className={landingContainer}>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="latest-title" className={landingSectionTitle}>Latest opportunities</h2>
            <p className={landingSectionLead}>The newest internships, programs and events posted on Zigex.</p>
          </div>
          <Link href="/feed" className={`${landingButton("secondary", "md")} self-start sm:self-auto`}>
            See all opportunities
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

/** Suspense fallback: same size as the loaded grid, so nothing jumps when it arrives. */
export function LatestOpportunitiesSkeleton() {
  return (
    <SectionShell>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading opportunities">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <OpportunityCardSkeleton />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export async function LatestOpportunities() {
  const { items, failed } = await loadLatest();

  if (items.length === 0) {
    return (
      <SectionShell>
        <div className="rounded-2xl bg-[#F3F7FF] px-6 py-10 ring-1 ring-[#DCE5F5]">
          <p className="font-heading text-lg font-semibold text-[#0B1B3F]">
            {failed ? "We couldn't load the latest opportunities." : "New opportunities are on the way."}
          </p>
          <p className="mt-2 text-[15px] text-[#4A5670]">
            {failed
              ? "Open the full list to see everything that's available."
              : "Create your account and we'll notify you as soon as companies post."}
          </p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <OpportunityCard item={item} />
            </li>
          ))}
        </ul>
    </SectionShell>
  );
}
