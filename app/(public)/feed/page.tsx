/**
 * Opportunities board — app/(public)/feed/page.tsx
 *
 * One job: help a student find an internship, program or event and open it.
 * Search, type tabs, sort and a "Free only" filter over every open item
 * (the old page showed at most 9 in a carousel). Removed from the old page:
 * the marketing banner (the landing page does that), blog carousel, stats with
 * fallback numbers, fake "featured/popular" badges and profile percentage,
 * the details slide-over (rows open the shareable detail page) and the pop-up.
 *
 * Signed-in students also get the stories strip and their workspaces.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import FeedStories from "@/components/feed/FeedStories";
import { OpportunityBoard } from "@/components/feed/board/OpportunityBoard";
import { OpportunityCardSkeleton } from "@/components/feed/board/OpportunityCard";
import { BoardRail } from "@/components/feed/board/BoardRail";
import { toBoardItem, type BoardItem } from "@/components/feed/board/board-types";
import { listPublicFeed, type FeedKind } from "@/lib/api/services/feed";
import { getOptionalAuth } from "@/lib/utils/auth-context";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Search open internships, training programs and events from verified companies in Bamenda and across Cameroon.",
};

const KINDS: FeedKind[] = ["internships", "programs", "events"];

async function loadBoardItems(): Promise<{ items: BoardItem[]; failed: boolean }> {
  const results = await Promise.allSettled(KINDS.map((kind) => listPublicFeed(kind)));
  const items = results.flatMap((result, i) =>
    result.status === "fulfilled" ? result.value.map((row) => toBoardItem(KINDS[i], row)) : []
  );
  results.forEach((result, i) => {
    if (result.status === "rejected") console.error(`[feed] ${KINDS[i]} failed:`, result.reason);
  });
  return { items, failed: results.every((r) => r.status === "rejected") };
}

async function Board() {
  const { items, failed } = await loadBoardItems();
  if (failed) {
    return (
      <div className="rounded-2xl bg-[#F3F7FF] px-6 py-12 text-center ring-1 ring-[#DCE5F5]">
        <p className="font-heading text-lg font-semibold text-[#0B1B3F]">Opportunities couldn&apos;t load.</p>
        <p className="mt-1 text-[15px] text-[#4A5670]">The server is slow to respond. Refresh the page in a moment.</p>
      </div>
    );
  }
  return <OpportunityBoard items={items} />;
}

/** Same footprint as the loaded board, so the page doesn't jump. */
function BoardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading opportunities">
      <div className="h-[196px] rounded-2xl bg-[#F8FAFF] ring-1 ring-[#DCE5F5] motion-safe:animate-pulse" />
      <div className="mt-6 h-4 w-40 rounded bg-[#EEF2FA]" />
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <OpportunityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function FeedPage() {
  const { user, isAuthenticated } = await getOptionalAuth();
  const workspaces = isAuthenticated
    ? await import("@/lib/actions/intenship.actions").then((m) => m.getUserWorkspaces()).catch(() => [])
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl pb-16">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0B1B3F] sm:text-4xl">
          {isAuthenticated ? `Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}` : "Opportunities"}
        </h1>
        <p className="mt-2 text-lg text-[#4A5670]">
          Open internships, programs and events from companies in Bamenda and across Cameroon.
        </p>
      </header>

      {/* Stories are a community feature for members; signed-out visitors can't post. */}
      {isAuthenticated && (
        <section aria-label="Stories" className="mb-8">
          <FeedStories currentUser={user} />
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <section aria-label="Opportunities" className="min-w-0 lg:col-span-9">
          <Suspense fallback={<BoardSkeleton />}>
            <Board />
          </Suspense>
        </section>
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <BoardRail signedIn={isAuthenticated} workspaces={workspaces} />
          </div>
        </aside>
      </div>
    </div>
  );
}
