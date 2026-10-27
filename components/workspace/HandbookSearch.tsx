"use client";

import { Fragment, useId, useRef, useState } from "react";
import { ArrowUpRight, FileText, Loader2, Search, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "./WorkspaceLists";

type Hit = {
  text: string;
  score: number;
  documentId: string;
  title: string;
  source: string;
  page: number | null;
  section: string | null;
};

type State =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; query: string; hits: Hit[] }
  | { status: "error"; query: string; message: string };

const SUGGESTIONS = ["Working hours", "Dress code", "What to do if I'm absent", "How to write the daily report", "Who to contact for help"];

/**
 * Top of the workspace's Learning tab: search the documents the company
 * uploaded for this placement (course notes, rules, guides). Results quote
 * the passage and say where it is (document, page, section), so the student
 * can trust and check it. Results come in relevance order; the service's
 * scores aren't calibrated enough to show as labels.
 */
export function HandbookSearch({ applicationId, companyName }: { applicationId: string; companyName?: string | null }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = useId();

  const search = async (raw: string) => {
    const q = raw.trim();
    if (q.length < 2) {
      setState({ status: "error", query: q, message: "Type at least 2 characters." });
      inputRef.current?.focus();
      return;
    }
    setQuery(q);
    setState({ status: "loading", query: q });
    try {
      const res = await fetch("/api/ai/handbook/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, query: q }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setState({ status: "error", query: q, message: json?.message || "Search isn't working right now. Try again in a few minutes." });
        return;
      }
      setState({ status: "done", query: q, hits: json.data?.hits ?? [] });
    } catch {
      setState({ status: "error", query: q, message: "You seem to be offline. Check your connection and try again." });
    }
  };

  const loading = state.status === "loading";

  return (
    <Panel
      id="docs"
      title={`Search ${companyName ? `${companyName}'s` : "your company's"} documents`}
      note="Course notes, rules and guides shared for this placement. You get the exact passage and the page it's on."
    >
      <div className="px-5 pb-4 sm:px-6">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor={inputId} className="sr-only">
            Your question
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={300}
              enterKeyHint="search"
              autoComplete="off"
              placeholder="e.g. What time should I arrive?"
              aria-describedby={hintId}
              className="h-11 w-full rounded-xl border border-[#DCE5F5] bg-white pl-10 pr-3 text-base text-[#0B1B3F] placeholder:text-[#7B869C] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white shadow-sm shadow-[#155DFC]/25 transition-colors hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : null}
            {loading ? "Searching" : "Search"}
          </button>
        </form>
        <p id={hintId} className="mt-2 text-xs text-[#7B869C]">
          Passages are quoted from the documents as written. If something matters, confirm it with your supervisor.
        </p>

        {state.status === "idle" && (
          <div className="mt-5">
            <p className="text-sm font-medium text-[#0B1B3F]">Try asking about</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => search(s)}
                    className="min-h-9 rounded-full bg-[#F3F7FF] px-3.5 py-1.5 text-sm font-medium text-[#2F4A85] ring-1 ring-[#DCE5F5] transition-colors hover:bg-[#E8F0FF] hover:text-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Announces result counts and errors to screen readers. */}
        <p className="sr-only" role="status" aria-live="polite">
          {state.status === "loading" && "Searching your documents"}
          {state.status === "done" && `${state.hits.length} ${state.hits.length === 1 ? "passage" : "passages"} found for ${state.query}`}
          {state.status === "error" && state.message}
        </p>

        {state.status === "loading" && <ResultsSkeleton />}

        {state.status === "error" && (
          <div className="mt-5 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
            <p>{state.message}</p>
            {state.query.length >= 2 && (
              <button type="button" onClick={() => search(state.query)} className="mt-1 font-semibold underline underline-offset-2">
                Try again
              </button>
            )}
          </div>
        )}

        {state.status === "done" && state.hits.length === 0 && <NoResults query={state.query} onPick={search} />}

        {state.status === "done" && state.hits.length > 0 && (
          <div className="mt-5">
            <p className="text-sm text-[#4A5670]">
              {state.hits.length} {state.hits.length === 1 ? "passage" : "passages"} for{" "}
              <span className="font-semibold text-[#0B1B3F]">&ldquo;{state.query}&rdquo;</span>
            </p>
            <ol className="mt-3 space-y-3">
              {state.hits.map((hit, i) => (
                <li key={`${hit.documentId}-${i}`}>
                  <HitCard hit={hit} query={state.query} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Panel>
  );
}

function HitCard({ hit, query }: { hit: Hit; query: string }) {
  const [open, setOpen] = useState(false);
  const long = hit.text.length > 420;
  const where = [hit.page != null ? `Page ${hit.page}` : null, hit.section].filter(Boolean).join(" · ");
  const link = /^https?:\/\//i.test(hit.source) ? hit.source : null;

  return (
    <article className="rounded-xl bg-white p-4 ring-1 ring-[#DCE5F5]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F7FF] text-[#155DFC]" aria-hidden="true">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-sm font-semibold text-[#0B1B3F]">
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#155DFC] hover:underline">
                  {hit.title}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                hit.title
              )}
            </h3>
            {where && <p className="mt-0.5 text-xs text-[#7B869C]">{where}</p>}
          </div>
        </div>
      </div>

      <blockquote className={cn("mt-3 whitespace-pre-line border-l-2 border-[#B9CCFB] pl-3 text-sm leading-relaxed text-[#0B1B3F]", !open && long && "line-clamp-5")}>
        <Highlighted text={hit.text} query={query} />
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2 rounded text-sm font-semibold text-[#155DFC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
        >
          {open ? "Show less" : "Show the full passage"}
        </button>
      )}
    </article>
  );
}

/** Marks the words of the question inside the passage. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const words = Array.from(new Set(query.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []));
  if (words.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "giu");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-[#FFF3C4] px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

function NoResults({ query, onPick }: { query: string; onPick: (q: string) => void }) {
  const others = SUGGESTIONS.filter((s) => s.toLowerCase() !== query.toLowerCase()).slice(0, 3);
  return (
    <div className="mt-5 rounded-xl bg-[#F8FAFF] px-4 py-6 text-center ring-1 ring-[#EEF2FA]">
      <SearchX className="mx-auto h-6 w-6 text-[#7B869C]" aria-hidden="true" />
      <p className="mt-2 font-medium text-[#0B1B3F]">Nothing in your documents answers &ldquo;{query}&rdquo;</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-[#4A5670]">
        Try fewer or different words. If nothing ever comes up, your company may not have added documents yet: ask your supervisor.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {others.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="min-h-9 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#2F4A85] ring-1 ring-[#DCE5F5] hover:text-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-5 space-y-3 motion-safe:animate-pulse" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl p-4 ring-1 ring-[#EEF2FA]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#EEF2FA]" />
            <div className="h-4 w-40 rounded bg-[#EEF2FA]" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3.5 w-full rounded bg-[#F3F6FB]" />
            <div className="h-3.5 w-11/12 rounded bg-[#F3F6FB]" />
            <div className="h-3.5 w-2/3 rounded bg-[#F3F6FB]" />
          </div>
        </div>
      ))}
    </div>
  );
}
