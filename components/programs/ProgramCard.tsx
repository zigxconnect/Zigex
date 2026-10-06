import Link from "next/link";
import { BadgeCheck, CalendarClock, MapPin, Monitor, Timer } from "lucide-react";
import type { FeedRow } from "@/lib/api/services/feed";

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

/**
 * One program as a card: who runs it and what it is on top, the photo in the
 * middle with the start date pinned to it (a program is a cohort that begins
 * on a day), then the practical facts and whether you can still register.
 */
export function ProgramCard({ program: p }: { program: ProgramView }) {
  const reg = registration(p);
  const length = duration(p.startsAt, p.endsAt);

  return (
    <Link
      href={`/feed/${p.id}`}
      className={`group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
        p.open ? "" : "opacity-85"
      }`}
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
      <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-heading text-lg font-semibold leading-snug text-[#0B1B3F] group-hover:text-[#155DFC]">
        {p.title}
      </h3>

      {/* Middle: photo with the start date pinned to it */}
      <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-xl bg-[#F3F7FF]">
        {p.image && (
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03] ${p.open ? "" : "grayscale-[60%]"}`}
          />
        )}
        <div
          className={`absolute left-3 top-3 flex w-14 flex-col items-center rounded-lg py-1.5 text-center shadow-sm ${
            p.open ? "bg-[#0B1B3F] text-white" : "bg-white/95 text-[#4A5670]"
          }`}
        >
          {p.startsAt ? (
            <>
              <span className="text-xs font-medium opacity-80">{p.open ? "Starts" : "Started"}</span>
              <span className="font-heading text-xl font-bold leading-tight tabular-nums">{fmt(p.startsAt, { day: "numeric" })}</span>
              <span className="text-xs font-semibold">{fmt(p.startsAt, { month: "short" })}</span>
            </>
          ) : (
            <span className="px-1 text-xs font-medium">Date soon</span>
          )}
        </div>
      </div>

      {/* Bottom: the practical facts */}
      <ul className="mb-3 mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#4A5670]">
        {length && (
          <li className="inline-flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
            {length}
          </li>
        )}
        {p.mode && (
          <li className="inline-flex items-center gap-1.5 capitalize">
            <Monitor className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
            {p.mode}
          </li>
        )}
        <li className={p.hasFee ? "" : "font-medium text-[#067647]"}>
          {p.hasFee ? (p.priceXaf ? `${p.priceXaf.toLocaleString("en-US")} XAF` : "Fee applies") : "Free"}
        </li>
        {p.location && (
          <li className="inline-flex w-full min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" />
            <span className="truncate">{p.location}</span>
          </li>
        )}
      </ul>

      <p className={`mt-auto flex items-center gap-1.5 border-t border-[#EEF2FA] pt-3 text-sm ${TONE[reg.tone]}`}>
        <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
        {reg.text}
        {p.open && p.deadline && <span className="text-[#7B869C]">(by {fmt(p.deadline, { day: "numeric", month: "short" })})</span>}
      </p>
    </Link>
  );
}
