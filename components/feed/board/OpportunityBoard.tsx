"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { isClosed, type BoardItem } from "./board-types";
import { OpportunityCard } from "./OpportunityCard";

type Tab = "all" | "internships" | "programs" | "events";
type Sort = "newest" | "closing";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "internships", label: "Internships" },
  { id: "programs", label: "Programs" },
  { id: "events", label: "Events" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "closing", label: "Closing soon" },
];

const PAGE_SIZE = 12;

/** Shared look for every form control on the board: 48px tall, 12px radius, one focus ring. */
const control =
  "h-12 rounded-xl border border-[#DCE5F5] bg-white text-base text-[#0B1B3F] transition-colors " +
  "hover:border-[#B9C8E6] focus-visible:outline-none focus-visible:border-[#155DFC] focus-visible:ring-4 focus-visible:ring-[#155DFC]/15";
const fieldLabel = "mb-1.5 block text-sm font-medium text-[#0B1B3F]";

const matches = (item: BoardItem, query: string) => {
  if (!query) return true;
  const haystack = [item.title, item.companyName, item.location, ...item.skills]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
};

export function OpportunityBoard({ items, searchInHeader = false }: { items: BoardItem[]; searchInHeader?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // View state lives in the URL, so a filtered list can be shared or bookmarked.
  const tab = (
    TABS.some((t) => t.id === params.get("type")) ? params.get("type") : "all"
  ) as Tab;
  const sort: Sort = params.get("sort") === "closing" ? "closing" : "newest";
  const freeOnly = params.get("free") === "1";
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  // A search from the top bar changes ?q= while this page stays mounted.
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showClosed, setShowClosed] = useState(false);
  const uid = useId();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
    setVisible(PAGE_SIZE);
  };

  // Closed opportunities can't be applied to, so they sit in a separate,
  // collapsed list below the open ones (still useful to see what gets posted).
  const open = useMemo(() => items.filter((item) => !isClosed(item)), [items]);
  const closed = useMemo(
    () =>
      items
        .filter(
          (item) =>
            isClosed(item) &&
            matches(item, query.trim()) &&
            (tab === "all" || item.kind === tab),
        )
        .sort(
          (a, b) =>
            new Date(b.closesAt ?? b.startsAt ?? 0).getTime() -
            new Date(a.closesAt ?? a.startsAt ?? 0).getTime(),
        ),
    [items, query, tab],
  );
  const searched = useMemo(
    () =>
      open.filter(
        (item) => matches(item, query.trim()) && (!freeOnly || !item.hasFee),
      ),
    [open, query, freeOnly],
  );
  const counts = useMemo(
    () => ({
      all: searched.length,
      internships: searched.filter((i) => i.kind === "internships").length,
      programs: searched.filter((i) => i.kind === "programs").length,
      events: searched.filter((i) => i.kind === "events").length,
    }),
    [searched],
  );
  const results = useMemo(() => {
    const list =
      tab === "all" ? searched : searched.filter((i) => i.kind === tab);
    const time = (d: string | null, fallback: number) =>
      d ? new Date(d).getTime() : fallback;
    return [...list].sort((a, b) =>
      sort === "closing"
        ? time(a.closesAt ?? a.startsAt, Infinity) -
          time(b.closesAt ?? b.startsAt, Infinity)
        : time(b.postedAt, 0) - time(a.postedAt, 0),
    );
  }, [searched, tab, sort]);

  const clearAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      {/* Filters: every control has a visible label, the same height and the same focus ring. */}
      <div className="rounded-2xl bg-[#F8FAFF] p-4 ring-1 ring-[#DCE5F5] sm:p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_11rem] sm:items-end md:grid-cols-[1fr_11rem_11rem]">
          <form
            className={`order-1 col-span-2 sm:order-none sm:col-span-1 ${searchInHeader ? "md:hidden" : "md:col-span-3"}`}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", query.trim() || null);
            }}
          >
            <label htmlFor="feed-search" className={fieldLabel}>
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B869C]"
                aria-hidden="true"
              />
              <input
                id="feed-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Title, company, skill or town"
                className={`${control} w-full pl-12 pr-11 placeholder:text-[#7B869C] focus:outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/15 [&::-webkit-search-cancel-button]:hidden`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setParam("q", null);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          <div className="order-3 min-w-0 sm:order-none md:order-2">
            <span id={`${uid}-sort`} className={fieldLabel}>
              Sort by
            </span>
            <SelectPrimitive.Root
              value={sort}
              onValueChange={(v) =>
                setParam("sort", v === "closing" ? "closing" : null)
              }
            >
              <SelectPrimitive.Trigger
                aria-labelledby={`${uid}-sort`}
                className={`${control} inline-flex w-full items-center justify-between gap-3 px-4 font-medium data-[state=open]:border-[#155DFC] data-[state=open]:ring-4 data-[state=open]:ring-[#155DFC]/15`}
              >
                <SelectPrimitive.Value />
                <SelectPrimitive.Icon>
                  <ChevronDown
                    className="h-4 w-4 text-[#4A5670]"
                    aria-hidden="true"
                  />
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                  position="popper"
                  sideOffset={6}
                  className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#DCE5F5] bg-white p-1 shadow-[0_16px_40px_-12px_rgba(11,27,63,0.25)]"
                >
                  <SelectPrimitive.Viewport>
                    {SORTS.map((option) => (
                      <SelectPrimitive.Item
                        key={option.id}
                        value={option.id}
                        className="relative flex h-10 cursor-pointer select-none items-center rounded-lg pl-3 pr-9 text-base text-[#0B1B3F] outline-none data-[highlighted]:bg-[#F3F7FF] data-[state=checked]:font-semibold"
                      >
                        <SelectPrimitive.ItemText>
                          {option.label}
                        </SelectPrimitive.ItemText>
                        <SelectPrimitive.ItemIndicator className="absolute right-3">
                          <Check
                            className="h-4 w-4 text-[#155DFC]"
                            aria-hidden="true"
                          />
                        </SelectPrimitive.ItemIndicator>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          </div>

          <div className="order-2 col-span-2 sm:order-none sm:col-span-1 md:order-1">
            <span id={`${uid}-type`} className={fieldLabel}>
              Type
            </span>
            <div
              role="tablist"
              aria-labelledby={`${uid}-type`}
              className="grid h-12 grid-cols-4 gap-1 rounded-xl border border-[#DCE5F5] bg-white p-1"
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() =>
                      setParam("type", t.id === "all" ? null : t.id)
                    }
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                      active
                        ? "bg-[#0B1B3F] text-white"
                        : "text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
                    }`}
                  >
                    {t.label}
                    {/* Counts hidden on phones so four tabs fit; the total is shown below. */}
                    <span
                      className={`hidden text-xs tabular-nums sm:inline ${active ? "text-white/70" : "text-[#7B869C]"}`}
                    >
                      {counts[t.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-4 min-w-0 sm:order-none md:order-3">
            <span className={fieldLabel} aria-hidden="true">
              Price
            </span>
            <label
              htmlFor={`${uid}-free`}
              className={`${control} flex w-full cursor-pointer items-center justify-between gap-2 whitespace-nowrap px-3 font-medium sm:gap-3 sm:px-4`}
            >
              Free only
              <SwitchPrimitive.Root
                id={`${uid}-free`}
                checked={freeOnly}
                onCheckedChange={(on) => setParam("free", on ? "1" : null)}
                className="relative h-6 w-10 shrink-0 rounded-full bg-[#CBD5E6] transition-colors data-[state=checked]:bg-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
              >
                <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
              </SwitchPrimitive.Root>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="mt-6 text-sm font-medium text-[#4A5670]" aria-live="polite">
        {results.length} open{" "}
        {results.length === 1 ? "opportunity" : "opportunities"}
        {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
      </p>

      {results.length === 0 ? (
        open.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F3F7FF] px-6 py-8 text-center ring-1 ring-[#DCE5F5]">
            <p className="font-heading text-lg font-semibold text-[#0B1B3F]">
              Nothing is open right now.
            </p>
            <p className="mt-1 text-base text-[#4A5670]">
              Companies post new internships, programs and events regularly. See
              what was posted recently below.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#F3F7FF] px-6 py-8 text-center ring-1 ring-[#DCE5F5]">
            <p className="font-heading text-lg font-semibold text-[#0B1B3F]">
              No opportunities match these filters.
            </p>
            <p className="mt-1 text-base text-[#4A5670]">
              Try another word, or clear the filters to see everything
              that&apos;s open.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className={`${landingButton("secondary", "md")} mt-5`}
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <ul className="mt-3 grid gap-5 sm:grid-cols-2">
          {results.slice(0, visible).map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <OpportunityCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {visible < results.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className={landingButton("secondary", "md")}
          >
            Show {Math.min(PAGE_SIZE, results.length - visible)} more
          </button>
        </div>
      )}

      {closed.length > 0 && (
        <section aria-labelledby="closed-title" className="mt-10">
          <button
            type="button"
            id="closed-title"
            onClick={() => setShowClosed((v) => !v)}
            aria-expanded={showClosed || open.length === 0}
            className="flex h-11 items-center gap-2 rounded-lg px-1 font-heading text-base font-semibold text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          >
            Recently closed
            <span className="text-sm font-normal text-[#7B869C]">
              {closed.length}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#4A5670] transition-transform ${showClosed || open.length === 0 ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {/* Expanded by default when nothing is open, so the page is never empty. */}
          {(showClosed || open.length === 0) && (
            <ul className="mt-3 grid gap-5 sm:grid-cols-2">
              {closed.map((item) => (
                <li key={`closed-${item.kind}-${item.id}`}>
                  <OpportunityCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
