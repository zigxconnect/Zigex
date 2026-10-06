"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Briefcase, CalendarDays, Clock, GraduationCap, MapPin } from "lucide-react";
import { isClosed, postedAgo, timing, type BoardItem } from "./board-types";

const KIND_META = {
  internships: { label: "Internship", icon: Briefcase },
  programs: { label: "Program", icon: GraduationCap },
  events: { label: "Event", icon: CalendarDays },
} as const;

/**
 * One opportunity as a card, used on /feed and the landing page.
 *
 * Anatomy (cover photo first, since it is what catches the eye, then the
 * facts a student scans for): photo with the type and any deadline warning
 * on it, company logo overlapping the photo, title, company, where/how, and a
 * footer with the date that matters. The whole card is one link.
 */
export function OpportunityCard({ item, headingLevel = 3 }: { item: BoardItem; headingLevel?: 2 | 3 }) {
  const meta = KIND_META[item.kind];
  const when = timing(item);
  const closed = isClosed(item);
  const Heading = `h${headingLevel}` as const;

  return (
    <Link
      href={`/feed/${item.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5] transition-shadow duration-200 hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F7FF]">
        <CoverImage src={item.image} kind={item.kind} closed={closed} />

        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-[#0B1B3F] shadow-sm backdrop-blur">
          <meta.icon className="h-3.5 w-3.5 text-[#155DFC]" aria-hidden="true" />
          {meta.label}
        </span>
        {closed ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#0B1B3F]/85 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
            {item.kind === "events" && !item.closesAt ? "Ended" : "Closed"}
          </span>
        ) : (
          when?.urgent && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-[#C2410C] px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
              {when.text}
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        {/* Logo overlaps the photo edge: ties the opportunity to who posted it. */}
        <div className="-mt-5 flex items-end gap-2.5">
          {item.companyLogo ? (
            <img
              src={item.companyLogo}
              alt=""
              loading="lazy"
              className="relative h-10 w-10 shrink-0 rounded-lg bg-white object-cover ring-[3px] ring-white shadow-sm"
            />
          ) : (
            <span
              aria-hidden="true"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#155DFC] font-heading text-base font-bold text-white ring-[3px] ring-white"
            >
              {item.companyName.charAt(0)}
            </span>
          )}
          <p className="flex min-w-0 items-center gap-1 pb-0.5 text-sm text-[#4A5670]">
            <span className="truncate">{item.companyName}</span>
            {item.companyVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#155DFC]" aria-label="Verified company" />}
          </p>
        </div>

        <Heading className="mt-2.5 line-clamp-2 font-heading text-base font-semibold leading-snug text-[#0B1B3F] group-hover:text-[#155DFC]">
          {item.title}
        </Heading>

        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#4A5670]">
          {item.location && (
            <li className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7B869C]" aria-hidden="true" />
              <span className="truncate">{item.location}</span>
            </li>
          )}
          {item.workMode && <li className="capitalize">{item.workMode}</li>}
          <li className={item.hasFee ? "" : "font-medium text-[#15803D]"}>
            {item.hasFee ? (item.priceXaf ? `Fee ${item.priceXaf.toLocaleString("en-US")} XAF` : "Fee applies") : "Free"}
          </li>
        </ul>

        {item.skills.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Skills">
            {item.skills.map((skill) => (
              <li key={skill} className="rounded-md bg-[#F3F7FF] px-2 py-0.5 text-xs font-medium text-[#0B1B3F]">
                {skill}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEF2FA] pt-3 text-sm">
          {when ? (
            <span className={`inline-flex items-center gap-1.5 ${when.urgent && !closed ? "font-semibold text-[#C2410C]" : "text-[#4A5670]"}`}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {when.text}
            </span>
          ) : (
            <span />
          )}
          {item.postedAt && <span className="text-xs text-[#7B869C]">{postedAgo(item.postedAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

/** Cover photo, or a branded tile with the type icon when there is none or it fails to load. */
function CoverImage({ src, kind, closed }: { src: string | null; kind: BoardItem["kind"]; closed: boolean }) {
  const [failed, setFailed] = useState(false);
  const Icon = KIND_META[kind].icon;

  if (!src || failed) {
    return (
      <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E8EFFF] to-[#F3F7FF]">
        <Icon className="h-10 w-10 text-[#155DFC]/40" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03] ${
        closed ? "grayscale-[60%]" : ""
      }`}
    />
  );
}

/** Loading placeholder with the card's exact footprint. */
export function OpportunityCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
      <div className="aspect-[16/9] bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="px-4 pb-4">
        <div className="-mt-5 h-10 w-10 rounded-lg bg-[#E3E9F5] ring-[3px] ring-white" />
        <div className="mt-3 h-4 w-4/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
        <div className="mt-2 h-4 w-3/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
        <div className="mt-4 h-3 w-1/2 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
        <div className="mt-5 border-t border-[#EEF2FA] pt-4">
          <div className="h-3 w-1/3 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
