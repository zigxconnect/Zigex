import { ArrowUpRight, CalendarClock, CalendarDays, MapPin } from "lucide-react";
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

const chip = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold";

/** Deadline as a chip: amber inside a week, grey once closed. */
export function DeadlineChip({ deadline, className }: { deadline: string | null; className?: string }) {
  const d = deadlineLabel(deadline);
  if (!d) return null;
  return (
    <span className={cn(chip, d.past ? "bg-[#F2F4F7] text-[#4A5670]" : d.urgent ? "bg-[#FFF7E6] text-[#B54708]" : "bg-[#F3F7FF] text-[#2F4A85]", className)}>
      <CalendarClock className="h-3 w-3" aria-hidden="true" />
      {d.text}
    </span>
  );
}

/**
 * One weekly pick. It lives on another website, so the card says where the
 * link goes and why it was picked; there's no Zigex "Apply" here.
 */
export function DigestItemCard({ item }: { item: DigestItem }) {
  const category = categoryLabel(item.category);
  const when = eventDateLabel(item.eventDate);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] transition-colors hover:ring-[#9DB8F5]">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {(category || item.deadline || when) && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              {category && <span className={cn(chip, "bg-[#F3F7FF] text-[#155DFC]")}>{category}</span>}
              <DeadlineChip deadline={item.deadline} />
              {when && (
                <span className={cn(chip, "bg-[#F2F4F7] text-[#4A5670]")}>
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {when}
                </span>
              )}
            </div>
          )}
          <h3 className="font-heading text-[17px] font-semibold leading-snug text-[#0B1B3F]">
            {/* The whole card opens the link; the title carries the accessible name. */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded after:absolute after:inset-0 after:rounded-2xl group-hover:text-[#155DFC] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#155DFC] focus-visible:after:ring-offset-2"
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
        </div>
        {item.image && (
          // Web images vary wildly; a fixed thumbnail keeps every card the same shape.
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA]">
            <SafeImg
              src={item.image.url}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </span>
        )}
      </div>

      {item.summary && <p className="mt-3 text-[15px] leading-relaxed text-[#4A5670]">{item.summary}</p>}

      {item.reason && (
        <p className="mt-3 border-l-2 border-[#155DFC] pl-3 text-[15px] leading-relaxed text-[#0B1B3F]">
          <span className="font-semibold">Why it fits you: </span>
          {item.reason}
        </p>
      )}

      <p className="mt-auto flex min-w-0 items-center gap-1 pt-4 text-sm font-semibold text-[#155DFC]" aria-hidden="true">
        <span className="truncate">Apply on {item.domain}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0" />
      </p>
    </article>
  );
}

export function DigestItemSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]" aria-hidden="true">
      <div className="h-5 w-24 rounded-full bg-[#EEF2FA]" />
      <div className="mt-3 h-5 w-3/4 rounded bg-[#EEF2FA]" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-[#F3F6FB]" />
        <div className="h-3.5 w-5/6 rounded bg-[#F3F6FB]" />
      </div>
      <div className="mt-4 h-10 rounded bg-[#F8FAFF]" />
    </div>
  );
}
