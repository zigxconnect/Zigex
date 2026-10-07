"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Briefcase, CalendarClock, CalendarDays, GraduationCap } from "lucide-react";
import { isClosed, type BoardItem } from "./board-types";
import { CoverImage } from "@/components/CoverImage";

const KIND = {
  internships: { label: "Internship", noun: "internship", verb: "Apply", icon: Briefcase },
  programs: { label: "Program", noun: "program", verb: "Register", icon: GraduationCap },
  events: { label: "Event", noun: "event", verb: "RSVP", icon: CalendarDays },
} as const;

const DAY = 86_400_000;
const fmt = (d: string, o: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString("en-GB", o);

/** "1 Feb 2026 – 30 Jan 2027"; one date for events; the year only once when both share it. */
function when(item: BoardItem) {
  const { startsAt: s, endsAt: e } = item;
  if (!s) return null;
  if (item.kind === "events" || !e) {
    const date = fmt(s, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const time = new Date(s).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return item.kind === "events" && time !== "00:00" ? `${date}, ${time}` : date;
  }
  const sameYear = new Date(s).getFullYear() === new Date(e).getFullYear();
  return `${fmt(s, sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" })} – ${fmt(e, { day: "numeric", month: "short", year: "numeric" })}`;
}

function length(item: BoardItem) {
  if (!item.startsAt || !item.endsAt || item.kind === "events") return null;
  const days = Math.round((new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / DAY);
  if (days <= 0) return null;
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  const weeks = Math.round(days / 7);
  return weeks < 9 ? `${weeks} weeks` : `${Math.round(days / 30)} months`;
}

/**
 * One opportunity as a card, used on /feed, the landing page, company pages
 * and "More from". Top: who and what. Middle: the image, untouched (photos
 * and flyers alike). Bottom: when, how, cost. Footer: the deadline and the
 * way in, only while it's open.
 */
export function OpportunityCard({ item, headingLevel = 3 }: { item: BoardItem; headingLevel?: 2 | 3 }) {
  const kind = KIND[item.kind];
  const closed = isClosed(item);
  const Heading = `h${headingLevel}` as const;
  const dates = when(item);
  const span = length(item);
  const where = [item.workMode && item.workMode[0].toUpperCase() + item.workMode.slice(1), item.location].filter(Boolean).join(", ");
  const daysLeft = item.closesAt ? Math.ceil((new Date(item.closesAt).getTime() - Date.now()) / DAY) : null;
  const urgent = !closed && daysLeft !== null && daysLeft <= 7;
  const href = item.kind === "programs" ? `/programs/${item.id}` : `/feed/${item.id}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
    >
      {/* Top: who and what */}
      <div className="flex items-center gap-2 text-sm text-[#4A5670]">
        {item.companyLogo ? (
          <img src={item.companyLogo} alt="" className="h-6 w-6 shrink-0 rounded-md bg-white object-cover ring-1 ring-[#EEF2FA]" />
        ) : (
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#155DFC] text-xs font-bold text-white">
            {item.companyName.charAt(0)}
          </span>
        )}
        <span className="min-w-0 truncate font-medium">{item.companyName}</span>
        {item.companyVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#155DFC]" aria-label="Verified company" />}
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#7B869C]">
          <kind.icon className="h-3.5 w-3.5" aria-hidden="true" />
          {kind.label}
        </span>
      </div>
      <Heading className="mt-2 line-clamp-2 min-h-[2.75rem] font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">{item.title}</Heading>

      {/* Middle: the image as uploaded, top-anchored so a flyer's headline stays visible */}
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA]">
        <CardImage src={item.image} closed={closed} Icon={kind.icon} />
      </div>

      {/* Bottom: when, how, cost */}
      <div className="mt-4">
        {dates && (
          <p className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
            <span className="font-semibold text-[#0B1B3F]">{dates}</span>
            {span && <span className="text-sm text-[#7B869C]">{span}</span>}
          </p>
        )}
        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#4A5670]">
          {where && <span className="truncate">{where}</span>}
          <span className={`shrink-0 ${item.hasFee ? "" : "font-medium text-[#067647]"}`}>
            {item.hasFee ? (item.priceXaf ? `${item.priceXaf.toLocaleString("en-US")} XAF` : "Fee applies") : "Free"}
          </span>
        </p>
      </div>

      {/* Footer: the deadline and the way in */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 whitespace-nowrap border-t border-[#EEF2FA] pt-3 text-sm">
          {closed ? (
            <span className="text-[#7B869C]">
              {item.closesAt ? `Closed on ${fmt(item.closesAt, { day: "numeric", month: "short" })}` : "Ended"}
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 ${urgent ? "font-semibold text-[#C2410C]" : "text-[#067647]"}`}>
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.closesAt
                ? daysLeft !== null && daysLeft <= 0
                  ? "Last day"
                  : `${kind.verb} by ${fmt(item.closesAt, { day: "numeric", month: "short" })}`
                : "Open now"}
            </span>
          )}
          <span className="shrink-0 font-semibold text-[#155DFC] group-hover:underline">View {kind.noun}</span>
        </div>
      </div>
    </Link>
  );
}

/** The image, or a branded tile with the type icon when there is none or it fails. */
function CardImage({ src, closed, Icon }: { src: string | null; closed: boolean; Icon: typeof Briefcase }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E8EFFF] to-[#F3F7FF]">
        <Icon className="h-10 w-10 text-[#155DFC]/40" />
      </div>
    );
  }
  return (
    <CoverImage
      src={src}
      sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 100vw"
      onFail={() => setFailed(true)}
      className={`object-cover object-top ${closed ? "saturate-[0.6]" : ""}`}
    />
  );
}

/** Loading placeholder with the card's footprint. */
export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5]">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[#EEF2FA]" />
        <div className="h-3 w-24 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      </div>
      <div className="mt-3 h-4 w-4/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="mt-2 h-4 w-3/5 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="mt-3 aspect-[4/3] rounded-xl bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="mt-4 h-4 w-1/2 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="mt-2 h-3 w-2/3 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      <div className="mt-4 border-t border-[#EEF2FA] pt-3">
        <div className="h-3 w-1/3 rounded bg-[#EEF2FA] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
