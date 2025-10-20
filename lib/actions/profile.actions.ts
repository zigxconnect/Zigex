"use server";

import { createServerActionClient } from "@/lib/supabase/server";

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
}

/**
 * Server action to get the current user's complete, formatted profile information.
 * Throws an error if the user or profile is not found, as the middleware should
 * have already prevented unauthorized access.
 * @returns {Promise<FormattedUserData>}
 */
export async function getProfileInfo(): Promise<FormattedUserData> {
  const supabase = await createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication error: User not found. Middleware should have prevented this."
    );
  }

  const { data: profile, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    throw new Error(
      "Data fetching error: Profile not found for an authenticated user. Middleware should have prevented this."
    );
  }

  const userData: FormattedUserData = {
    name: profile.full_name || "New User",
    avatarUrl: profile.avatar_url,
    initials:
      `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase() || "NU",
    university: profile.university || "University not specified",
    skills: profile.hard_skills || [],
    coverImageUrl: "/placeholder-cover.jpg",
    profile: profile,
  };

  return userData;
}

/**
 * Server action to get just the raw user profile data.
 * Returns null if the user or profile is not found, allowing client
 * components to handle the UI state gracefully.
 * @returns {Promise<UserProfile | null>}
 */
export async function getRawProfileInfo(): Promise<UserProfile | null> {
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
}

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
