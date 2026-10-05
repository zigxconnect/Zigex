import "server-only";
import { serverApi } from "../server-client";

/**
 * Gamification for the signed-in student (/gamification/*). The backend
 * awards badges itself; the frontend only reads them.
 *
 * Uses /gamification/summary, the only documented response ({ totalPoints, badgeCount, badges }).
 * TODO(backend): badge rows are undocumented; assumed to keep the earned_badges columns (badge_enum, earned_at).
 */

export type EarnedBadgeRow = { badge_enum?: string; badge?: string; earned_at?: string; [column: string]: any };

export async function getSummary() {
  const res = await serverApi.get<{ totalPoints: number; badgeCount: number; badges: EarnedBadgeRow[] }>(
    "/gamification/summary"
  );
  return res.data;
}
