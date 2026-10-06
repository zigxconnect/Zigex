import React from "react";
import { getAllUsers, type RawUserProfile } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { DashboardWidgets } from "@/components/feed/DashboardWidgets";

export default async function StudentDirectoryPage() {
  const [profiles, userData, workspaces] = await Promise.all([
    getAllUsers(1000, 0), // Fetch up to 1000 profiles to ensure we get all students
    getProfileInfo(),
    import('@/lib/actions/intenship.actions').then(m => m.getUserWorkspaces())
  ]);

  // Filter out current user from directory list, but keep track of ID for stats
  const filteredProfiles = profiles.filter((p) => p.id !== userData?.profile?.id);

  // Per-student counts come with each GET /students row (spec'd `stats`).
  const toStats = (stats: RawUserProfile["stats"]) => ({
    internshipsApplied: stats?.internships ?? 0,
    programsApplied: stats?.programs ?? 0,
    eventsApplied: stats?.events ?? 0,
    projectsCreated: stats?.projects ?? 0,
    currentProgram: stats?.current_program ?? undefined,
  });

  const profilesWithStats = filteredProfiles.map(profile => ({
    ...profile,
    stats: toStats(profile.stats)
  }));


  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12">
      {/* ═══ Main Content Column ═══ */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* <WelcomeCard user={userData} stats={userStats} /> */}
        <StudentDirectoryClient profiles={profilesWithStats} />
      </div>

      {/* ═══ Sidebar Column ═══ */}
      <DashboardWidgets user={userData} workspaces={workspaces} />
    </div>
  );
}