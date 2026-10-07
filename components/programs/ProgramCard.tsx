import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import type { FeedRow } from "@/lib/api/services/feed";
import { CoverImage } from "@/components/CoverImage";

const DAY = 86_400_000;

export type ProgramView = {
  id: string;
  title: string;
  image: string | null;
  company: string;
  logo: string | null;
  verified: boolean;
  startsAt: string | null;
  endsAt: string | null;
  deadline: string | null;
  location: string | null;
  mode: string | null;
  hasFee: boolean;
  priceXaf: number | null;
  skills: string[];
  open: boolean;
};

export function toProgramView(row: FeedRow, now = Date.now()): ProgramView {
  const company = row.company ?? row.company_profiles ?? null;
  const deadline: string | null = row.application_deadline ?? row.deadline ?? null;
  const startsAt: string | null = row.start_date ?? null;
  // Open while registration hasn't closed; without a deadline, until it starts.
  const cutoff = deadline ?? startsAt;
  return {
    id: row.id,
    title: row.title,
    image: row.program_picture_url ?? null,
    company: company?.company_name ?? "Zigex partner",
    logo: company?.logo_url ?? null,
    verified: Boolean(company?.is_verified),
    startsAt,
    endsAt: row.end_date ?? null,
    deadline,
    location: row.location ?? null,
    mode: typeof row.type === "string" ? row.type : null,
    hasFee: Boolean(row.is_paid),
    priceXaf: typeof row.price_xaf === "number" ? row.price_xaf : null,
    skills: Array.isArray(row.required_skills) ? row.required_skills.filter(Boolean).slice(0, 3) : [],
    open: cutoff ? new Date(cutoff).getTime() + DAY > now : true,
  };
}

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString("en-GB", opts);

function duration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / DAY);
  if (days <= 0) return null;
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  const weeks = Math.round(days / 7);
  return weeks < 9 ? `${weeks} weeks` : `${Math.round(days / 30)} months`;
}

function registration(p: ProgramView) {
  if (!p.open) return { text: p.endsAt && new Date(p.endsAt).getTime() < Date.now() ? "Ended" : "Registration closed", tone: "muted" as const };
  if (!p.deadline) return { text: "Registration open", tone: "open" as const };
  const days = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / DAY);
  if (days <= 0) return { text: "Last day to register", tone: "urgent" as const };
  return { text: `Register within ${days} day${days === 1 ? "" : "s"}`, tone: days <= 7 ? ("urgent" as const) : ("open" as const) };
}

const TONE = {
  open: "text-[#067647]",
  urgent: "font-semibold text-[#C2410C]",
  muted: "text-[#7B869C]",
};

/** "18 Jul – 8 Aug 2026"; the year once, on the end date. */
function dateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const sameYear = end && new Date(start).getFullYear() === new Date(end).getFullYear();
  const from = fmt(start, sameYear || !end ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
  if (!end) return `From ${fmt(start, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${from} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

/**
 * One program as a card: who runs it and what it is on top; the organiser's
 * flyer in the middle, untouched (flyers carry their own text, so nothing is
 * laid over them); then when it runs, how, and whether you can still join.
 */
export function ProgramCard({ program: p }: { program: ProgramView }) {
  const reg = registration(p);
  const length = duration(p.startsAt, p.endsAt);
  const when = dateRange(p.startsAt, p.endsAt);
  const where = [p.mode && p.mode[0].toUpperCase() + p.mode.slice(1), p.location].filter(Boolean).join(", ");

  return (
    <Link
      href={`/programs/${p.id}`}
      className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
    >
      {/* Top: who and what */}
      <div className="flex items-center gap-2 text-sm text-[#4A5670]">
        {p.logo ? (
          <img src={p.logo} alt="" className="h-6 w-6 shrink-0 rounded-md object-cover ring-1 ring-[#EEF2FA]" />
        ) : (
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#155DFC] text-xs font-bold text-white">
            {p.company.charAt(0)}
          </span>
        )}
        <span className="truncate font-medium">{p.company}</span>
        {p.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#155DFC]" aria-label="Verified company" />}
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">
        {p.title}
      </h3>

      {/* Middle: the flyer, top-anchored so its own headline stays visible */}
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA]">
        {p.image && (
          <CoverImage
            src={p.image}
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 100vw"
            className={`object-cover object-top ${p.open ? "" : "saturate-[0.6]"}`}
          />
        )}
      </div>

      {/* Bottom: when, how, cost */}
      <div className="mt-4">
        {when && (
          <p className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
            <span className="font-semibold text-[#0B1B3F]">{when}</span>
            {length && <span className="text-sm text-[#7B869C]">{length}</span>}
          </p>
        )}
        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#4A5670]">
          <span className="truncate">{where || "Details on the program page"}</span>
          <span className={`shrink-0 ${p.hasFee ? "" : "font-medium text-[#067647]"}`}>
            {p.hasFee ? (p.priceXaf ? `${p.priceXaf.toLocaleString("en-US")} XAF` : "Fee applies") : "Free"}
          </span>
        </p>
      </div>

      {/* Footer only when there is something to do */}
      {p.open && (
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-[#EEF2FA] pt-3">
          <span className={`inline-flex items-center gap-1.5 text-sm ${TONE[reg.tone]}`}>
            <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
            {p.deadline ? `Register by ${fmt(p.deadline, { day: "numeric", month: "short" })}` : reg.text}
          </span>
            <span className="text-sm font-semibold text-[#155DFC] group-hover:underline">View program</span>
          </div>
        </div>
      )}
    </Link>
  );
}
