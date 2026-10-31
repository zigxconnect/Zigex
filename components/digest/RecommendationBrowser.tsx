"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { SafeImg } from "@/components/SafeImg";
import { eventDateLabel, type DigestItem } from "@/lib/api/digest-shape";
import { ProUpgradeDialog } from "./ProUpgradeDialog";

const PAGE_SIZE = 3;

function categoryName(category: string | null) {
  if (!category) return "Other";
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

function RecommendationCard({ item }: { item: DigestItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const date = eventDateLabel(item.eventDate);
  const summaryText = item.summary ?? "";
  const shouldClamp = summaryText.length > 45;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(11,27,63,0.35)]">
      <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="relative aspect-[4/3] overflow-hidden bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#155DFC]" aria-label={`${item.title}, opens ${item.domain} in a new tab`}>
        {item.image && !imageFailed ? (
          <SafeImg
            src={item.image.url}
            alt={item.image.caption || item.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,_#dfe9ff,_#eef3ff_55%,_#e7efff)] text-sm font-medium text-[#7B869C]">
            {categoryName(item.category)}
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[#EAF0FF] px-2 py-1 text-xs font-semibold text-[#155DFC]">{categoryName(item.category)}</span>
          <span className="min-w-0 truncate text-xs font-medium text-[#667085]">{item.domain}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-heading text-lg font-semibold leading-snug text-[#155DFC] group-hover:text-[#0B48D9]">
          <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="focus-visible:outline-none focus-visible:underline">
            {item.title}<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        {summaryText && (
          <div className="mt-2 text-sm leading-relaxed text-[#4A5670]">
            <p className={expanded ? undefined : "line-clamp-1"}>{summaryText}</p>
            {shouldClamp && (
              <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-1 font-semibold text-[#155DFC] hover:text-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]">
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
        <div className="mt-auto space-y-1.5 pt-4 text-sm text-[#4A5670]">
          {item.location && <p className="flex min-w-0 items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" /><span className="truncate">{item.location}</span></p>}
          {date && <p className="flex min-w-0 items-center gap-1.5"><CalendarDays className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" /><span className="truncate">{date}</span></p>}
          {item.deadline && <p className="flex min-w-0 items-center gap-1.5"><CalendarClock className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" /><span className="truncate">Deadline {item.deadline}</span></p>}
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-flex min-h-11 items-center gap-1.5 border-t border-[#EEF2FA] pt-3 text-sm font-semibold text-[#155DFC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]">
          View opportunity <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function RecommendationBrowser({ items }: { items: DigestItem[] }) {
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const categories = useMemo(() => ["All", ...new Set(items.map((item) => categoryName(item.category)))], [items]);
  const filtered = category === "All" ? items : items.filter((item) => categoryName(item.category) === category);
  const shown = filtered.slice(0, visible);

  const scrollFilters = (direction: -1 | 1) => {
    const row = document.getElementById("recommendation-category-row");
    row?.scrollBy({ left: direction * 180, behavior: "smooth" });
  };

  return (
    <>
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <button type="button" onClick={() => scrollFilters(-1)} aria-label="Scroll recommendation categories left" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE5F5] bg-white text-[#4A5670] hover:border-[#9DB8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] sm:flex">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div id="recommendation-category-row" role="tablist" aria-label="Filter recommendations by category" className="flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((option) => (
            <button key={option} type="button" role="tab" aria-selected={category === option} onClick={() => { setCategory(option); setVisible(PAGE_SIZE); }} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${category === option ? "bg-[#0B1B3F] text-white" : "border border-[#DCE5F5] bg-white text-[#4A5670] hover:bg-[#F3F7FF]"}`}>
              {option}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => scrollFilters(1)} aria-label="Scroll recommendation categories right" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE5F5] bg-white text-[#4A5670] hover:border-[#9DB8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] sm:flex">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${shown.length} recommended opportunities`}>
        {shown.map((item) => <li key={item.key} className="min-w-0"><RecommendationCard item={item} /></li>)}
      </ul>
      {visible < filtered.length && (
        <div className="mt-5 flex justify-center">
          <button type="button" onClick={() => setUpgradeOpen(true)} className="min-h-11 rounded-full border border-[#9DB8F5] bg-white px-5 text-sm font-semibold text-[#155DFC] transition hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]">
            Load more recommendations
          </button>
        </div>
      )}

      <ProUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} lockedCount={filtered.length - visible} triggerLabel="Unlock more recommendations" />
    </>
  );
}