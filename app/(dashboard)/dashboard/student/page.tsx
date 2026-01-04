import React from "react";
import { getAllUsers } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function StudentDirectoryPage() {
  const [profiles, userData] = await Promise.all([
    getAllUsers(200, 0),
    getProfileInfo()
  ]);

  // Filter out current user
  const filteredProfiles = profiles.filter((p) => p.id !== userData?.profile?.id);
  const profileIds = filteredProfiles.map(p => p.id);

  // Fetch stats for all students from the UNIFIED Applications table
  const [applications, projects] = await Promise.all([
    supabaseAdmin
      .from("Applications")
      .select("student_id, application_type, status")
      .in("student_id", profileIds)
      .eq("status", "accepted"),
    supabaseAdmin.from("projects").select("creator_id").in("creator_id", profileIds),
  ]);

  // Create a map for quick stat lookup
  const statsMap: Record<string, any> = {};
  profileIds.forEach(id => {
    statsMap[id] = { 
      internshipsApplied: 0, 
      programsApplied: 0, 
      eventsApplied: 0, 
      projectsCreated: 0 
    };
  });

  // Calculate stats from the unified Applications table - NOW SHOWING ONLY ACCEPTED
  applications.data?.forEach(row => {
    if (statsMap[row.student_id]) {
      if (row.application_type === "internship") {
        statsMap[row.student_id].internshipsApplied++;
      } else if (row.application_type === "program") {
        statsMap[row.student_id].programsApplied++;
      } else if (row.application_type === "event") {
        statsMap[row.student_id].eventsApplied++;
      }
    }
  });
  projects.data?.forEach(row => {
    if (statsMap[row.creator_id]) statsMap[row.creator_id].projectsCreated++;
  });

  // Combine profiles with their stats
  const profilesWithStats = filteredProfiles.map(profile => ({
    ...profile,
    stats: statsMap[profile.id]
  }));

  return (
    <>
      <WelcomeCard user={userData} />
      <StudentDirectoryClient profiles={profilesWithStats} />
    </>
  );
}