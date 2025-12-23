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
  const profiles = await getAllUsers(100, 0); // Reduced to 100 for better initial load
  const userData = await getProfileInfo();

  // Filter out current user
  const filteredProfiles = profiles.filter((p) => p.id !== userData?.profile?.id);
  const profileIds = filteredProfiles.map(p => p.id);

  // 1. Batch fetch all stats
  const [internships, programs, events, projects] = await Promise.all([
    supabase
      .from("internship_applications")
      .select("user_id")
      .in("user_id", profileIds),
    supabase
      .from("program_applications")
      .select("user_id")
      .in("user_id", profileIds),
    supabase
      .from("event_rsvps")
      .select("user_id")
      .in("user_id", profileIds),
    supabase
      .from("projects")
      .select("creator_id")
      .in("creator_id", profileIds),
  ]);

  // 2. Count them efficiently
  const counts = (data: any[] | null, idField: string) => {
    const map: Record<string, number> = {};
    (data || []).forEach(item => {
      const id = item[idField];
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  };

  const internshipCounts = counts(internships.data, 'user_id');
  const programCounts = counts(programs.data, 'user_id');
  const eventCounts = counts(events.data, 'user_id');
  const projectCounts = counts(projects.data, 'creator_id');

  // 3. Attach stats to profiles
  const profilesWithStats = filteredProfiles.map(profile => ({
    ...profile,
    stats: {
      internshipsApplied: internshipCounts[profile.id] || 0,
      programsApplied: programCounts[profile.id] || 0,
      eventsApplied: eventCounts[profile.id] || 0,
      projectsCreated: projectCounts[profile.id] || 0,
    }
  }));

  return (
    <>
      <WelcomeCard user={userData} />
      <StudentDirectoryClient profiles={profilesWithStats} />
    </>
  );
}