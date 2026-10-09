"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, Search } from "lucide-react";

type Placement = Record<string, any>;

const TYPE_LABEL: Record<string, string> = { internship: "Internship", program: "Program", event: "Event" };

const typeOf = (app: Placement) => {
  const t = String(app.application_type ?? "internship").toLowerCase();
  return t === "program" || t === "event" ? t : "internship";
};
const opportunityOf = (app: Placement) => (typeOf(app) === "program" ? app.programs : typeOf(app) === "event" ? app.event : app.internships) ?? {};
const companyOf = (app: Placement) => opportunityOf(app).company_profiles ?? opportunityOf(app).company ?? app.company_profiles ?? {};
const slugOf = (title?: string) =>
  (title || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const shortDate = (v?: string) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function Mark({ name, logo }: { name?: string; logo?: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white font-heading text-lg font-bold text-[#155DFC] ring-1 ring-[#DCE5F5]">
      {logo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{(name ?? "?").trim().charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

/** For students with more than one accepted placement: pick which workspace to open. */
export function InternWorkspaceSelection({ internships }: { internships: Placement[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      internships.filter((app) => {
        if (!q) return true;
        return `${opportunityOf(app).title ?? ""} ${companyOf(app).company_name ?? ""} ${TYPE_LABEL[typeOf(app)]}`.toLowerCase().includes(q);
      }),
    [internships, q]
  );

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header>
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Your workspaces</h1>
        <p className="mt-1 text-base text-[#4A5670]">
          You have {internships.length} active placements. Open one to check in, see tasks and send reports.
        </p>
      </header>

      {internships.length > 5 && (
        <label className="relative mt-6 block">
          <span className="sr-only">Search placements</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or company"
            className="h-11 w-full rounded-xl bg-white pl-9 pr-3 text-[15px] text-[#0B1B3F] ring-1 ring-[#DCE5F5] placeholder:text-[#9AA6BD] focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
          />
        </label>
      )}

      {shown.length ? (
        <ul className="mt-6 divide-y divide-[#EEF2FA] overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
          {shown.map((app) => {
            const opportunity = opportunityOf(app);
            const company = companyOf(app);
            const type = typeOf(app);
            const dates = opportunity.start_date ? `${shortDate(opportunity.start_date)}${opportunity.end_date ? ` to ${shortDate(opportunity.end_date)}` : ""}` : "";
            return (
              <li key={app.id}>
                <Link
                  href={`/student/workspace/${type}/${slugOf(opportunity.title)}?appId=${encodeURIComponent(app.id)}`}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none sm:px-6"
                >
                  <Mark name={company.company_name} logo={company.logo_url} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-[#4A5670]">
                      {TYPE_LABEL[type]}
                      {company.company_name ? ` at ${company.company_name}` : ""}
                    </span>
                    <span className="block truncate font-heading text-[17px] font-semibold text-[#0B1B3F] group-hover:text-[#155DFC]">
                      {opportunity.title || "Placement"}
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-[#4A5670]">
                      {opportunity.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#7B869C]" aria-hidden="true" />
                          {opportunity.location}
                        </span>
                      )}
                      {dates && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-[#7B869C]" aria-hidden="true" />
                          {dates}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#9AA6BD] group-hover:text-[#155DFC]" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl bg-white px-6 py-8 text-center ring-1 ring-[#DCE5F5]">
          <p className="font-medium text-[#0B1B3F]">No placements match &ldquo;{query}&rdquo;</p>
          <button type="button" onClick={() => setQuery("")} className="mt-2 text-sm font-semibold text-[#155DFC] hover:underline">
            Show all placements
          </button>
        </div>
      )}
    </div>
  );
}
