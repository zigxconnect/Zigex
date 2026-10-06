"use server";

import { getSession } from "@/lib/api/auth";
import { getSummary } from "@/lib/api/services/gamification";

export interface ConnectionInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  username?: string;
  role?: string;
  type: "student" | "supervisor";
}

export interface BadgeInfo {
  badge: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  unlocked: boolean;
  earnedAt?: string;
  icon: string;
}

const BADGE_TEMPLATES: Record<string, Omit<BadgeInfo, "unlocked">> = {
  first_spark: {
    badge: "first_spark",
    title: "The First Spark",
    description: "Awarded when the very first task log is submitted.",
    tier: "bronze",
    icon: "/badges/bronze.png"
  },
  clockwork: {
    badge: "clockwork",
    title: "Clockwork",
    description: "Marked attendance for 5 days.",
    tier: "bronze",
    icon: "/badges/bronze.png"
  },
  networker: {
    badge: "networker",
    title: "Networker",
    description: "Automatically earned when connecting with 5 fellow builders.",
    tier: "bronze",
    icon: "/badges/bronze.png"
  },
  flawless_execution: {
    badge: "flawless_execution",
    title: "Flawless Execution",
    description: "3 tasks reviewed and accepted perfectly by a supervisor.",
    tier: "silver",
    icon: "/badges/silver.png"
  },
  rising_star: {
    badge: "rising_star",
    title: "Rising Star",
    description: "Received a 4-star or higher weekly rating from a supervisor.",
    tier: "silver",
    icon: "/badges/silver.png"
  },
  the_grinder: {
    badge: "the_grinder",
    title: "The Grinder",
    description: "Submitting tasks or logs for 14 days.",
    tier: "silver",
    icon: "/badges/silver.png"
  },
  excellence_vanguard: {
    badge: "excellence_vanguard",
    title: "Excellence Vanguard",
    description: "Received a flawless 5-star review from a supervisor.",
    tier: "gold",
    icon: "/badges/gold.png"
  },
  unbroken_focus: {
    badge: "unbroken_focus",
    title: "Unbroken Focus",
    description: "4 or more reviews with high ratings from supervisors.",
    tier: "gold",
    icon: "/badges/gold.png"
  },
  alumni_shield: {
    badge: "alumni_shield",
    title: "Alumni Shield",
    description: "Successfully completed an internship program track.",
    tier: "gold",
    icon: "/badges/gold.png"
  },
  program_valedictorian: {
    badge: "program_valedictorian",
    title: "Program Valedictorian",
    description: "Ranked in the top cohort based on logs or ratings.",
    tier: "diamond",
    icon: "/badges/diamond.png"
  }
};

/**
 * Connections (peers + supervisors) for a profile.
 * TODO(backend): no endpoint yet (see "Missing endpoints: Follow / connections").
 */
export async function getProfileConnections(_profileId: string, _userId: string) {
  return { count: 0, peers: [] as ConnectionInfo[], supervisors: [] as ConnectionInfo[] };
}

/**
 * Follow / unfollow another student.
 * TODO(backend): no endpoint yet (see "Missing endpoints: Follow / connections").
 */
export async function toggleFollow(_targetProfileId: string) {
  return { success: false, error: "Following is temporarily unavailable." };
}

const allLocked = (): BadgeInfo[] =>
  Object.values(BADGE_TEMPLATES).map((template) => ({ ...template, unlocked: false }));

/**
 * The full badge list (unlocked and locked) for a student.
 * The backend awards badges; we only read the signed-in student's own badges
 * from GET /gamification/summary.
 * TODO(backend): other students' badges need a public endpoint — they show as locked.
 */
export async function getEarnedBadges(_profileId: string, userId: string): Promise<BadgeInfo[]> {
  try {
    const session = await getSession();
    if (!session || session.userId !== userId) return allLocked();

    const { badges = [] } = await getSummary();
    const earnedAt = new Map<string, string | undefined>();
    for (const row of badges) {
      const key = row.badge_enum ?? row.badge;
      if (key) earnedAt.set(key, row.earned_at);
    }

    return Object.entries(BADGE_TEMPLATES).map(([key, template]) => ({
      ...template,
      unlocked: earnedAt.has(key),
      earnedAt: earnedAt.get(key),
    }));
  } catch (error) {
    console.error("Error loading badges:", error);
    return allLocked();
  }
}
