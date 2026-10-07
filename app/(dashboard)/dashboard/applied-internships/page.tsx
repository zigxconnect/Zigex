"use client";

/**
 * My applications — app/(dashboard)/dashboard/applied-internships/page.tsx
 *
 * Everything the student has applied to, in one list: filter by status
 * (the counts are the filters) and type, see what was submitted, open the
 * workspace or program updates once accepted, withdraw while it's in review.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Loader2, Search } from "lucide-react";
import { listMyApplications, withdrawMyApplication } from "@/lib/api/applications-client";
import { ApiClientError } from "@/lib/api/errors";
import { applicationKind, targetId, type ApplicationRow } from "@/lib/api/applications-shape";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { RowBone } from "@/components/skeletons/Skeleton";

type Kind = "internship" | "program" | "event";
type StatusKey = "review" | "accepted" | "rejected" | "withdrawn";

const KIND_LABEL: Record<Kind, string> = { internship: "Internship", program: "Program", event: "Event" };
const IMAGE_FIELD: Record<Kind, string> = { internship: "cover_image_url", program: "program_picture_url", event: "event_picture_url" };

/** Backend statuses in the words students use. */
function statusOf(raw: string, kind: Kind): { key: StatusKey; label: string; note: string; style: string } {
  switch (raw) {
    case "accepted":
      return { key: "accepted", label: "Accepted", note: "Congratulations, you've been accepted.", style: "bg-[#ECFDF3] text-[#067647]" };
    case "rsvp_confirmed":
      return { key: "accepted", label: "Going", note: "Your place at this event is confirmed.", style: "bg-[#ECFDF3] text-[#067647]" };
    case "rejected":
      return { key: "rejected", label: "Not selected", note: "The company chose other applicants this time.", style: "bg-[#F2F4F7] text-[#4A5670]" };
    case "withdrawn":
      return { key: "withdrawn", label: "Withdrawn", note: "You withdrew this application.", style: "bg-white text-[#7B869C] ring-1 ring-[#DCE5F5]" };
    case "reviewed":
      return { key: "review", label: "Reviewed", note: "The company has looked at your application.", style: "bg-[#EEF3FF] text-[#155DFC]" };
    default:
      return {
        key: "review",
        label: "In review",
        note: kind === "event" ? "Waiting for the organiser to confirm your place." : "Waiting for the company to decide.",
        style: "bg-[#FFF7E6] text-[#B54708]",
      };
  }
}

const FILTERS: { key: StatusKey | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "review", label: "In review" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Not selected" },
  { key: "withdrawn", label: "Withdrawn" },
];

const shortDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

type Item = {
  id: string;
  kind: Kind;
  postingId: string | null;
  title: string;
  company: string;
  logo: string | null;
  image: string | null;
  appliedAt: string;
  updatedAt?: string;
  rawStatus: string;
  details: { label: string; value: string }[];
  files: { label: string; url: string }[];
};

function toItem(row: ApplicationRow): Item | null {
  const kind = applicationKind(row) as Kind | null;
  if (!kind) return null;
  const posting = row[kind] ?? {};
  const company = posting.company ?? posting.company_profiles ?? {};
  const details = [
    row.duration_months && { label: "Duration", value: `${row.duration_months} months` },
    row.department && { label: "Department", value: row.department },
    row.work_mode && { label: "Work mode", value: row.work_mode },
    row.location && { label: "Location", value: row.location },
    row.level && { label: "Level", value: row.level },
    row.expectations && { label: "What you hope to get", value: row.expectations },
    row.comments && { label: "Comments", value: row.comments },
  ].filter(Boolean) as { label: string; value: string }[];
  const files = [
    row.cover_letter_url && { label: "Cover letter", url: row.cover_letter_url },
    row.support_letter_url && { label: "Support letter", url: row.support_letter_url },
    row.resume_url && { label: "CV", url: row.resume_url },
  ].filter(Boolean) as { label: string; url: string }[];
  return {
    id: row.id,
    kind,
    postingId: targetId(row),
    title: posting.title ?? `${KIND_LABEL[kind]} application`,
    company: company.company_name ?? "",
    logo: company.logo_url ?? null,
    image: posting[IMAGE_FIELD[kind]] ?? null,
    appliedAt: row.created_at ?? "",
    updatedAt: row.updated_at,
    rawStatus: row.status ?? "pending",
    details,
    files,
  };
}

export default function MyApplicationsPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusKey | "all">("all");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setError(null);
    try {
      const rows = await listMyApplications();
      setItems(
        rows
          .map(toItem)
          .filter((i): i is Item => Boolean(i))
          .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      );
    } catch {
      setError("Your applications couldn't load. Check your connection and try again.");
      setItems([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<StatusKey | "all", number> = { all: 0, review: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    (items ?? []).forEach((i) => {
      c.all++;
      c[statusOf(i.rawStatus, i.kind).key]++;
    });
    return c;
  }, [items]);
  const kinds = useMemo(() => [...new Set((items ?? []).map((i) => i.kind))], [items]);

  const shown = (items ?? []).filter(
    (i) =>
      (status === "all" || statusOf(i.rawStatus, i.kind).key === status) &&
      (kind === "all" || i.kind === kind) &&
      (!query.trim() || `${i.title} ${i.company}`.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const markWithdrawn = (id: string) => setItems((prev) => (prev ?? []).map((i) => (i.id === id ? { ...i, rawStatus: "withdrawn" } : i)));

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">My applications</h1>
        <p className="mt-1 text-base text-[#4A5670]">Every internship, program and event you&apos;ve applied to, and where each one stands.</p>
      </header>

      {items === null ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading applications">
          {[0, 1, 2].map((i) => (
            <RowBone key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-[#DCE5F5]">
          <p className="text-base text-[#4A5670]">{error}</p>
          <button type="button" onClick={load} className={`${landingButton("secondary", "md")} mt-4`}>
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-[#DCE5F5]">
          <p className="font-heading text-lg font-semibold text-[#0B1B3F]">You haven&apos;t applied to anything yet.</p>
          <p className="mx-auto mt-1 max-w-md text-base text-[#4A5670]">
            When you apply to an internship, register for a program or RSVP to an event, you&apos;ll follow it here.
          </p>
          <Link href="/feed" className={`${landingButton("primary", "md")} mt-5`}>
            Browse opportunities
          </Link>
        </div>
      ) : (
        <>
          {/* Status counts double as filters */}
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {FILTERS.filter((f) => f.key === "all" || counts[f.key] > 0).map((f) => {
              const active = status === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(f.key)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                    active ? "bg-[#0B1B3F] text-white" : "bg-white text-[#4A5670] ring-1 ring-[#DCE5F5] hover:text-[#0B1B3F]"
                  }`}
                >
                  {f.label}
                  <span className={`tabular-nums ${active ? "text-white/70" : "text-[#7B869C]"}`}>{counts[f.key]}</span>
                </button>
              );
            })}
          </div>

          {(kinds.length > 1 || items.length > 8) && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              {kinds.length > 1 && (
                <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-[#DCE5F5]" role="group" aria-label="Filter by type">
                  {(["all", ...kinds] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={kind === k}
                      onClick={() => setKind(k)}
                      className={`h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
                        kind === k ? "bg-[#EEF3FF] text-[#155DFC]" : "text-[#4A5670] hover:text-[#0B1B3F]"
                      }`}
                    >
                      {k === "all" ? "All types" : `${KIND_LABEL[k]}s`}
                    </button>
                  ))}
                </div>
              )}
              {items.length > 8 && (
                <div className="relative w-full sm:max-w-xs">
                  <label htmlFor="app-search" className="sr-only">
                    Search your applications
                  </label>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
                  <input
                    id="app-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Title or company"
                    className="h-11 w-full rounded-xl border border-[#DCE5F5] bg-white pl-10 pr-3 text-base text-[#0B1B3F] placeholder:text-[#7B869C] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15"
                  />
                </div>
              )}
            </div>
          )}

          <ul className="mt-5 space-y-3">
            {shown.map((item) => (
              <li key={item.id}>
                <ApplicationRowView item={item} onWithdrawn={() => markWithdrawn(item.id)} />
              </li>
            ))}
          </ul>
          {shown.length === 0 && (
            <p className="mt-5 rounded-2xl bg-white px-6 py-8 text-center text-base text-[#4A5670] ring-1 ring-[#DCE5F5]">
              No applications match these filters.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationRowView({ item, onWithdrawn }: { item: Item; onWithdrawn: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const st = statusOf(item.rawStatus, item.kind);
  const canWithdraw = item.rawStatus === "pending" || item.rawStatus === "reviewed";
  const postingHref = item.postingId ? (item.kind === "program" ? `/programs/${item.postingId}` : `/feed/${item.postingId}`) : null;

  const next =
    st.key === "accepted" && item.kind === "internship"
      ? { href: "/student/workspace", label: "Open workspace" }
      : st.key === "accepted" && item.kind === "program" && item.postingId
        ? { href: `/programs/${item.postingId}/updates`, label: "Program updates" }
        : null;

  const withdraw = async () => {
    setBusy(true);
    setError(null);
    try {
      await withdrawMyApplication(item.id);
      onWithdrawn();
      setConfirming(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "It couldn't be withdrawn. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`rounded-2xl bg-white ring-1 ring-[#DCE5F5] ${st.key === "withdrawn" ? "opacity-75" : ""}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA] sm:h-[72px] sm:w-24">
            {item.image ? (
              <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : item.logo ? (
              <img src={item.logo} alt="" className="h-full w-full object-contain p-3" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#7B869C]">
              {KIND_LABEL[item.kind]}
              {item.company && ` at ${item.company}`}
            </p>
            {postingHref ? (
              <Link href={postingHref} className="mt-0.5 line-clamp-2 font-heading text-base font-semibold leading-snug text-[#0B1B3F] hover:text-[#155DFC]">
                {item.title}
              </Link>
            ) : (
              <p className="mt-0.5 line-clamp-2 font-heading text-base font-semibold leading-snug text-[#0B1B3F]">{item.title}</p>
            )}
            <p className="mt-1 text-sm text-[#4A5670]">Applied {shortDate(item.appliedAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.style}`}>{st.label}</span>
          <div className="flex items-center gap-2">
            {next && (
              <Link href={next.href} className={`${landingButton("primary", "md")} h-10 px-4 text-sm`}>
                {next.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              Details
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#EEF2FA] px-4 py-4 sm:px-5">
          <p className="text-sm text-[#0B1B3F]">{st.note}</p>
          {item.updatedAt && item.updatedAt !== item.appliedAt && (
            <p className="mt-0.5 text-sm text-[#7B869C]">Last update {shortDate(item.updatedAt)}</p>
          )}

          {item.details.length > 0 && (
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {item.details.map((d) => (
                <div key={d.label}>
                  <dt className="text-sm text-[#7B869C]">{d.label}</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-sm text-[#0B1B3F]">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {item.files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.files.map((f) => (
                <a
                  key={f.label}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#155DFC] ring-1 ring-[#DCE5F5] hover:bg-[#F3F7FF]"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {f.label}
                </a>
              ))}
            </div>
          )}

          {canWithdraw && (
            <div className="mt-5 border-t border-[#EEF2FA] pt-4">
              {confirming ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-2 text-sm text-[#0B1B3F]">Withdraw this application? The company will no longer consider it.</p>
                  <button
                    type="button"
                    onClick={withdraw}
                    disabled={busy}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#B42318] px-4 text-sm font-semibold text-white hover:bg-[#912018] disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Withdraw
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="h-10 rounded-xl px-3 text-sm font-semibold text-[#4A5670] hover:bg-[#F3F7FF]">
                    Keep it
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className="text-sm font-semibold text-[#B42318] hover:underline">
                  Withdraw application
                </button>
              )}
              {error && <p className="mt-2 text-sm text-[#B42318]">{error}</p>}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
