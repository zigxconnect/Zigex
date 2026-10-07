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
 * Signed-in students also get their application status and profile strength.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { OpportunityBoard } from "@/components/feed/board/OpportunityBoard";
import { OpportunityCardSkeleton } from "@/components/feed/board/OpportunityCard";
import { BoardRail } from "@/components/feed/board/BoardRail";
import { StudentRail, type ApplicationsSummary, type ProfileStrength } from "@/components/feed/board/StudentRail";
import { listApplications } from "@/lib/api/services/applications";
import { getMyProfile } from "@/lib/api/services/profile";
import { applicationKind, targetId, toApplicationStatus } from "@/lib/api/applications-shape";
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

async function Board({ searchInHeader }: { searchInHeader: boolean }) {
  const { items, failed } = await loadBoardItems();
  if (failed) {
    return (
      <div className="rounded-2xl bg-[#F3F7FF] px-6 py-12 text-center ring-1 ring-[#DCE5F5]">
        <p className="font-heading text-lg font-semibold text-[#0B1B3F]">Opportunities couldn&apos;t load.</p>
        <p className="mt-1 text-[15px] text-[#4A5670]">The server is slow to respond. Refresh the page in a moment.</p>
      </div>
    );
  }
  // Signed in, the top bar search drives the board on wider screens.
  return <OpportunityBoard items={items} searchInHeader={searchInHeader} />;
}

/** Same footprint as the loaded board, so the page doesn't jump. */
function BoardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading opportunities">
      <div className="h-[196px] rounded-2xl bg-[#F8FAFF] ring-1 ring-[#DCE5F5] motion-safe:animate-pulse" />
      <div className="mt-6 h-4 w-40 rounded bg-[#EEF2FA]" />
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <OpportunityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

async function loadApplications(): Promise<ApplicationsSummary | null> {
  try {
    const rows = await listApplications({ withPostings: true });
    const statuses = rows.map((r) => toApplicationStatus(r.status)).filter((s) => s !== "not_applied");
    const latestRow = rows.find((r) => toApplicationStatus(r.status) !== "not_applied");
    const kind = latestRow ? applicationKind(latestRow) : null;
    const id = latestRow ? targetId(latestRow) : null;
    return {
      total: statuses.length,
      inReview: statuses.filter((s) => s === "pending").length,
      accepted: statuses.filter((s) => s === "accepted").length,
      notSelected: statuses.filter((s) => s === "rejected").length,
      latest:
        latestRow && kind
          ? {
              title: latestRow[kind]?.title ?? "Your application",
              status: toApplicationStatus(latestRow.status) as "pending" | "accepted" | "rejected",
              href: id ? `/feed/${id}` : null,
            }
          : null,
    };
  } catch (error) {
    console.error("[feed] applications failed:", error);
    return null;
  }
}

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v));

/** What companies look at first, in the order worth doing. */
async function loadProfileStrength(): Promise<ProfileStrength | null> {
  try {
    const row = await getMyProfile();
    const p = (row?.profile ?? row) as Record<string, unknown> | null;
    if (!p) return null;
    const steps = [
      { label: "Profile photo", done: filled(p.avatar_url) || filled(p.profile_picture) },
      { label: "School and course", done: filled(p.university) && filled(p.field_of_study) },
      { label: "About you", done: filled(p.about) },
      { label: "Skills", done: filled(p.hard_skills) },
      { label: "Location", done: filled(p.location) },
      { label: "Portfolio or LinkedIn link", done: filled(p.portfolio_url) || filled(p.github_url) || filled(p.linkedin_url) },
    ];
    return { steps, percent: Math.round((steps.filter((s) => s.done).length / steps.length) * 100) };
  } catch (error) {
    console.error("[feed] profile failed:", error);
    return null;
  }
}

/** One plain sentence about the student's own situation, under the greeting. */
function statusLine(apps: ApplicationsSummary | null): string {
  if (!apps) return "Find an internship, program or event and apply with your profile.";
  if (apps.accepted > 0 && apps.latest?.status === "accepted") return `You were accepted to ${apps.latest.title}.`;
  if (apps.inReview > 0) return `${apps.inReview} application${apps.inReview === 1 ? " is" : "s are"} waiting for a reply.`;
  if (apps.total === 0) return "Find an internship, program or event and apply with your profile.";
  return "Here's what's open right now.";
}

export default async function FeedPage() {
  const { user, isAuthenticated } = await getOptionalAuth();
  const [workspaces, applications, profile] = isAuthenticated
    ? await Promise.all([
        import("@/lib/actions/intenship.actions").then((m) => m.getUserWorkspaces()).catch(() => []),
        loadApplications(),
        loadProfileStrength(),
      ])
    : [[], null, null];

  return (
    <div className="mx-auto w-full max-w-6xl pb-16">
      {isAuthenticated ? (
        <header className="mb-6">
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-base text-[#4A5670]">{statusLine(applications)}</p>
        </header>
      ) : (
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0B1B3F] sm:text-4xl">Opportunities</h1>
          <p className="mt-2 text-lg text-[#4A5670]">
            Open internships, programs and events from companies in Bamenda and across Cameroon.
          </p>
        </header>
      )}


      <div className="grid gap-8 lg:grid-cols-12">
        <section aria-label="Opportunities" className="min-w-0 lg:col-span-9">
          <Suspense fallback={<BoardSkeleton />}>
            <Board searchInHeader={isAuthenticated} />
          </Suspense>
        </section>
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            {isAuthenticated ? (
              <StudentRail applications={applications} profile={profile} workspaces={workspaces} />
            ) : (
              <BoardRail signedIn={false} workspaces={[]} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
