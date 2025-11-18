"use server";

import { createServerActionClient } from "@/lib/supabase/server";

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

    // Update the profile
    const { data, error } = await supabase
      .from("student_profiles")
      .update({
        ...updates,
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
