"use client";

import { useEffect, useMemo, useState } from "react";
import { Pin } from "lucide-react";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";

export type AnnouncementView = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdAt: string;
  pinned: boolean;
  from: string;
  fromLogo: string | null;
};

const LAST_VISIT_KEY = "zigex_announcements_last_visit";

const monthLabel = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

function ago(date: string) {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/**
 * The noticeboard: pinned notices first, then a dated timeline grouped by
 * month. Messages posted since the student's last visit are marked New
 * (last visit is remembered in this browser only). Filter by sender once
 * more than one sender has posted.
 */
export function AnnouncementTimeline({ items }: { items: AnnouncementView[] }) {
  const [lastVisit, setLastVisit] = useState<number | null>(null);
  const [sender, setSender] = useState<string>("all");

  useEffect(() => {
    let previous = 0;
    try {
      previous = Number(localStorage.getItem(LAST_VISIT_KEY)) || 0;
      localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
      // Private mode or blocked storage: nothing is marked new.
    }
    setLastVisit(previous);
  }, []);

  const senders = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((a) => counts.set(a.from, (counts.get(a.from) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const shown = sender === "all" ? items : items.filter((a) => a.from === sender);
  const pinned = shown.filter((a) => a.pinned);
  const timeline = shown.filter((a) => !a.pinned).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // First visit (no record): don't flood the page with "New".
  const isNew = (a: AnnouncementView) => Boolean(lastVisit) && new Date(a.createdAt).getTime() > (lastVisit as number);
  const newCount = timeline.filter(isNew).length;

  const months: { label: string; items: AnnouncementView[] }[] = [];
  timeline.forEach((a) => {
    const label = monthLabel(a.createdAt);
    const group = months.at(-1);
    if (group?.label === label) group.items.push(a);
    else months.push({ label, items: [a] });
  });

  return (
    <div>
      {senders.length > 1 && (
        <div role="group" aria-label="Filter by sender" className="mb-6 flex flex-wrap gap-2">
          {[["all", items.length] as [string, number], ...senders].map(([name, count]) => {
            const active = sender === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => setSender(name)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                  active ? "bg-[#0B1B3F] text-white" : "bg-white text-[#4A5670] ring-1 ring-[#DCE5F5] hover:text-[#0B1B3F]"
                }`}
              >
                {name === "all" ? "All" : name}
                <span className={`tabular-nums ${active ? "text-white/70" : "text-[#7B869C]"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {pinned.length > 0 && (
        <section aria-labelledby="pinned-title" className="mb-10">
          <h2 id="pinned-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0B1B3F]">
            <Pin className="h-4 w-4 text-[#155DFC]" aria-hidden="true" /> Pinned
          </h2>
          <ul className="space-y-3">
            {pinned.map((a) => (
              <li key={a.id}>
                <Notice a={a} emphasis />
              </li>
            ))}
          </ul>
        </section>
      )}

      {newCount > 0 && (
        <p className="mb-4 text-sm font-medium text-[#155DFC]" aria-live="polite">
          {newCount} new since your last visit
        </p>
      )}

      {months.map((month) => (
        <section key={month.label} aria-label={month.label} className="mb-8 last:mb-0">
          <h2 className="sticky top-16 z-10 -mx-1 mb-3 bg-[#F8FAFF]/95 px-1 py-2 font-heading text-base font-semibold text-[#0B1B3F] backdrop-blur">
            {month.label}
          </h2>
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[27px] before:top-2 before:w-px before:bg-[#DCE5F5] sm:before:left-[31px]">
            {month.items.map((a) => (
              <li key={a.id} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4">
                {/* Date on the timeline */}
                <div className="relative z-[1] flex flex-col items-center pt-4">
                  <span className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl text-center ring-4 ring-[#F8FAFF] sm:h-14 sm:w-14 ${isNew(a) ? "bg-[#155DFC] text-white" : "bg-white text-[#0B1B3F] ring-offset-0 shadow-[inset_0_0_0_1px_#DCE5F5]"}`}>
                    <span className="font-heading text-lg font-bold leading-none tabular-nums sm:text-xl">{new Date(a.createdAt).getDate()}</span>
                    <span className={`text-xs ${isNew(a) ? "text-white/80" : "text-[#7B869C]"}`}>
                      {new Date(a.createdAt).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                  </span>
                </div>
                <Notice a={a} isNew={isNew(a)} />
              </li>
            ))}
          </ol>
        </section>
      ))}

      {shown.length === 0 && (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-base text-[#4A5670] ring-1 ring-[#DCE5F5]">
          No announcements yet. Companies and Zigex post news about programs and opportunities here.
        </p>
      )}
    </div>
  );
}

/** One message: sender and time, title, text (folds when long), photo beside it on wider screens. */
function Notice({ a, isNew = false, emphasis = false }: { a: AnnouncementView; isNew?: boolean; emphasis?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const plain = a.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const long = plain.length > 280;

  return (
    <article
      className={`rounded-2xl bg-white p-4 ring-1 sm:p-5 ${
        isNew ? "ring-[#155DFC]/40 shadow-[inset_3px_0_0_#155DFC]" : emphasis ? "ring-[#B9C8E6]" : "ring-[#DCE5F5]"
      }`}
    >
      <div className={a.image ? "sm:grid sm:grid-cols-[minmax(0,1fr)_168px] sm:gap-5" : ""}>
        <div className="min-w-0">
          <header className="flex items-center gap-2.5">
            {a.fromLogo ? (
              <img src={a.fromLogo} alt="" className="h-7 w-7 shrink-0 rounded-full bg-white object-contain ring-1 ring-[#EEF2FA]" />
            ) : (
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#155DFC] text-xs font-bold text-white">
                {a.from.charAt(0)}
              </span>
            )}
            <p className="min-w-0 truncate text-sm">
              <span className="font-semibold text-[#0B1B3F]">{a.from}</span>
              {/* The timeline already shows the date; add how long ago only for the past week. */}
              {Date.now() - new Date(a.createdAt).getTime() < 7 * 86_400_000 && (
                <time dateTime={a.createdAt} className="text-[#7B869C]">
                  {" "}
                  {ago(a.createdAt).toLowerCase()}
                </time>
              )}
            </p>
            {isNew && <span className="ml-auto shrink-0 rounded-full bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#155DFC]">New</span>}
          </header>

          <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">{a.title}</h3>

          {plain && (
            <div className={`relative mt-1.5 ${long && !expanded ? "max-h-[7.5rem] overflow-hidden" : ""}`}>
              <RichContentRenderer
                content={a.content}
                className="text-base leading-relaxed text-[#4A5670] [&_a]:font-medium [&_a]:text-[#155DFC] [&_a]:underline [&_p+p]:mt-2"
              />
              {long && !expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white" />}
            </div>
          )}
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-1.5 rounded-sm text-sm font-semibold text-[#155DFC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {a.image && (
          <a
            href={a.image}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-[#EEF2FA] sm:mt-0"
          >
            <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 motion-safe:hover:scale-[1.03]" />
            <span className="sr-only">Open the photo full size</span>
          </a>
        )}
      </div>
    </article>
  );
}
