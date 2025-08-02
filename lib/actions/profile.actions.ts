// actions/profile-actions.ts
'use server'

import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Type definitions for better TypeScript support
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
  bio: string | null;
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
 * Server action to get the current user's profile information
 * @returns Promise<FormattedUserData | null>
 */
export async function getProfileInfo(): Promise<FormattedUserData | null> {
  try {
    const supabase = createServerActionClient();

    // 1. Get the current user's session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return null;
    }

    if (!user) {
      // Redirect to sign-in if no user found
      redirect("/sign-in");
    }

    // 2. Fetch the user's complete profile from the database
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return null;
    }

    if (!profile) {
      // Redirect to create profile if no profile exists
      redirect("/create-profile");
    }

    // 3. Format and return the user data
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
      profile: profile, // Include the full profile for additional data
    };

    return userData;
  } catch (error) {
    console.error("Unexpected error in getProfileInfo:", error);
    return null;
  }
}

/**
 * Server action to get just the raw profile data
 * @returns Promise<UserProfile | null>
 */
export async function getRawProfileInfo(): Promise<UserProfile | null> {
  try {
    const supabase = createServerActionClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Unexpected error in getRawProfileInfo:", error);
    return null;
  }
}

/**
 * Server action to check if user has completed their profile
 * @returns Promise<boolean>
 * testing documentation
 */
export async function hasCompletedProfile(): Promise<boolean> {
  try {
    const supabase = createServerActionClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    return !!profile;
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}