/**
 * Company profile — app/(public)/company/[id]/page.tsx
 *
 * Public, so a student can check who is behind an opportunity before signing
 * up. Shows who the company is and everything it has posted on Zigex (open
 * first). Phone numbers are never shown; the contact email only to members.
 */

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
} from "lucide-react";
import { getCompany } from "@/lib/api/services/companies";
import { listPublicFeed, type FeedKind } from "@/lib/api/services/feed";
import {
  OpportunityCard,
  OpportunityCardSkeleton,
} from "@/components/feed/board/OpportunityCard";
import {
  isClosed,
  toBoardItem,
  type BoardItem,
} from "@/components/feed/board/board-types";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { getOptionalAuth } from "@/lib/utils/auth-context";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 300;

const KINDS: FeedKind[] = ["internships", "programs", "events"];

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const company = await getCompany(id).catch(() => null);
  if (!company) return { title: "Company not found" };
  return {
    title: company.company_name,
    description: (
      company.description ?? `${company.company_name} on Zigex`
    ).slice(0, 160),
  };
}

export default async function CompanyPage({ params }: Props) {
  const { id } = await params;
  const [company, { isAuthenticated }] = await Promise.all([
    getCompany(id).catch(() => null),
    getOptionalAuth(),
  ]);
  if (!company) notFound();

  const website: string | null = company.website_url ?? company.website ?? null;
  const email: string | null = company.email ?? company.contact_email ?? null;
  const where: string | null = company.address ?? company.location ?? null;
  const verified = Boolean(company.is_verified ?? company.verified);
  const industry =
    typeof company.industry === "string" ? company.industry.trim() : null;
  const joined = company.created_at
    ? new Date(company.created_at).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;
  // Some descriptions were saved with the same line repeated; show each line once.
  const about = company.description
    ? [
        ...new Set(
          String(company.description)
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean),
        ),
      ].join("\n")
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl pb-16">
      <Link
        href="/feed"
        className="mb-6 inline-flex h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[#4A5670] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All opportunities
      </Link>

      {/* Identity */}
      <header>
        <div className="aspect-[3/1] overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8EFFF] to-[#F3F7FF] ring-1 ring-[#DCE5F5] sm:aspect-[4/1]">
          {company.cover_image_url && (
            <img
              src={company.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="px-4 sm:px-6">
          {/* Only the logo overlaps the cover; the name sits fully below it. */}
          <div className="relative z-10 -mt-10 w-fit sm:-mt-12">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl bg-white object-cover shadow-sm ring-4 ring-white sm:h-24 sm:w-24"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#155DFC] font-heading text-3xl font-bold text-white ring-4 ring-white sm:h-24 sm:w-24"
              >
                {company.company_name.charAt(0)}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0B1B3F] sm:text-3xl">
                {company.company_name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#4A5670]">
                {verified && (
                  <span className="inline-flex items-center gap-1 font-medium text-[#155DFC]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />{" "}
                    Verified by Zigex
                  </span>
                )}
                {industry && <span>{industry}</span>}
              </p>
            </div>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${landingButton("secondary", "md")} self-start sm:self-auto`}
              >
                Visit website
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {about && (
            <section aria-labelledby="about-title">
              <h2
                id="about-title"
                className="font-heading text-xl font-semibold text-[#0B1B3F]"
              >
                About
              </h2>
              <p className="mt-3 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-[#4A5670]">
                {about}
              </p>
            </section>
          )}

          <Suspense fallback={<PostingsSkeleton />}>
            <Postings company={company} />
          </Suspense>
        </div>

        <aside>
          <dl className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
            {industry && (
              <Fact icon={Building2} label="Industry" value={industry} />
            )}
            {where && <Fact icon={MapPin} label="Location" value={where} />}
            {joined && (
              <Fact icon={CalendarDays} label="On Zigex since" value={joined} />
            )}
            {email &&
              (isAuthenticated ? (
                <Fact
                  icon={Mail}
                  label="Contact"
                  value={
                    <a
                      href={`mailto:${email}`}
                      className="break-all text-[#155DFC] hover:underline"
                    >
                      {email}
                    </a>
                  }
                />
              ) : (
                <Fact
                  icon={Mail}
                  label="Contact"
                  value={
                    <Link
                      href={`/sign-in?next=${encodeURIComponent(`/company/${company.id}`)}`}
                      className="text-[#155DFC] hover:underline"
                    >
                      Sign in to see
                    </Link>
                  }
                />
              ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-[#7B869C]"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-[#4A5670]">{label}</dt>
        <dd className="mt-0.5 font-medium text-[#0B1B3F]">{value}</dd>
      </div>
    </div>
  );
}

/** Everything the company posted, open first, as feed cards. */
async function Postings({
  company,
}: {
  company: {
    id: string;
    company_name: string;
    logo_url?: string;
    is_verified?: boolean;
  };
}) {
  const results = await Promise.allSettled(
    KINDS.map((kind) => listPublicFeed(kind)),
  );
  const items: BoardItem[] = results.flatMap((r, i) =>
    r.status === "fulfilled"
      ? r.value
          .filter(
            (row) =>
              row.company_id === company.id ||
              row.company?.id === company.id ||
              row.company_profiles?.id === company.id,
          )
          .map((row) => ({
            ...toBoardItem(KINDS[i], row),
            companyName: company.company_name,
            companyLogo: company.logo_url ?? null,
            companyVerified: Boolean(company.is_verified),
          }))
      : [],
  );
  const byNewest = (a: BoardItem, b: BoardItem) =>
    new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime();
  const open = items.filter((it) => !isClosed(it)).sort(byNewest);
  const closed = items.filter((it) => isClosed(it)).sort(byNewest);

  return (
    <section aria-labelledby="postings-title">
      <h2
        id="postings-title"
        className="font-heading text-xl font-semibold text-[#0B1B3F]"
      >
        Opportunities
        <span className="ml-2 text-base font-normal text-[#7B869C]">
          {open.length} open
        </span>
      </h2>

      {open.length === 0 && (
        <p className="mt-3 rounded-xl bg-[#F3F7FF] px-4 py-3 text-[15px] text-[#4A5670]">
          {company.company_name} has nothing open right now.{" "}
          <Link
            href="/feed"
            className="font-semibold text-[#155DFC] hover:underline"
          >
            Browse other opportunities
          </Link>
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {[...open, ...closed].map((it) => (
            <li key={`${it.kind}-${it.id}`}>
              <OpportunityCard item={it} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PostingsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      aria-busy="true"
      aria-label="Loading opportunities"
    >
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
    </div>
  );
}
