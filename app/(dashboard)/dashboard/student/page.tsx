"use server";

import React from "react";
import { getAllUsers } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "../../../../components/sections/dashboard/WelcomeCard";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function getUserStats(userId: string) {
  try {
    const [internships, programs, events, projects] = await Promise.all([
      supabase
        .from("internship_applications")
        .select("id")
        .eq("user_id", userId),
      supabase
        .from("program_applications")
        .select("id")
        .eq("user_id", userId),
      supabase
        .from("event_rsvps")
        .select("id")
        .eq("user_id", userId),
      supabase
        .from("projects")
        .select("id")
        .eq("creator_id", userId),
    ]);

    return {
      internshipsApplied: internships.data?.length || 0,
      programsApplied: programs.data?.length || 0,
      eventsApplied: events.data?.length || 0,
      projectsCreated: projects.data?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      internshipsApplied: 0,
      programsApplied: 0,
      eventsApplied: 0,
      projectsCreated: 0,
    };
  }
}

export default async function StudentDirectoryPage() {
  const profiles = await getAllUsers(200, 0);
  const userData = await getProfileInfo();

  // Filter out current user
  const filteredProfiles = profiles.filter((p) => p.id !== userData?.id);

  // Fetch real stats for each student
  const profilesWithStats = await Promise.all(
    filteredProfiles.map(async (profile) => ({
      ...profile,
      stats: await getUserStats(profile.id),
    }))
  );

  return (
    <>
      <WelcomeCard user={userData} />
      <StudentDirectoryClient profiles={profilesWithStats} />
    </>
  );
}