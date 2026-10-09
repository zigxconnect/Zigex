"use server";
import { unstable_rethrow } from "next/navigation";

import { cache } from "react";
import { fetchMyApplicationRows } from "@/lib/api/services/applications";
import { ApiClientError } from "@/lib/api/errors";
import { getSession } from "@/lib/api/auth";
import { getMyProfile, updateMyProfile } from "@/lib/api/services/profile";
import { sendWelcomeEmail } from "@/lib/emailjs";
import { sendWhatsAppWelcomeInvite } from "@/lib/whatsapp";

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

/** The student's applications (GET /applications); empty on any failure. */
const getMyApplications = cache(async (): Promise<{ status?: string }[]> => {
  try {
    return await fetchMyApplicationRows();
  } catch (error) {
    // Let Next.js's own signals (e.g. "this page reads cookies, render it per request") through.
    unstable_rethrow(error);
    if (!(error instanceof ApiClientError && error.status === 401)) {
      console.error("Error fetching applications for profile stats:", error);
    }
    return [];
  }
});

/**
 * Server action to get the current user's complete, formatted profile information.
 * Wrapped in React cache to prevent redundant backend calls within the same request.
 */
export const getProfileInfo = cache(async (): Promise<FormattedUserData | null> => {
  const [profile, applications] = await Promise.all([getMyProfile(), getMyApplications()]);
  if (!profile) return null;

  const userData: FormattedUserData = {
    name: profile.full_name || "Student",
    avatarUrl: profile.avatar_url,
    initials:
      `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""
        }`.toUpperCase() || "NU",
    university: profile.university || "University not specified",
    skills: profile.hard_skills || [],
    coverImageUrl: profile.cover_image_url || "",
    profile: profile as UserProfile,
    stats: {
      applications: applications.filter((a) => a.status !== "rejected").length,
      profileViews: 0, // Placeholder
    },
    permissions: {
      // Spec'd flags on /students/me. The backend can send is_intern: false for a
      // student with an accepted placement, so an accepted application also counts.
      isSupervisor: Boolean(profile.is_supervisor),
      isIntern:
        profile.is_intern === true ||
        applications.some((a) => a.status === "accepted" || a.status === "rsvp_confirmed"),
    },
  };

  return userData;
});

/**
 * Server action to get just the raw user profile data.
 * Wrapped in React cache for efficiency.
 */
export const getRawProfileInfo = cache(async (): Promise<UserProfile | null> => {
  try {
    return (await getMyProfile()) as UserProfile | null;
  } catch (error) {
    console.error("Unexpected error in getRawProfileInfo:", error);
    return null;
  }
});

/**
 * Server action to quickly check if a user has completed their profile.
 * @returns {Promise<boolean>} True if the profile is marked complete, false otherwise.
 */
export async function hasCompletedProfile(): Promise<boolean> {
  try {
    const profile = await getMyProfile();
    return profile?.profile_status === "complete";
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}

/**
 * Saves the signed-in student's profile (PATCH /students/me) from the
 * profile forms' snake_case fields.
 *
 * `welcome: true` (onboarding only) also sends the welcome email and
 * WhatsApp invite, which the old PUT /api/students/student/[id] route did.
 */
export async function saveMyProfile(
  updates: Record<string, unknown>,
  options: { welcome?: boolean } = {}
): Promise<{ success: boolean; data?: UserProfile | null; unsupported?: string[]; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  try {
    const { profile, unsupported } = await updateMyProfile(updates);

    if (options.welcome && profile) {
      // Fire-and-forget: a failed email/WhatsApp must not fail the save.
      try {
        const userName = profile.full_name || profile.first_name || "Candidate";
        sendWelcomeEmail({
          email: session.email,
          name: userName,
          communityLink: "https://chat.whatsapp.com/GzXpExampleLink",
        });
        if (profile.phone) sendWhatsAppWelcomeInvite(userName, profile.phone);
      } catch (automationError) {
        console.error("[AUTOMATION] Background job error:", automationError);
      }
    }

    return { success: true, data: profile as UserProfile | null, unsupported };
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : "Failed to update profile",
    };
  }
}
