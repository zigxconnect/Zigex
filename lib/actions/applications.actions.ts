"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { cache } from "react";

export type ApplicationStatus = "not_applied" | "pending" | "accepted" | "rejected";

/**
 * Checks the application status of a user for a specific program or internship.
 * @param entityId The ID of the internship or program
 * @returns Application status
 */
export const checkApplicationStatus = cache(async (entityId: string): Promise<ApplicationStatus> => {
  try {
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return "not_applied";

    // Get student profile first to resolve student_id for unified Applications table
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check both potential tables for applications
    // First: internship_applications (Legacy uses auth.uid as student_id)
    const { data: internshipApp } = await supabase
      .from("internship_applications")
      .select("status")
      .eq("internship_id", entityId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (internshipApp) {
        if (internshipApp.status === "accepted" || internshipApp.status === "rsvp_confirmed") return "accepted";
        if (internshipApp.status === "rejected") return "rejected";
        return "pending";
    }

    // Second: Applications (Unified uses student_profiles.id as student_id)
    if (profile) {
      const { data: generalApp } = await supabase
        .from("Applications")
        .select("status")
        .or(`internship_id.eq.${entityId},program_id.eq.${entityId},event_id.eq.${entityId}`)
        .eq("student_id", profile.id)
        .maybeSingle();

      if (generalApp) {
          if (generalApp.status === "accepted" || generalApp.status === "rsvp_confirmed") return "accepted";
          if (generalApp.status === "rejected") return "rejected";
          return "pending";
      }
    }

    return "not_applied";
  } catch (error) {
    console.error("Error checking application status:", error);
    return "not_applied";
  }
});
