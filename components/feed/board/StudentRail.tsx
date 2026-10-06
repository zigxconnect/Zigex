import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { landingButton } from "@/components/sections/landing/landing-ui";

export type ApplicationsSummary = {
  total: number;
  inReview: number;
  accepted: number;
  notSelected: number;
  latest: { title: string; status: "pending" | "accepted" | "rejected"; href: string | null } | null;
};

export type ProfileStrength = {
  percent: number;
  steps: { label: string; done: boolean }[];
};

type Workspace = { id: string; title?: string; company_name?: string; logo_url?: string; type?: string };

const STATUS_TEXT = { pending: "In review", accepted: "Accepted", rejected: "Not selected" } as const;
const STATUS_STYLE = {
  pending: "bg-[#FFF7E6] text-[#B54708]",
  accepted: "bg-[#ECFDF3] text-[#067647]",
  rejected: "bg-[#F2F4F7] text-[#4A5670]",
} as const;

const card = "rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]";
const cardTitle = "font-heading text-base font-semibold text-[#0B1B3F]";

/**
 * Signed-in right rail on /feed: where your applications stand, how ready
 * your profile is, and your workspaces once a company accepts you.
 */
export function StudentRail({
  applications,
  profile,
  workspaces,
}: {
  applications: ApplicationsSummary | null;
  profile: ProfileStrength | null;
  workspaces: Workspace[];
}) {
  return (
    <div className="space-y-4">
      {applications && <ApplicationsCard summary={applications} />}
      {profile && profile.percent < 100 && <ProfileCard strength={profile} />}
      {workspaces.length > 0 && <WorkspacesCard workspaces={workspaces} />}
    </div>
  );
}

function ApplicationsCard({ summary }: { summary: ApplicationsSummary }) {
  const stats = [
    { label: "In review", value: summary.inReview },
    { label: "Accepted", value: summary.accepted },
    { label: "Not selected", value: summary.notSelected },
  ];
  return (
    <section aria-labelledby="apps-title" className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="apps-title" className={cardTitle}>
          Your applications
        </h2>
        {summary.total > 0 && (
          <Link href="/dashboard/applied-internships" className="text-sm font-semibold text-[#155DFC] hover:underline">
            View all
          </Link>
        )}
      </div>

      {summary.total === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-[#4A5670]">
          You haven&apos;t applied to anything yet. When you do, you&apos;ll follow each application here.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-[#F8FAFF] px-2 py-3 text-center ring-1 ring-[#EEF2FA]">
                <dd className="font-heading text-xl font-semibold tabular-nums text-[#0B1B3F]">{s.value}</dd>
                <dt className="mt-0.5 text-xs text-[#4A5670]">{s.label}</dt>
              </div>
            ))}
          </dl>
          {summary.latest && (
            <div className="mt-4 border-t border-[#EEF2FA] pt-4">
              <p className="text-xs text-[#7B869C]">Latest</p>
              <div className="mt-1 flex items-start justify-between gap-3">
                {summary.latest.href ? (
                  <Link href={summary.latest.href} className="line-clamp-2 text-sm font-semibold text-[#0B1B3F] hover:text-[#155DFC]">
                    {summary.latest.title}
                  </Link>
                ) : (
                  <p className="line-clamp-2 text-sm font-semibold text-[#0B1B3F]">{summary.latest.title}</p>
                )}
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[summary.latest.status]}`}>
                  {STATUS_TEXT[summary.latest.status]}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ProfileCard({ strength }: { strength: ProfileStrength }) {
  const next = strength.steps.find((s) => !s.done);
  return (
    <section aria-labelledby="profile-title" className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="profile-title" className={cardTitle}>
          Profile strength
        </h2>
        <span className="text-sm font-semibold tabular-nums text-[#155DFC]">{strength.percent}%</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[#E3E9F5]"
        role="progressbar"
        aria-valuenow={strength.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby="profile-title"
      >
        <div className="h-full rounded-full bg-[#155DFC]" style={{ width: `${strength.percent}%` }} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#4A5670]">Companies read your profile when you apply.</p>
      <ul className="mt-3 space-y-1.5">
        {strength.steps.map((s) => (
          <li key={s.label} className={`flex items-center gap-2 text-sm ${s.done ? "text-[#7B869C] line-through decoration-[#B9C8E6]" : "text-[#0B1B3F]"}`}>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${s.done ? "bg-[#155DFC] text-white" : "ring-1 ring-[#B9C8E6]"}`}
              aria-hidden="true"
            >
              {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            {s.label}
            <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
          </li>
        ))}
      </ul>
      <Link href="/dashboard/edit-profile" className={`${landingButton("primary", "md")} mt-4 w-full`}>
        {next ? "Complete your profile" : "Edit profile"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function WorkspacesCard({ workspaces }: { workspaces: Workspace[] }) {
  return (
    <section aria-labelledby="ws-title" className={card}>
      <h2 id="ws-title" className={cardTitle}>
        Your workspaces
      </h2>
      <ul className="mt-3 space-y-1">
        {workspaces.slice(0, 5).map((ws) => (
          <li key={ws.id}>
            <Link
              href={`/intern/workspace/${ws.type}/${encodeURIComponent(ws.title || "workspace")}?appId=${ws.id}`}
              className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              {ws.logo_url ? (
                <img src={ws.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-[#DCE5F5]" />
              ) : (
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F7FF] font-semibold text-[#155DFC]">
                  {(ws.company_name ?? ws.title ?? "W").charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#0B1B3F]">{ws.title}</span>
                {ws.company_name && <span className="block truncate text-sm text-[#4A5670]">{ws.company_name}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
