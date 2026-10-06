"use server";

import { cache } from "react";
import { findApplicationFor } from "@/lib/api/services/applications";
import { toApplicationStatus, type ApplicationStatus } from "@/lib/api/applications-shape";

export type { ApplicationStatus };

/**
 * Checks the application status of a user for a specific program or internship.
 * @param entityId The ID of the internship or program
 * @returns Application status
 */
export const checkApplicationStatus = cache(async (entityId: string): Promise<ApplicationStatus> => {
  try {
    const application = await findApplicationFor(entityId);
    return toApplicationStatus(application?.status);
  } catch (error) {
    console.error("Error checking application status:", error);
    return "not_applied";
  }
});
