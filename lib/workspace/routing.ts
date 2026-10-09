import { placementPhase, type PlacementPhase } from "@/components/workspace/workspace-model";

type Placement = Record<string, any>;

export const placementType = (app: Placement): "internship" | "program" | "event" => {
  const t = String(app.application_type ?? "internship").toLowerCase();
  return t === "program" || t === "event" ? t : "internship";
};

export const placementOpportunity = (app: Placement) =>
  (placementType(app) === "program" ? app.programs : placementType(app) === "event" ? app.event : app.internships) ?? null;

export const phaseOf = (app: Placement): PlacementPhase => placementPhase(placementOpportunity(app));

/** /student/workspace/internship/it-infrastructure-intern?appId=… */
export function workspaceHref(app: Placement, base = "/student/workspace") {
  const slug =
    String(placementOpportunity(app)?.title || "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";
  return `${base}/${placementType(app)}/${slug}?appId=${encodeURIComponent(app.id)}`;
}

/**
 * Which workspace "My workspace" opens: the one asked for; else the only one
 * running now; else, with nothing running, the only one starting soon or the
 * only one there is. Null means the student should choose (several at once).
 */
export function pickWorkspace(placements: Placement[], appId?: string): Placement | null {
  if (appId) return placements.find((p) => p.id === appId) ?? null;
  if (placements.length === 1) return placements[0];
  const current = placements.filter((p) => phaseOf(p) === "current");
  if (current.length === 1) return current[0];
  if (current.length > 1) return null;
  const upcoming = placements.filter((p) => phaseOf(p) === "upcoming");
  if (upcoming.length === 1) return upcoming[0];
  return null;
}
