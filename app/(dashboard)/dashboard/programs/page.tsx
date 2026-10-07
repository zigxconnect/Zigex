import { unstable_rethrow } from "next/navigation";
/**
 * Programs — app/(dashboard)/dashboard/programs/page.tsx
 *
 * Bootcamps and training programs only (the old page repeated the whole
 * feed). Answers three questions in order: which programs am I in, which
 * can I still join, and what ran before.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { listPublicFeed } from "@/lib/api/services/feed";
import { listApplications } from "@/lib/api/services/applications";
import { applicationKind, targetId, toApplicationStatus } from "@/lib/api/applications-shape";
import { ProgramCard, toProgramView, type ProgramView } from "@/components/programs/ProgramCard";
import { landingButton } from "@/components/sections/landing/landing-ui";

export const metadata: Metadata = { title: "Programs" };

type MyProgram = { id: string; title: string; image: string | null; company: string; status: "pending" | "accepted" | "rejected" };

const STATUS = {
  pending: { text: "Registration in review", style: "bg-[#FFF7E6] text-[#B54708]" },
  accepted: { text: "You're in", style: "bg-[#ECFDF3] text-[#067647]" },
  rejected: { text: "Not selected", style: "bg-[#F2F4F7] text-[#4A5670]" },
} as const;

async function loadPrograms(): Promise<{ programs: ProgramView[]; failed: boolean }> {
  try {
    const rows = await listPublicFeed("programs");
    return { programs: rows.map((r) => toProgramView(r)), failed: false };
  } catch (error) {
    console.error("[programs] list failed:", error);
    return { programs: [], failed: true };
  }
}

async function loadMyPrograms(): Promise<MyProgram[]> {
  try {
    const rows = await listApplications({ withPostings: true });
    return rows
      .filter((r) => applicationKind(r) === "program" && toApplicationStatus(r.status) !== "not_applied")
      .map((r) => ({
        id: targetId(r) ?? r.id,
        title: r.program?.title ?? "Program",
        image: r.program?.program_picture_url ?? null,
        company: r.program?.company?.company_name ?? r.program?.company_profiles?.company_name ?? "",
        status: toApplicationStatus(r.status) as MyProgram["status"],
      }));
  } catch (error) {
    // Let Next.js's own signals (e.g. "this page reads cookies, render it per request") through.
    unstable_rethrow(error);
    console.error("[programs] my programs failed:", error);
    return [];
  }
}

export default async function ProgramsPage() {
  const [{ programs, failed }, mine] = await Promise.all([loadPrograms(), loadMyPrograms()]);
  const time = (d: string | null) => (d ? new Date(d).getTime() : Infinity);
  // Open: soonest start first. Past: most recent first.
  const open = programs.filter((p) => p.open).sort((a, b) => time(a.startsAt) - time(b.startsAt));
  const past = programs.filter((p) => !p.open).sort((a, b) => time(b.startsAt) - time(a.startsAt));

  return (
    <div className="pb-16">
      <header className="mb-8">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Programs</h1>
        <p className="mt-1 text-base text-[#4A5670]">Bootcamps and training run by companies on Zigex.</p>
      </header>

      {mine.length > 0 && (
        <section aria-labelledby="mine-title" className="mb-10">
          <h2 id="mine-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
            Your programs
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {mine.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5]">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3F7FF]">
                  {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0B1B3F]">{p.title}</p>
                  {p.company && <p className="truncate text-sm text-[#4A5670]">{p.company}</p>}
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[p.status].style}`}>
                    {STATUS[p.status].text}
                  </span>
                </div>
                {p.status === "accepted" ? (
                  <Link href={`/programs/${p.id}/updates`} className={`${landingButton("primary", "md")} shrink-0 px-4`}>
                    Updates
                  </Link>
                ) : (
                  <Link href={`/programs/${p.id}`} className={`${landingButton("secondary", "md")} shrink-0 px-4`}>
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="open-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="open-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
            Open for registration
            {open.length > 0 && <span className="ml-2 text-base font-normal text-[#7B869C]">{open.length}</span>}
          </h2>
        </div>

        {failed ? (
          <p className="mt-3 text-base text-[#4A5670]">Programs couldn&apos;t load. Refresh the page in a moment.</p>
        ) : open.length === 0 ? (
          <p className="mt-3 text-base text-[#4A5670]">
            None right now. Companies open new cohorts through the year.{" "}
            <Link href="/feed" className="font-semibold text-[#155DFC] hover:underline">
              See internships and events
            </Link>
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {open.map((p) => (
              <li key={p.id}>
                <ProgramCard program={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        // Open by default when nothing is open, so the page still shows what Zigex runs.
        <details className="group mt-10" open={open.length === 0}>
          <summary className="flex h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-lg font-heading text-xl font-semibold text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] [&::-webkit-details-marker]:hidden">
            Past programs
            <span className="text-base font-normal text-[#7B869C]">{past.length}</span>
            <ChevronDown className="h-5 w-5 text-[#4A5670] transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((p) => (
              <li key={p.id}>
                <ProgramCard program={p} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
