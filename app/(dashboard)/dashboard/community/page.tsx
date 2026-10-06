/**
 * Communities — app/(dashboard)/dashboard/community/page.tsx
 *
 * Where Zigex students talk: the Zigex Discord server, and the group chats
 * of programs the student has been accepted into. The old page's local
 * "access gate", placeholder Resources tab and bot-as-member count are gone.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { DiscordCard } from "@/components/community/DiscordCard";
import { listApplications } from "@/lib/api/services/applications";
import { applicationKind, targetId, toApplicationStatus } from "@/lib/api/applications-shape";

export const metadata: Metadata = { title: "Communities" };

type ProgramGroup = { id: string; title: string; image: string | null; company: string; link: string };

/** Accepted programs that have a group chat link (WhatsApp community). */
async function myProgramGroups(): Promise<ProgramGroup[]> {
  try {
    const rows = await listApplications({ withPostings: true });
    return rows
      .filter((r) => applicationKind(r) === "program" && toApplicationStatus(r.status) === "accepted")
      .map((r) => ({
        id: targetId(r) ?? r.id,
        title: r.program?.title ?? "Program",
        image: r.program?.program_picture_url ?? null,
        company: r.program?.company?.company_name ?? r.program?.company_profiles?.company_name ?? "",
        link: String(r.program?.whatsapp_community_link ?? ""),
      }))
      .filter((g) => /^https:\/\/(chat\.whatsapp\.com|wa\.me)\//.test(g.link));
  } catch (error) {
    console.error("[community] program groups failed:", error);
    return [];
  }
}

const STEPS = [
  { title: "Join the server", text: "Open the invite and sign in with a free Discord account." },
  { title: "Say hello in the Lounge", text: "Tell people your name, school and what you're learning." },
  { title: "Study together", text: "Use the Study Rooms to work on assignments or projects with others." },
];

export default async function CommunitiesPage() {
  const groups = await myProgramGroups();

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Communities</h1>
        <p className="mt-1 text-base text-[#4A5670]">Where Zigex students talk, ask questions and study together.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <DiscordCard />

          <section aria-labelledby="groups-title" className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
            <h2 id="groups-title" className="font-heading text-lg font-semibold text-[#0B1B3F]">
              Your program groups
            </h2>
            {groups.length === 0 ? (
              <p className="mt-2 text-base leading-relaxed text-[#4A5670]">
                When you&apos;re accepted into a program, its group chat appears here so you can talk with your cohort and the
                organisers.{" "}
                <Link href="/dashboard/programs" className="font-semibold text-[#155DFC] hover:underline">
                  See programs
                </Link>
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {groups.map((g) => (
                  <li key={g.id} className="flex items-center gap-4 rounded-xl p-3 ring-1 ring-[#EEF2FA]">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F7FF]">
                      {g.image && <img src={g.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#0B1B3F]">{g.title}</p>
                      {g.company && <p className="truncate text-sm text-[#4A5670]">{g.company}</p>}
                    </div>
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#073B1F] hover:bg-[#1EBE5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
                    >
                      WhatsApp group
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">(opens WhatsApp)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          <section aria-labelledby="start-title" className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] lg:sticky lg:top-24">
            <h2 id="start-title" className="font-heading text-base font-semibold text-[#0B1B3F]">
              New here?
            </h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-sm font-semibold text-[#155DFC]" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1B3F]">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#4A5670]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
