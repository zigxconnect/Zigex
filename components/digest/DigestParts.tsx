import { ArrowUpRight, CalendarClock, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImg } from "@/components/SafeImg";
import { deadlineLabel, eventDateLabel, type DigestItem } from "@/lib/api/digest-shape";

// The AI service's categories (digest_agent.CATEGORIES).
const CATEGORY_TEXT: Record<string, string> = {
  internship: "Internship",
  job: "Job",
  hackathon: "Hackathon",
  scholarship: "Scholarship",
  conference: "Conference",
  workshop: "Workshop",
  fellowship: "Fellowship",
  competition: "Competition",
};

export const categoryLabel = (category: string | null) => (category ? CATEGORY_TEXT[category.toLowerCase()] ?? null : null);

/** Deadline as a chip: amber inside a week, grey once closed. */
export function DeadlineChip({ deadline, className }: { deadline: string | null; className?: string }) {
  const d = deadlineLabel(deadline);
  if (!d) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        d.past ? "bg-[#F2F4F7] text-[#4A5670]" : d.urgent ? "bg-[#FFF7E6] text-[#B54708]" : "bg-[#F3F7FF] text-[#2F4A85]",
        className
      )}
    >
      <CalendarClock className="h-3 w-3" aria-hidden="true" />
      {d.text}
    </span>
  );
}

/** One pick: what it is, why it fits, and the organiser's site to apply on. */
export function DigestItemCard({ item }: { item: DigestItem }) {
  const category = categoryLabel(item.category);
  const when = eventDateLabel(item.eventDate);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-md hover:shadow-[#0B1B3F]/5 hover:ring-[#B9CCFB]">
      {item.image && (
        <figure className="relative aspect-[16/9] bg-[#F3F7FF]">
          <SafeImg
            src={item.image.url}
            alt={item.image.caption}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {item.image.credit && (
            <figcaption className="absolute bottom-2 right-2 rounded-md bg-[#0B1B3F]/70 px-1.5 py-0.5 text-[11px] text-white">
              Image: {item.image.credit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {category && <span className="rounded-full bg-[#F3F7FF] px-2 py-0.5 text-xs font-semibold text-[#155DFC]">{category}</span>}
          <DeadlineChip deadline={item.deadline} />
          {when && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#F2F4F7] px-2 py-0.5 text-xs font-semibold text-[#4A5670]">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {when}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">
          {/* The whole card opens the link; the title carries the accessible name. */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded after:absolute after:inset-0 after:rounded-2xl group-hover:text-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
          >
            {item.title}
            <span className="sr-only"> (opens {item.domain} in a new tab)</span>
          </a>
        </h3>

        {item.location && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[#4A5670]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7B869C]" aria-hidden="true" />
            <span className="truncate">{item.location}</span>
          </p>
        )}

        {item.summary && <p className="mt-3 text-sm leading-relaxed text-[#4A5670]">{item.summary}</p>}

        {item.reason && (
          <div className="mt-4 rounded-xl bg-[#F8FAFF] px-3.5 py-3 ring-1 ring-[#EEF2FA]">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#155DFC]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Why it fits you
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#0B1B3F]">{item.reason}</p>
          </div>
        )}

        <p className="mt-auto flex min-w-0 items-center gap-1 pt-4 text-sm font-semibold text-[#155DFC]" aria-hidden="true">
          <span className="truncate">Apply on {item.domain}</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
        </p>
      </div>
    </article>
  );
}

export function DigestItemSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]" aria-hidden="true">
      <div className="h-5 w-24 rounded-full bg-[#EEF2FA]" />
      <div className="mt-4 h-5 w-3/4 rounded bg-[#EEF2FA]" />
      <div className="mt-2 h-4 w-1/2 rounded bg-[#F3F6FB]" />
      <div className="mt-5 h-16 rounded-xl bg-[#F8FAFF]" />
    </div>
  );
}
