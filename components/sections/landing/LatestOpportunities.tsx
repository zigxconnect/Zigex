import Link from "next/link";
import { Briefcase, CalendarDays, Clock, GraduationCap, MapPin } from "lucide-react";
import { latestFeed, type FeedKind, type FeedRow } from "@/lib/api/services/feed";
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

const KIND_META: Record<FeedKind, { label: string; icon: typeof Briefcase }> = {
  internships: { label: "Internship", icon: Briefcase },
  programs: { label: "Program", icon: GraduationCap },
  events: { label: "Event", icon: CalendarDays },
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dateLine(kind: FeedKind, row: FeedRow): { text: string; urgent: boolean; closed?: boolean } | null {
  const deadline = row.deadline ?? row.application_deadline;
  if (deadline) {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / DAY_MS);
    if (days < 0) return { text: "Closed", urgent: false, closed: true };
    return { text: days === 0 ? "Closes today" : `Closes in ${days} day${days === 1 ? "" : "s"}`, urgent: days <= 7 };
  }
  const start = row.start_date;
  if (start && kind !== "internships") {
    const date = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const past = new Date(start).getTime() < Date.now() - DAY_MS;
    return past ? { text: "Ended", urgent: false, closed: true } : { text: `Starts ${date}`, urgent: false };
  }
  return null;
}

async function loadLatest(): Promise<{ items: { kind: FeedKind; row: FeedRow }[]; failed: boolean }> {
  const kinds: FeedKind[] = ["internships", "programs", "events"];
  const results = await Promise.allSettled(kinds.map((kind) => latestFeed(kind, 6)));
  const items = results
    .flatMap((result, i) => (result.status === "fulfilled" ? result.value.map((row) => ({ kind: kinds[i], row })) : []))
    .sort((a, b) => new Date(b.row.created_at ?? 0).getTime() - new Date(a.row.created_at ?? 0).getTime())
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
          <li key={i} className="h-[188px] rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FA] motion-safe:animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
            </div>
            <div className="mt-5 h-4 w-4/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
            <div className="mt-2 h-4 w-3/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
            <div className="mt-8 flex gap-2">
              <div className="h-6 w-20 rounded-md bg-[#EEF2FA] motion-safe:animate-pulse" />
              <div className="h-6 w-24 rounded-md bg-[#EEF2FA] motion-safe:animate-pulse" />
            </div>
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
          {items.map(({ kind, row }) => {
            const meta = KIND_META[kind];
            const company = row.company ?? row.company_profiles;
            const when = dateLine(kind, row);
            return (
              <li key={`${kind}-${row.id}`}>
                {/* The whole card is one link: a single, large tap target. */}
                <Link
                  href={`/feed/${row.id}`}
                  className="group flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(11,27,63,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                >
                  <div className="flex items-center gap-3">
                    {company?.logo_url ? (
                      <img src={company.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[#DCE5F5]" />
                    ) : (
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F7FF] font-heading font-bold text-[#155DFC]">
                        {(company?.company_name ?? row.title ?? "Z").charAt(0)}
                      </span>
                    )}
                    <p className="min-w-0 truncate text-sm text-[#4A5670]">{company?.company_name ?? "Zigex partner"}</p>
                  </div>

                  <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-[#0B1B3F] group-hover:text-[#155DFC]">
                    {row.title}
                  </h3>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-[13px]">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F7FF] px-2 py-1 font-medium text-[#0B1B3F]">
                      <meta.icon className="h-3.5 w-3.5" aria-hidden="true" /> {meta.label}
                    </span>
                    {row.location && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F7FF] px-2 py-1 text-[#4A5670]">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {row.location}
                      </span>
                    )}
                    {when && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                          when.urgent ? "bg-[#FFF1E8] font-medium text-[#C2410C]" : "bg-[#F3F7FF] text-[#4A5670]"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {when.text}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
    </SectionShell>
  );
}
