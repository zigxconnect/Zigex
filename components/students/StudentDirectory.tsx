"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GraduationCap, Loader2, Search, X } from "lucide-react";
import NameInitials from "@/components/NameInitials";
import { slugifyUsername } from "@/lib/utils";

export type StudentRow = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
};

const UUID_LIKE = /^[0-9a-f-]{20,}$/i;

/** Accounts that never finished sign-up have no name; they aren't shown as people. */
export const isListable = (s: StudentRow) => Boolean(s.full_name && s.full_name.trim() && s.full_name !== "null");

/** "university of bamenda" → "University of Bamenda" (keeps acronyms like "UBa"). */
function tidySchool(raw?: string | null) {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (s !== s.toLowerCase()) return s;
  return s.replace(/\b(\w)(\w*)/g, (_, a: string, b: string) => (["of", "and", "the", "for"].includes(a + b) ? a + b : a.toUpperCase() + b)).replace(/^./, (c) => c.toUpperCase());
}

/** Same address the old cards used, so existing profile links keep working. */
function profileHref(s: StudentRow) {
  const nameSlug = s.full_name ? s.full_name.trim().replace(/\s+/g, "_").toLowerCase() : "";
  return `/dashboard/student/${nameSlug || slugifyUsername(s.username) || s.id}`;
}

/**
 * Student directory: search everyone on Zigex by name (the backend searches
 * all students, not just the page loaded; it doesn't search schools yet),
 * browse 50 at a time.
 */
export function StudentDirectory({ initial, total }: { initial: StudentRow[]; total: number }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<StudentRow[]>(initial);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(Math.max(1, Math.ceil(total / 50)));
  const [count, setCount] = useState(total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);

  const load = async (q: string, nextPage: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: "50" });
      if (q) params.set("search", q);
      const res = await fetch(`/api/v1/students?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.json();
      const data: StudentRow[] = body.data ?? [];
      setRows((prev) => (append ? [...prev, ...data] : data));
      setPage(nextPage);
      setPages(body.meta?.totalPages ?? nextPage);
      setCount(body.meta?.total ?? data.length);
    } catch {
      setError("Students couldn't load. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search as you type (debounced); skip the first render, which has server data.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => load(query.trim(), 1, false), 300);
    return () => clearTimeout(t);
  }, [query]);

  const shown = rows.filter(isListable);

  return (
    <div>
      <div className="relative max-w-xl">
        <label htmlFor="student-search" className="sr-only">
          Search students
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
        <input
          id="student-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          className="h-12 w-full rounded-xl border border-[#DCE5F5] bg-white pl-12 pr-11 text-base text-[#0B1B3F] placeholder:text-[#7B869C] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-[#4A5670]" aria-live="polite">
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {query.trim() ? `${count} result${count === 1 ? "" : "s"} for "${query.trim()}"` : `${count} students on Zigex`}
      </p>

      {error && <p className="mt-4 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">{error}</p>}

      {!loading && shown.length === 0 && !error ? (
        <div className="mt-4 rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-[#DCE5F5]">
          <p className="font-heading text-lg font-semibold text-[#0B1B3F]">No students match &ldquo;{query.trim()}&rdquo;.</p>
          <p className="mt-1 text-base text-[#4A5670]">Try a first name or a surname.</p>
        </div>
      ) : (
        <ul className={`mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${loading && page === 1 ? "opacity-60" : ""}`}>
          {shown.map((s) => {
            const school = tidySchool(s.university);
            const handle = s.username && !UUID_LIKE.test(s.username) ? s.username.replace(/^@+/, "") : null;
            return (
              <li key={s.id} className="min-w-0">
                <Link
                  href={profileHref(s)}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#DCE5F5] transition-shadow hover:shadow-[0_12px_32px_-18px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EEF3FF] text-base">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <NameInitials name={s.full_name ?? ""} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[#0B1B3F]">{s.full_name}</span>
                    {handle && <span className="block truncate text-sm text-[#7B869C]">@{handle}</span>}
                    {school && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-[#4A5670]">
                        <GraduationCap className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" />
                        <span className="truncate">{school}</span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {page < pages && shown.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => load(query.trim(), page + 1, true)}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE5F5] bg-white px-5 text-[15px] font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Show more students
          </button>
        </div>
      )}
    </div>
  );
}
