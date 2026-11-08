"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { OUTSOURCED_FUNDING, OUTSOURCED_TYPES, outsourcedHref, type OutsourcedFilters } from "@/lib/outsourced-filters";
import { fundingLabel, typeLabel } from "./outsourced-labels";

const control =
  "h-11 w-full rounded-xl border border-[#DCE5F5] bg-white px-3 text-[15px] text-[#0B1B3F] focus-visible:border-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30";
const label = "mb-1 block text-xs font-medium text-[#4A5670]";

/**
 * Where, funding, type and a search box. Each change updates the address (so the
 * list can be shared) and starts again from page 1. Works as a plain form too.
 */
export function OutsourcedFilterBar({ filters }: { filters: OutsourcedFilters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (next: Partial<OutsourcedFilters>) =>
    startTransition(() => router.replace(outsourcedHref({ ...filters, ...next, page: 1 }), { scroll: false }));
  const filtered = filters.local !== null || filters.funding || filters.type || filters.q;

  return (
    <form
      action="/opportunities"
      onSubmit={(e) => {
        e.preventDefault();
        go({ q: String(new FormData(e.currentTarget).get("q") ?? "").trim().slice(0, 100) });
      }}
      className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
      aria-busy={pending}
    >
      {filters.section && <input type="hidden" name="section" value={filters.section} />}
      <div className="col-span-2 md:col-span-1">
        <label htmlFor="opp-q" className={label}>Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
          <input
            id="opp-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="Title, organiser or country"
            className={`${control} pl-9`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="opp-local" className={label}>Where</label>
        <select
          id="opp-local"
          name="local"
          value={filters.local === null ? "" : String(filters.local)}
          onChange={(e) => go({ local: e.target.value === "" ? null : e.target.value === "true" })}
          className={control}
        >
          <option value="">Anywhere</option>
          <option value="true">In Cameroon</option>
          <option value="false">Abroad</option>
        </select>
      </div>
      <div>
        <label htmlFor="opp-funding" className={label}>Funding</label>
        <select
          id="opp-funding"
          name="funding"
          value={filters.funding ?? ""}
          onChange={(e) => go({ funding: (e.target.value || null) as OutsourcedFilters["funding"] })}
          className={control}
        >
          <option value="">Any funding</option>
          {OUTSOURCED_FUNDING.map((f) => (
            <option key={f} value={f}>{fundingLabel(f)}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label htmlFor="opp-type" className={label}>Type</label>
        <select
          id="opp-type"
          name="type"
          value={filters.type ?? ""}
          onChange={(e) => go({ type: (e.target.value || null) as OutsourcedFilters["type"] })}
          className={control}
        >
          <option value="">Any type</option>
          {OUTSOURCED_TYPES.map((t) => (
            <option key={t} value={t}>{typeLabel(t) || "Other"}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 flex min-h-5 items-center justify-between gap-3 text-sm md:col-span-4">
        <span className="inline-flex items-center gap-2 text-[#7B869C]" aria-live="polite">
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {pending ? "Updating…" : ""}
        </span>
        {filtered && (
          <button
            type="button"
            onClick={() => go({ local: null, funding: null, type: null, q: "" })}
            className="inline-flex items-center gap-1 font-semibold text-[#155DFC] hover:underline"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
