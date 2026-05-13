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

    // Check both potential tables for applications
    // First: internship_applications
    const { data: internshipApp } = await supabase
      .from("internship_applications")
      .select("status")
      .eq("internship_id", entityId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (internshipApp) {
        if (internshipApp.status === "accepted") return "accepted";
        if (internshipApp.status === "rejected") return "rejected";
        return "pending";
    }

    // Second: Applications (General)
    const { data: generalApp } = await supabase
      .from("Applications")
      .select("status")
      .eq("program_id", entityId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (generalApp) {
        if (generalApp.status === "accepted") return "accepted";
        if (generalApp.status === "rejected") return "rejected";
        return "pending";
    }

    return "not_applied";
  } catch (error) {
    console.error("Error checking application status:", error);
    return "not_applied";
  }
});
