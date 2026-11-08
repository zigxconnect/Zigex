/**
 * One shared opportunity — app/(public)/opportunities/[id]/page.tsx. Public and
 * shareable; a closed one still opens, without the apply button.
 */

import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { isUuid } from "@/lib/postings";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { OutsourcedCover } from "@/components/outsourced/OutsourcedCover";
import { dayLabel, fundingLabel, placeLabel, typeLabel } from "@/components/outsourced/outsourced-labels";
import { getOutsourced } from "@/lib/api/services/outsourced";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const o = await getOutsourced(id);
  if (!o) return { title: "Opportunity not found" };
  return pageMetadata({ title: o.title, description: `${typeLabel(o.type) || "Opportunity"} by ${o.organization}, ${placeLabel(o)}.`, path: `/opportunities/${encodeURIComponent(o.slug || o.id)}` });
}

export default async function OutsourcedDetailPage({ params }: Props) {
  const { id } = await params;
  const o = await getOutsourced(id);
  if (!o) notFound();
  // Opened by id (an old link or notification): move to the readable address.
  if (isUuid(id) && o.slug) permanentRedirect(`/opportunities/${encodeURIComponent(o.slug)}`);

  const deadline = dayLabel(o.deadline);
  const starts = dayLabel(o.start_date);
  const ends = dayLabel(o.end_date);
  const facts = [
    ["Organiser", o.organization],
    ["Where", placeLabel(o)],
    ["Funding", fundingLabel(o.funding)],
    ["Dates", starts ? (ends && ends !== starts ? `${starts} – ${ends}` : starts) : null],
    ["Apply by", deadline],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155DFC] hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> More opportunities
      </Link>

      <p className="mt-4 text-sm font-medium text-[#7B869C]">{typeLabel(o.type)}</p>
      <h1 className="mt-1 font-heading text-2xl font-bold leading-tight text-[#0B1B3F] [overflow-wrap:anywhere] sm:text-3xl">{o.title}</h1>

      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA]">
        <OutsourcedCover src={o.cover_image_url} sizes="(min-width: 768px) 720px, 100vw" priority />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-[#7B869C]">{label}</dt>
            <dd className="text-[15px] font-medium text-[#0B1B3F]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        {o.is_open && o.apply_url ? (
          <>
            <a
              href={o.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 sm:w-auto"
            >
              Apply on the organiser&apos;s site <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-2 text-sm text-[#4A5670]">This opens the organiser&apos;s website. Zigex doesn&apos;t handle these applications.</p>
          </>
        ) : (
          <p className="rounded-xl bg-[#F3F7FF] px-4 py-3 font-semibold text-[#4A5670] ring-1 ring-[#DCE5F5]">
            {o.is_open ? "The organiser hasn't shared an application link yet." : "Applications closed"}
          </p>
        )}
      </div>

      <h2 className="mt-8 font-heading text-lg font-semibold text-[#0B1B3F]">About this opportunity</h2>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#1E2A44]">{o.description}</p>
    </div>
  );
}
