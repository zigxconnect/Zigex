/**
 * More opportunities — app/(public)/opportunities/page.tsx. Summits, foreign
 * programs and fellowships Zigex shares; students apply on the organiser's site.
 * Kept apart from /feed, whose items are applied to inside Zigex.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { OutsourcedCover } from "@/components/outsourced/OutsourcedCover";
import { dayLabel, fundingLabel, placeLabel, typeLabel } from "@/components/outsourced/outsourced-labels";
import { OutsourcedFilterBar } from "@/components/outsourced/OutsourcedFilterBar";
import { listOutsourced, type OutsourcedPage } from "@/lib/api/services/outsourced";
import { outsourcedHref, readOutsourcedFilters, type OutsourcedSection } from "@/lib/outsourced-filters";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "More opportunities",
  description: "Summits, competitions, foreign programs and fellowships for students in Cameroon. Apply directly on the organiser's site.",
  path: "/opportunities",
});

const TABS: { id: OutsourcedSection | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "general", label: "Opportunities" },
  { id: "foreign", label: "Foreign" },
  { id: "fellowship", label: "Fellowships" },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OpportunitiesPage({ searchParams }: Props) {
  const filters = readOutsourcedFilters(await searchParams);
  const { section, page } = filters;

  let data: OutsourcedPage | null = null;
  try {
    data = await listOutsourced(filters);
  } catch (error) {
    console.error("[opportunities] list failed:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-heading text-2xl font-bold text-[#0B1B3F] sm:text-3xl">More opportunities</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-[#4A5670]">
        Summits, competitions, foreign programs and fellowships we&apos;ve found for you. You apply on the organiser&apos;s own site.
      </p>

      <nav aria-label="Sections" className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          {TABS.map((tab) => {
            const count = tab.id ? data?.counts?.[tab.id] : data?.counts && Object.values(data.counts).reduce((a, b) => a + b, 0);
            const current = tab.id === section;
            return (
              <li key={tab.label}>
                <Link
                  href={outsourcedHref({ ...filters, section: tab.id, page: 1 })}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-[#DCE5F5] ${
                    current ? "bg-[#0B1B3F] text-white" : "bg-white text-[#0B1B3F] hover:bg-[#F3F7FF]"
                  }`}
                >
                  {tab.label}
                  {typeof count === "number" && (
                    <span className={`text-xs tabular-nums ${current ? "text-white/70" : "text-[#7B869C]"}`}>{count}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <OutsourcedFilterBar key={outsourcedHref({ ...filters, page: 1 })} filters={filters} />

      {data && <p className="mt-5 text-sm text-[#4A5670]">{data.total === 1 ? "1 opportunity" : `${data.total} opportunities`}</p>}

      {!data ? (
        <Notice title="These opportunities couldn't load." body="Refresh the page in a moment." />
      ) : data.items.length === 0 ? (
        <Notice
          title={filters.local !== null || filters.funding || filters.type || filters.q ? "Nothing matches these filters." : "Nothing here right now."}
          body={filters.local !== null || filters.funding || filters.type || filters.q ? "Try fewer filters, or clear them." : "New opportunities are added often, so check back soon."}
        />
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((o) => {
            const funding = fundingLabel(o.funding);
            const deadline = dayLabel(o.deadline);
            return (
              <li key={o.id}>
                <Link
                  href={`/opportunities/${encodeURIComponent(o.slug || o.id)}`}
                  className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                >
                  <div className="flex items-center justify-between gap-2 text-sm text-[#4A5670]">
                    <span className="min-w-0 truncate font-medium">{o.organization}</span>
                    <span className="shrink-0 text-xs font-medium text-[#7B869C]">{typeLabel(o.type)}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-2 min-h-[2.75rem] font-heading text-lg font-semibold leading-snug text-[#0B1B3F] [overflow-wrap:anywhere]">{o.title}</h2>
                  <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA]">
                    <OutsourcedCover src={o.cover_image_url} sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw" />
                  </div>
                  <p className="mt-3 flex min-w-0 items-center gap-1.5 text-sm text-[#4A5670]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" />
                    <span className="min-w-0 truncate">{placeLabel(o)}</span>
                    {o.is_local && <span className="ml-auto shrink-0 rounded-full bg-[#ECFDF3] px-2 py-0.5 text-xs font-semibold text-[#067647]">In Cameroon</span>}
                  </p>
                  <div className="mt-auto pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#EEF2FA] pt-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-[#067647]">
                        <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {deadline ? `Apply by ${deadline}` : "Open now"}
                      </span>
                      {funding && <span className="font-medium text-[#0B1B3F]">{funding}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.total_pages > 1 && (
        <nav aria-label="Pages" className="mt-8 flex items-center justify-between gap-3 text-sm font-semibold">
          {page > 1 ? <Link href={outsourcedHref({ ...filters, page: page - 1 })} className="text-[#155DFC] hover:underline">Previous</Link> : <span />}
          <span className="font-normal text-[#4A5670]">Page {page} of {data.total_pages}</span>
          {page < data.total_pages ? <Link href={outsourcedHref({ ...filters, page: page + 1 })} className="text-[#155DFC] hover:underline">Next</Link> : <span />}
        </nav>
      )}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6 rounded-2xl bg-[#F3F7FF] px-6 py-12 text-center ring-1 ring-[#DCE5F5]">
      <p className="font-heading text-lg font-semibold text-[#0B1B3F]">{title}</p>
      <p className="mt-1 text-[15px] text-[#4A5670]">{body}</p>
    </div>
  );
}
