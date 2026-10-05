"use server";

import { z } from "zod";
import { getSession } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/errors";
import { updateMyProfile } from "@/lib/api/services/profile";

const profileUpdateSchema = z.object({
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  university: z.string().optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  // Add other allowed fields here, but explicitly EXCLUDE sensitive fields like 'role', 'is_verified', etc.
});

export async function quickUpdateProfile(
  updates: Record<string, any>
) {
  try {
    if (!(await getSession())) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate updates against the schema
    const result = profileUpdateSchema.safeParse(updates);

    if (!result.success) {
      return { success: false, error: "Invalid profile data provided." };
    }

    const { profile } = await updateMyProfile(result.data);
    return { success: true, data: profile };
  } catch (error: any) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : "Failed to update profile",
    };
  }
}
