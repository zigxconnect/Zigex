"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

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
 * Calculates connections count and profiles (peers and supervisors) dynamically based on
 * registered internship, program, events, and supervising supervisor records.
 */
export async function getProfileConnections(profileId: string, userId: string) {
  try {
    const supabase = supabaseAdmin;

    // 1. Get all accepted internships, programs, events registered by the student
    const [legacyAppsRes, modernAppsRes] = await Promise.all([
      supabase
        .from("Applications")
        .select("internship_id, department, program_id, event_id, supervisor_id")
        .eq("student_id", profileId)
        .in("status", ["accepted", "rsvp_confirmed"]),
      supabase
        .from("internship_applications")
        .select("internship_id, domain, supervisor_id")
        .or(`student_id.eq.${userId},student_id.eq.${profileId}`)
        .in("status", ["accepted", "rsvp_confirmed"])
    ]);

    const myInternships: { internshipId: string; domain: string }[] = [];
    const myPrograms = new Set<string>();
    const myEvents = new Set<string>();
    const supervisorIds = new Set<string>();

    legacyAppsRes.data?.forEach(app => {
      if (app.internship_id) {
        myInternships.push({
          internshipId: app.internship_id,
          domain: app.department || ""
        });
      }
      if (app.program_id) myPrograms.add(app.program_id);
      if (app.event_id) myEvents.add(app.event_id);
      if (app.supervisor_id) supervisorIds.add(app.supervisor_id);
    });

    modernAppsRes.data?.forEach(app => {
      if (app.internship_id) {
        myInternships.push({
          internshipId: app.internship_id,
          domain: app.domain || ""
        });
      }
      if (app.supervisor_id) supervisorIds.add(app.supervisor_id);
    });

    // 2. Fetch peer students who share any of these
    const peerStudentIds = new Set<string>();
    const peerQueries: Promise<any>[] = [];

    // For each internship cohort + domain
    myInternships.forEach(({ internshipId, domain }) => {
      if (domain) {
        peerQueries.push(
          supabase
            .from("Applications")
            .select("student_id")
            .eq("internship_id", internshipId)
            .eq("department", domain)
            .in("status", ["accepted", "rsvp_confirmed"]),
          supabase
            .from("internship_applications")
            .select("student_id")
            .eq("internship_id", internshipId)
            .eq("domain", domain)
            .in("status", ["accepted", "rsvp_confirmed"])
        );
      } else {
        peerQueries.push(
          supabase
            .from("Applications")
            .select("student_id")
            .eq("internship_id", internshipId)
            .in("status", ["accepted", "rsvp_confirmed"]),
          supabase
            .from("internship_applications")
            .select("student_id")
            .eq("internship_id", internshipId)
            .in("status", ["accepted", "rsvp_confirmed"])
        );
      }
    });

    // For shared programs
    if (myPrograms.size > 0) {
      peerQueries.push(
        supabase
          .from("Applications")
          .select("student_id")
          .in("program_id", Array.from(myPrograms))
          .in("status", ["accepted", "rsvp_confirmed"])
      );
    }

    // For shared events
    if (myEvents.size > 0) {
      peerQueries.push(
        supabase
          .from("Applications")
          .select("student_id")
          .in("event_id", Array.from(myEvents))
          .in("status", ["accepted", "rsvp_confirmed"])
      );
    }

    if (peerQueries.length > 0) {
      const peerRes = await Promise.all(peerQueries);
      peerRes.forEach(res => {
        res.data?.forEach((row: any) => {
          if (row.student_id) {
            peerStudentIds.add(row.student_id);
          }
        });
      });
    }

    // Remove current user's profileId and userId from peer list
    peerStudentIds.delete(profileId);
    peerStudentIds.delete(userId);

    // 3. Fetch details for peers
    let peersList: any[] = [];
    if (peerStudentIds.size > 0) {
      const peerIdArr = Array.from(peerStudentIds);
      const { data: profiles } = await supabase
        .from("student_profiles")
        .select("id, username, full_name, avatar_url")
        .or(`id.in.(${peerIdArr.join(",")}),user_id.in.(${peerIdArr.join(",")})`)
        .limit(150);
      
      peersList = profiles || [];
    }

    // 4. Fetch details for supervisors
    let supervisorsList: any[] = [];
    if (supervisorIds.size > 0) {
      const { data: supervisors } = await supabase
        .from("supervisor_profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", Array.from(supervisorIds));

      supervisorsList = supervisors || [];
    }

    const totalCount = peersList.length + supervisorsList.length;

    const peers: ConnectionInfo[] = peersList.map(p => ({
      id: p.id,
      name: p.full_name,
      avatarUrl: p.avatar_url,
      username: p.username,
      type: "student"
    }));

    const supervisors: ConnectionInfo[] = supervisorsList.map(s => ({
      id: s.id,
      name: s.full_name,
      avatarUrl: s.avatar_url,
      role: s.role || "Supervisor",
      type: "supervisor"
    }));

    return {
      count: totalCount,
      peers,
      supervisors
    };
  } catch (error) {
    console.error("Error in getProfileConnections:", error);
    return { count: 0, peers: [], supervisors: [] };
  }
}

/**
 * Evaluates and awards badges to a student dynamically based on their actual database activity,
 * writes them to earned_badges, and returns the full list of badges (unlocked & locked).
 */
export async function getEarnedBadges(profileId: string, userId: string): Promise<BadgeInfo[]> {
  try {
    const supabase = supabaseAdmin;

    // Fetch existing earned badges
    const { data: existingEarned } = await supabase
      .from("earned_badges")
      .select("badge_enum, earned_at")
      .eq("student_id", profileId);

    const earnedSet = new Map<string, string>();
    existingEarned?.forEach(b => earnedSet.set(b.badge_enum, b.earned_at));

    // Array of new badges we might unlock now
    const newlyUnlocked: string[] = [];

    // Let's run check rules for badges not already earned
    // 1. first_spark: First task submission or log
    if (!earnedSet.has("first_spark")) {
      const [{ count: logsCount }, { count: projCount }] = await Promise.all([
        supabase.from("intern_logs").select("id", { count: "exact", head: true }).eq("student_id", userId),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", userId)
      ]);
      if ((logsCount || 0) > 0 || (projCount || 0) > 0) {
        newlyUnlocked.push("first_spark");
      }
    }

    // 2. clockwork: Marked attendance for 5 days
    if (!earnedSet.has("clockwork")) {
      const { count: attCount } = await supabase
        .from("intern_attendance")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("status", "present");
      if ((attCount || 0) >= 5) {
        newlyUnlocked.push("clockwork");
      }
    }

    // 3. networker: 5 connections
    if (!earnedSet.has("networker")) {
      // Get connections count dynamically
      const connStats = await getProfileConnections(profileId, userId);
      if (connStats.count >= 5) {
        newlyUnlocked.push("networker");
      }
    }

    // 4. flawless_execution: 3 tasks approved by supervisor
    if (!earnedSet.has("flawless_execution")) {
      const { count: approvedLogs } = await supabase
        .from("intern_logs")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("status", "approved");
      if ((approvedLogs || 0) >= 3) {
        newlyUnlocked.push("flawless_execution");
      }
    }

    // 5. rising_star: 4-star weekly rating
    if (!earnedSet.has("rising_star")) {
      const { count: highRatingCount } = await supabase
        .from("intern_evaluations")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .gte("overall_rating", 4);
      if ((highRatingCount || 0) >= 1) {
        newlyUnlocked.push("rising_star");
      }
    }

    // 6. the_grinder: 14 days of logs or attendance
    if (!earnedSet.has("the_grinder")) {
      const { count: totalDays } = await supabase
        .from("intern_attendance")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("status", "present");
      if ((totalDays || 0) >= 14) {
        newlyUnlocked.push("the_grinder");
      }
    }

    // 7. excellence_vanguard: 5-star review
    if (!earnedSet.has("excellence_vanguard")) {
      const { count: maxRatingCount } = await supabase
        .from("intern_evaluations")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("overall_rating", 5);
      if ((maxRatingCount || 0) >= 1) {
        newlyUnlocked.push("excellence_vanguard");
      }
    }

    // 8. unbroken_focus: 4 reviews with high rating
    if (!earnedSet.has("unbroken_focus")) {
      const { count: reviewsCount } = await supabase
        .from("intern_evaluations")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .gte("overall_rating", 4);
      if ((reviewsCount || 0) >= 4) {
        newlyUnlocked.push("unbroken_focus");
      }
    }

    // 9. alumni_shield: completed internship
    if (!earnedSet.has("alumni_shield")) {
      const { count: accAppCount } = await supabase
        .from("internship_applications")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("status", "accepted");
      const { count: attCount } = await supabase
        .from("intern_attendance")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("status", "present");
      if ((accAppCount || 0) >= 1 && (attCount || 0) >= 20) {
        newlyUnlocked.push("alumni_shield");
      }
    }

    // 10. program_valedictorian: Top 5% based on overall ratings
    if (!earnedSet.has("program_valedictorian")) {
      const { data: evaluations } = await supabase
        .from("intern_evaluations")
        .select("overall_rating")
        .eq("student_id", userId);
      const avg = evaluations && evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.overall_rating, 0) / evaluations.length
        : 0;
      if (avg >= 4.5 && evaluations.length >= 3) {
        newlyUnlocked.push("program_valedictorian");
      }
    }

    // Insert newly earned badges
    if (newlyUnlocked.length > 0) {
      const rows = newlyUnlocked.map(badge => ({
        student_id: profileId,
        badge_enum: badge
      }));
      await supabase.from("earned_badges").upsert(rows, { onConflict: "student_id,badge_enum" });

      // Refresh set
      const nowString = new Date().toISOString();
      newlyUnlocked.forEach(badge => earnedSet.set(badge, nowString));
    }

    // Construct final list of badges with their unlocked/locked status
    const allBadges: BadgeInfo[] = Object.keys(BADGE_TEMPLATES).map(key => {
      const isUnlocked = earnedSet.has(key);
      return {
        ...BADGE_TEMPLATES[key],
        unlocked: isUnlocked,
        earnedAt: earnedSet.get(key)
      };
    });

    return allBadges;
  } catch (error) {
    console.error("Error in getEarnedBadges evaluation:", error);
    return Object.keys(BADGE_TEMPLATES).map(key => ({
      ...BADGE_TEMPLATES[key],
      unlocked: false
    }));
  }
}
