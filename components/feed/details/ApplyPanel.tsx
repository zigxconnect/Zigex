import Link from "next/link";
import { CalendarClock, CircleDollarSign, Clock, MapPin, Monitor, Users } from "lucide-react";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { ApplyActions } from "@/components/apply/ApplyActions";
import type { ApplyPrefill } from "@/components/apply/ApplyDialog";
import type { BoardItem } from "@/components/feed/board/board-types";

type ApplicationStatus = { hasApplied: boolean; status: string | null; paymentCompleted?: boolean; applicationId?: string };

const ACTION = { internships: "Apply", programs: "Register", events: "RSVP" } as const;

/** "9 weeks", "2 months" from the start and end dates. */
function length(item: BoardItem) {
  if (!item.startsAt || !item.endsAt) return null;
  const days = Math.round((new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / 86_400_000);
  if (days <= 0) return null;
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  const weeks = Math.round(days / 7);
  return weeks < 9 ? `${weeks} weeks` : `${Math.round(days / 30)} months`;
}

const fmt = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

/**
 * The one place on the opportunity page that says whether you can take part
 * and lets you do it: status, the action, and the facts that decide it.
 * Signed-out visitors are offered an account first (most are new), with
 * sign-in second; both bring them back here afterwards.
 */
export function ApplyPanel({
  item,
  isOpen,
  closedReason,
  isAuthenticated,
  applicationStatus,
  opportunityData,
  prefill = {},
  browse = { href: "/feed", label: "Browse open opportunities" },
}: {
  item: BoardItem;
  isOpen: boolean;
  closedReason?: string;
  isAuthenticated: boolean;
  applicationStatus: ApplicationStatus;
  opportunityData: Record<string, unknown>;
  /** Profile answers that prefill the application form. */
  prefill?: ApplyPrefill;
  /** Where "find something else" leads when this one is closed. */
  browse?: { href: string; label: string };
}) {
  const action = ACTION[item.kind];
  const next = encodeURIComponent(`/feed/${item.id}`);
  const days = item.closesAt ? Math.ceil((new Date(item.closesAt).getTime() - Date.now()) / 86_400_000) : null;

  const facts = [
    item.closesAt && { icon: CalendarClock, label: "Deadline", value: fmt(item.closesAt) },
    item.startsAt && { icon: Clock, label: item.kind === "events" ? "Date" : "Starts", value: fmt(item.startsAt) },
    item.endsAt && item.kind !== "events" && { icon: Clock, label: "Ends", value: `${fmt(item.endsAt)}${length(item) ? ` (${length(item)})` : ""}` },
    item.location && { icon: MapPin, label: "Location", value: item.location },
    item.workMode && { icon: Monitor, label: "Work mode", value: item.workMode[0].toUpperCase() + item.workMode.slice(1) },
    {
      icon: CircleDollarSign,
      label: "Cost",
      value: item.hasFee ? (item.priceXaf ? `${item.priceXaf.toLocaleString("en-US")} XAF` : "Fee applies") : "Free",
    },
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
      {/* Status line */}
      {isOpen ? (
        <p className={`text-sm font-semibold ${days !== null && days <= 7 ? "text-[#C2410C]" : "text-[#067647]"}`}>
          {days === null ? "Open now" : days <= 0 ? "Closes today" : `Open, closes in ${days} day${days === 1 ? "" : "s"}`}
        </p>
      ) : (
        <p className="text-sm font-semibold text-[#4A5670]">
          {item.closesAt ? `${item.kind === "programs" ? "Registration" : "Applications"} closed on ${fmt(item.closesAt)}` : closedReason ?? "This opportunity has ended"}
        </p>
      )}

      {/* Action */}
      <div id="getStarted" className="mt-4 scroll-mt-28">
        {isAuthenticated && (isOpen || applicationStatus.hasApplied) ? (
          <ApplyActions
            kind={item.kind.slice(0, -1) as "internship" | "program" | "event"}
            id={item.id}
            title={item.title}
            company={item.companyName}
            image={item.image}
            closesAt={item.closesAt}
            hasFee={item.hasFee}
            priceXaf={item.priceXaf}
            prefill={prefill}
            initialStatus={applicationStatus}
            isOpen={isOpen}
            mobileBar
          />
        ) : isOpen ? (
          <div className="grid gap-2">
            <Link href={`/sign-up?next=${next}`} className={`${landingButton("primary", "lg")} w-full`}>
              Create an account to {action.toLowerCase()}
            </Link>
            <Link href={`/sign-in?next=${next}`} className={`${landingButton("secondary", "md")} w-full`}>
              I have an account
            </Link>
            <p className="mt-1 text-center text-[13px] text-[#7B869C]">Free for students. You&apos;ll come back to this page.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="rounded-xl bg-[#F3F7FF] px-4 py-3 text-sm text-[#4A5670]">
              {item.kind === "programs"
                ? "Registration for this program has closed. Companies open new cohorts through the year."
                : `You can't ${action.toLowerCase()} any more. Companies post new opportunities regularly.`}
            </p>
            <Link href={browse.href} className={`${landingButton("secondary", "md")} w-full`}>
              {browse.label}
            </Link>
          </div>
        )}
      </div>

      {/* Facts */}
      <dl className="mt-6 space-y-3 border-t border-[#EEF2FA] pt-5">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 text-sm">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" />
            <dt className="w-24 shrink-0 text-[#4A5670]">{label}</dt>
            <dd className="min-w-0 font-medium text-[#0B1B3F]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
