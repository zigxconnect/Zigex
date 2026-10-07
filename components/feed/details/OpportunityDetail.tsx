/**
 * The opportunity page body, shared by /feed/[id] (public, shareable) and
 * /programs/[id] (signed-in, reached from Programs). Only the way back
 * differs, so students keep their place.
 *
 * Reading order: photo, what it is and who posts it, then the Apply panel
 * (sidebar on desktop, right under the title on phones), then the
 * description, the map and more from the same company.
 */

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Briefcase, CalendarDays, GraduationCap } from "lucide-react";
import {
  getApplicationStatus,
  getCompanyRelatedItems,
  getFeedItemById,
  isOpportunityOpen,
  type FeedType,
} from "@/lib/actions/feed/feed-detail.actions";
import { ApplyPanel } from "@/components/feed/details/ApplyPanel";
import { LocationMap } from "@/components/feed/details/LocationMap";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";
import { OpportunityCard, OpportunityCardSkeleton } from "@/components/feed/board/OpportunityCard";
import { toBoardItem, type BoardItem } from "@/components/feed/board/board-types";
import type { FeedKind } from "@/lib/api/services/feed";
import { getOptionalAuth } from "@/lib/utils/auth-context";
import { getMyProfile } from "@/lib/api/services/profile";
import type { ApplyPrefill } from "@/components/apply/ApplyDialog";

export type BackLink = { href: string; label: string };

const KIND_META = {
  internships: { label: "Internship", icon: Briefcase },
  programs: { label: "Program", icon: GraduationCap },
  events: { label: "Event", icon: CalendarDays },
} as const;

const plainText = (html?: string) => (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function opportunityMetadata(id: string) {
  const { data: item } = await getFeedItemById(id);
  if (!item) return { title: "Opportunity not found" };
  return {
    // The "| Zigex" suffix comes from the root title template.
    title: item.title,
    description: plainText((item as { description?: string }).description).slice(0, 160) || `Apply for ${item.title} on Zigex.`,
  };
}

/** The company's description often opens with its own <h1> repeating the title; the page already has one. */
const withoutLeadingHeading = (html: string) => html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");

export async function OpportunityDetail({ id, back }: { id: string; back: BackLink }) {
  const [{ isAuthenticated }, { data: raw, error }] = await Promise.all([getOptionalAuth(), getFeedItemById(id)]);
  // A failed request (slow or rate-limited backend) isn't a missing page: say so and offer a retry.
  if (error && error !== "Item not found") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-[#0B1B3F]">This page didn&apos;t load</h1>
        <p className="mt-2 text-base text-[#4A5670]">Zigex is slow to respond right now. Try again in a moment.</p>
        <div className="mt-6 flex justify-center gap-2">
          <a href={back.href === "/feed" ? `/feed/${id}` : `/programs/${id}`} className="inline-flex h-11 items-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]">
            Try again
          </a>
          <Link href={back.href} className="inline-flex h-11 items-center rounded-xl border border-[#DCE5F5] bg-white px-5 text-[15px] font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]">
            {back.label}
          </Link>
        </div>
      </div>
    );
  }
  if (!raw || raw._type === "announcements") notFound();

  const kind = raw._type as FeedKind;
  const item = toBoardItem(kind, raw);
  const meta = KIND_META[kind];
  const company = typeof raw.company_profiles === "object" ? raw.company_profiles : raw.company ?? null;
  const companyId: string | undefined = company?.id || raw.company_id;

  // Signed-in students get the application form prefilled from their profile.
  const prefill: ApplyPrefill = await (async () => {
    if (!isAuthenticated) return {};
    const row = await getMyProfile().catch(() => null);
    const p = (row?.profile ?? row) as Record<string, any> | null;
    if (!p) return {};
    const tidy = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : undefined);
    return { fullName: tidy(p.full_name), school: tidy(p.university), dateOfBirth: tidy(p.date_of_birth), address: tidy(p.location) };
  })();

  const [status, applicationStatus] = await Promise.all([
    isOpportunityOpen(raw, raw._type),
    getApplicationStatus(raw.id, raw._type),
  ]);

  const opportunityData = {
    title: raw.title,
    description: raw.description,
    type: kind.slice(0, -1),
    company_profiles: company,
    location: raw.location,
    duration: raw.duration,
    department: raw.department,
  };

  return (
    <div className="mx-auto w-full max-w-6xl pb-32 lg:pb-16">
      <Link
        href={back.href}
        className="mb-6 inline-flex h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[#4A5670] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {back.label}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        {/* Header: photo, type, title, company */}
        <header className="min-w-0">
          {item.image && (
            // Organisers upload flyers with their own text: show the whole flyer on a soft blur of itself instead of cropping it.
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0B1B3F] ring-1 ring-[#DCE5F5] sm:aspect-[16/10]">
              <img src={item.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
              <img src={item.image} alt={`${item.title} flyer`} className="relative h-full w-full object-contain" />
            </div>
          )}
          <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#F3F7FF] px-3 py-1 text-[13px] font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5]">
            <meta.icon className="h-4 w-4 text-[#155DFC]" aria-hidden="true" />
            {meta.label}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-[#0B1B3F] sm:text-4xl">{item.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            {item.companyLogo ? (
              <img src={item.companyLogo} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-[#DCE5F5]" />
            ) : (
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#155DFC] font-heading font-bold text-white">
                {item.companyName.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              {companyId ? (
                <Link href={`/company/${companyId}`} className="font-semibold text-[#0B1B3F] hover:text-[#155DFC] hover:underline">
                  {item.companyName}
                </Link>
              ) : (
                <span className="font-semibold text-[#0B1B3F]">{item.companyName}</span>
              )}
              {item.companyVerified && (
                <p className="flex items-center gap-1 text-[13px] text-[#4A5670]">
                  <BadgeCheck className="h-4 w-4 text-[#155DFC]" aria-hidden="true" /> Verified company
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Apply panel: second on phones, sticky sidebar on desktop */}
        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-24">
            <ApplyPanel
              item={item}
              isOpen={status.isOpen}
              closedReason={status.reason}
              isAuthenticated={isAuthenticated}
              applicationStatus={applicationStatus}
              opportunityData={opportunityData}
              prefill={prefill}
              browse={back.href === "/dashboard/programs" ? { href: back.href, label: "See other programs" } : undefined}
            />
          </div>
        </aside>

        {/* Body */}
        <div className="min-w-0 space-y-10 lg:col-start-1">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
              About this {meta.label.toLowerCase()}
            </h2>
            <div className="prose prose-slate mt-4 max-w-none text-[15px] prose-headings:font-heading prose-headings:text-[#0B1B3F] prose-p:text-[#4A5670] prose-li:text-[#4A5670]">
              {raw.description ? (
                <RichContentRenderer content={withoutLeadingHeading(raw.description)} />
              ) : (
                <p>The company hasn&apos;t added a description yet.</p>
              )}
            </div>
          </section>

          {raw.location && (
            <section aria-label="Location">
              <LocationMap location={raw.location} title={raw.title} />
            </section>
          )}

          {companyId && (
            <Suspense fallback={<RelatedSkeleton />}>
              <MoreFromCompany companyId={companyId} type={raw._type} currentId={raw.id} company={item} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

/** Other open or recent opportunities from the same company, as feed cards. */
async function MoreFromCompany({
  companyId,
  type,
  currentId,
  company,
}: {
  companyId: string;
  type: FeedType;
  currentId: string;
  company: BoardItem;
}) {
  const related = await getCompanyRelatedItems(companyId, type, currentId);
  const items = (["internships", "programs", "events"] as const)
    .flatMap((kind) =>
      related[kind].map((row) => ({
        // Company rows don't repeat the company; reuse the page's.
        ...toBoardItem(kind, row),
        companyName: company.companyName,
        companyLogo: company.companyLogo,
        companyVerified: company.companyVerified,
      }))
    )
    .filter((it) => it.id !== currentId)
    .sort((a, b) => new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime())
    .slice(0, 4);

  if (items.length === 0) return null;
  return (
    <section aria-labelledby="more-title">
      <h2 id="more-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
        More from {company.companyName}
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <li key={`${it.kind}-${it.id}`}>
            <OpportunityCard item={it} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading more opportunities">
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
    </div>
  );
}
