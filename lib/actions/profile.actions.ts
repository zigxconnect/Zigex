"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
 * Intended for use in Server Components. It will redirect the user if they are not
 * signed in or have not created a profile.
 * @returns {Promise<FormattedUserData>}
 */
export async function getProfileInfo(): Promise<FormattedUserData> {
  const supabase = createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    redirect("/create-profile");
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
 * Intended for use in Client Components (e.g., inside useEffect).
 * It returns null if the user or profile is not found, allowing the client
 * to handle the UI state (e.g., show an error message) without a hard redirect.
 * @returns {Promise<UserProfile | null>}
 */
export async function getRawProfileInfo(): Promise<UserProfile | null> {
  try {
    const supabase = createServerActionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

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
 * @returns {Promise<boolean>} True if a profile exists, false otherwise.
 */
export async function hasCompletedProfile(): Promise<boolean> {
  try {
    const supabase = createServerActionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!profile;
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}
