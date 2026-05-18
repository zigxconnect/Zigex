import React from "react";
import { getAllUsers } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DashboardWidgets } from "@/components/feed/DashboardWidgets";

export default async function StudentDirectoryPage() {
  const [profiles, userData, workspaces] = await Promise.all([
    getAllUsers(1000, 0), // Fetch up to 1000 profiles to ensure we get all students
    getProfileInfo(),
    import('@/lib/actions/intenship.actions').then(m => m.getUserWorkspaces())
  ]);

  // Filter out current user from directory list, but keep track of ID for stats
  const filteredProfiles = profiles.filter((p) => p.id !== userData?.profile?.id);
  const allProfileIds = [...filteredProfiles.map(p => p.id), userData?.profile?.id].filter(Boolean) as string[];

  // Fetch stats for all students including current user from the UNIFIED Applications table
  // Attempting to fetch program title. Function name for join assumed to be 'programs'.
  const [applications, projects] = await Promise.all([
    supabaseAdmin
      .from("Applications")
      .select("student_id, application_type, status, program_id, programs(title)")
      .in("student_id", allProfileIds)
      .neq("status", "rejected"),
    supabaseAdmin.from("projects").select("creator_id").in("creator_id", allProfileIds),

  ]);

  // Create a map for quick stat lookup
  const statsMap: Record<string, any> = {};
  allProfileIds.forEach(id => {
    statsMap[id] = {
      internshipsApplied: 0,
      programsApplied: 0,
      eventsApplied: 0,
      projectsCreated: 0,
      currentProgram: undefined
    };
  });

  // Calculate stats from the unified Applications table
  applications.data?.forEach((row: any) => {
    if (statsMap[row.student_id]) {
      if (row.application_type === "internship") {
        statsMap[row.student_id].internshipsApplied++;
      } else if (row.application_type === "program") {
        statsMap[row.student_id].programsApplied++;
        
        // Check for active program
        if (row.status === 'accepted') {
           // @ts-ignore
           const programTitle = row.programs?.title;
           if (programTitle) {
              statsMap[row.student_id].currentProgram = programTitle;
           }
        }
      } else if (row.application_type === "event") {
        statsMap[row.student_id].eventsApplied++;
      }
    }
  });

  projects.data?.forEach((row: any) => {
    if (statsMap[row.creator_id]) statsMap[row.creator_id].projectsCreated++;
  });

  // Combine profiles with their stats
  const profilesWithStats = filteredProfiles.map(profile => ({
    ...profile,
    stats: statsMap[profile.id]
  }));

  const userStats = userData?.profile?.id ? statsMap[userData.profile.id] : undefined;

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12">
      {/* ═══ Main Content Column ═══ */}
      <div className="flex-1 min-w-0 space-y-6">
        <WelcomeCard user={userData} stats={userStats} />
        <StudentDirectoryClient profiles={profilesWithStats} />
      </div>

      {/* ═══ Sidebar Column ═══ */}
      <DashboardWidgets user={userData} workspaces={workspaces} />
    </div>
  );
}