import "server-only";
import { serverApi } from "../server-client";
import { getFeedItem, type FeedKind } from "./feed";

/**
 * A student's active placements (accepted / RSVP-confirmed applications),
 * shaped like the old Supabase joins the workspace UI was built on:
 * `internships` | `programs` | `event` hold the opportunity, each with its
 * `company_profiles`.
 *
 * TODO(backend): GET /applications rows are undocumented. We use any embedded
 * opportunity object, else fetch it from /feed/{kind}/{id}.
 */

export type ApplicationType = "internship" | "program" | "event";
export type Placement = {
  id: string;
  application_type: ApplicationType;
  status: string;
  internship_id?: string | null;
  program_id?: string | null;
  event_id?: string | null;
  created_at?: string;
  internships?: any;
  programs?: any;
  event?: any;
  [column: string]: any;
};

const ACTIVE_STATUSES = new Set(["accepted", "rsvp_confirmed"]);

const TARGET: Record<ApplicationType, { idKey: "internship_id" | "program_id" | "event_id"; joinKey: "internships" | "programs" | "event"; feed: FeedKind }> = {
  internship: { idKey: "internship_id", joinKey: "internships", feed: "internships" },
  program: { idKey: "program_id", joinKey: "programs", feed: "programs" },
  event: { idKey: "event_id", joinKey: "event", feed: "events" },
};

export function placementType(app: Partial<Placement>): ApplicationType {
  const type = String(app.application_type ?? "").toLowerCase();
  if (type === "program" || type === "event") return type;
  if (!type && app.program_id) return "program";
  if (!type && app.event_id) return "event";
  return "internship";
}

/** The internship/program/event id a placement points at. */
export const placementTargetId = (app: Placement) => app[TARGET[app.application_type].idKey] ?? null;

/** The joined opportunity (internship, program or event) of a placement. */
export const placementOpportunity = (app: Placement) => app[TARGET[app.application_type].joinKey] ?? null;

async function withOpportunity(app: Placement): Promise<Placement> {
  const { joinKey, feed } = TARGET[app.application_type];
  const embedded = app[joinKey] ?? app.internship ?? app.program ?? app.opportunity;
  const targetId = placementTargetId(app);

  let opportunity = embedded;
  if (!opportunity && targetId) {
    opportunity = await getFeedItem(feed, targetId).catch(() => null);
  }
  if (opportunity) {
    const company = opportunity.company_profiles ?? opportunity.company ?? null;
    opportunity = { ...opportunity, company_profiles: company, company };
  }
  return { ...app, [joinKey]: opportunity };
}

/** Accepted / RSVP-confirmed applications, newest first, with their opportunity attached. */
export async function listPlacements(): Promise<Placement[]> {
  const res = await serverApi.get<Placement[]>("/applications");
  const active = (res.data ?? [])
    .filter((app) => ACTIVE_STATUSES.has(String(app.status).toLowerCase()))
    .map((app) => ({ ...app, application_type: placementType(app) }))
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
  return Promise.all(active.map(withOpportunity));
}
