"use server";

import { cache } from "react";
import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  university: string | null;
  hard_skills: string[] | null;
  email: string | null;
  phone: string | null;
  about: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormattedUserData {
  name: string;
  avatarUrl: string | null;
  initials: string;
  university: string;
  skills: string[];
  coverImageUrl: string;
  profile: UserProfile;
  stats?: {
    applications: number;
    profileViews: number;
  };
  permissions?: {
    isSupervisor: boolean;
    isIntern: boolean;
  };
}

/**
 * Server action to get the current user's complete, formatted profile information.
 * Wrapped in React cache to prevent redundant DB calls within the same request.
 */
export const getProfileInfo = cache(async (): Promise<FormattedUserData | null> => {
  const supabase = await createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data: { session } } = await supabase.auth.getSession();
    console.warn("[ProfileActions] User not found in getProfileInfo. Session exists:", !!session);
    return null;
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { count: applicationsCount, error: countError } = await supabase
    .from("Applications")
    .select("*", { count: "exact", head: true })
    .eq("student_id", profile.id)
    .neq("status", "rejected");

  if (countError) {
    console.error("Error fetching application count:", countError);
  }

  const userData: FormattedUserData = {
    name: profile.full_name || "New User",
    avatarUrl: profile.avatar_url,
    initials:
      `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""
        }`.toUpperCase() || "NU",
    university: profile.university || "University not specified",
    skills: profile.hard_skills || [],
    coverImageUrl: "/placeholder-cover.jpg",
    profile: profile,
    stats: {
      applications: applicationsCount || 0,
      profileViews: 0, // Placeholder
    },
    permissions: {
      isSupervisor: false,
      isIntern: false
    }
  };

  // Check for Supervisor status
  const { data: supervisor } = await supabaseAdmin
    .from("supervisor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supervisor) userData.permissions!.isSupervisor = true;

  // Check for Intern status (Accepted placement)
  const { data: anyAcceptedAction } = await supabaseAdmin
    .from("Applications")
    .select("id")
    .eq("student_id", user.id)
    .in("status", ["accepted", "rsvp_confirmed"])
    .limit(1)
    .maybeSingle();

  if (anyAcceptedAction) {
    userData.permissions!.isIntern = true;
  } else {
    // Fallback to structural internship_applications
    const { data: activeInternship } = await supabaseAdmin
      .from("internship_applications")
      .select("id")
      .eq("student_id", user.id)
      .eq("status", "accepted")
      .limit(1)
      .maybeSingle();
    if (activeInternship) userData.permissions!.isIntern = true;
  }

  return userData;
});

/**
 * Server action to get just the raw user profile data.
 * Wrapped in React cache for efficiency.
 */
export const getRawProfileInfo = cache(async (): Promise<UserProfile | null> => {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching raw profile:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Unexpected error in getRawProfileInfo:", error);
    return null;
  }
});

/**
 * Server action to quickly check if a user has completed their profile.
 * This is primarily for reference, as the middleware now contains this logic.
 * @returns {Promise<boolean>} True if a profile exists, false otherwise.
 */
export async function hasCompletedProfile(): Promise<boolean> {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("id, profile_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return false;

    return profile?.profile_status === "complete";
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}
