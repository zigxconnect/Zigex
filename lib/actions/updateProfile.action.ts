"use server";

import { createServerActionClient } from "@/lib/supabase/server";

import { z } from "zod";

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
  const supabase = await createServerActionClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate updates against the schema
    const result = profileUpdateSchema.safeParse(updates);
    
    if (!result.success) {
      return { success: false, error: "Invalid profile data provided." };
    }

    const validatedUpdates = result.data;

    // Update the profile
    const { data, error } = await supabase
      .from("student_profiles")
      .update({
        ...validatedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Server action error:", error);
    return { success: false, error: error.message };
  }
}
