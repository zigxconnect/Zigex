import React from "react";
import ProjectDetailsView from "@/components/project/ProjectDetailsView";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PitchStatusManager from "@/components/admin/pitches/PitchStatusManager";
import { getProfileInfo, getRawProfileInfo } from "@/lib/actions/profile.actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPitchDetail({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch current user info
  const rawProfile = await getRawProfileInfo();
  // We use .catch(() => null) to avoid crashing if the user doesn't have a student profile (e.g. admins)
  const currentUserData = await getProfileInfo().catch(() => null);
  
  const isAdmin = !!(rawProfile && rawProfile.email && process.env.ADMIN_EMAIL && rawProfile.email === process.env.ADMIN_EMAIL);
  
  // If we don't have formatted data but we have raw data, we can build a minimal currentUser for the UI
  const currentUser = currentUserData || (rawProfile ? {
    profile: rawProfile as any,
    name: rawProfile.full_name || "User",
    avatarUrl: rawProfile.avatar_url || null,
  } : null);

  // Fetch submission and related project
  const { data: submission, error } = await supabaseAdmin
    .from('project_submissions')
    .select(`
      *,
      project:projects (
        *,
        student_profiles!inner (*)
      ),
      company:company_profiles (*)
    `)
    .eq('id', id)
    .single();

  if (error || !submission) {
    notFound();
  }

  const project = submission.project;
  const owner = project.student_profiles;

  // Formatting data for ProjectDetailsView
  const formattedProject = {
    ...project,
    project_title: project.title,
    description: project.solution_description,
  };

  const formattedOwner = {
    id: owner.user_id,
    user_id: owner.user_id,
    full_name: owner.full_name,
    avatar_url: owner.avatar_url,
    university: owner.university,
    role: owner.role
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/admin/pitches"
              className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              Back to Submissions
            </Link>

            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end px-4 border-r border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                  <span className={`text-sm font-black uppercase tracking-tight ${
                    submission.status === 'interested' ? 'text-emerald-600' : 
                    submission.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {submission.status}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
         <PitchStatusManager 
            submissionId={submission.id}
            currentStatus={submission.status}
         />

         <ProjectDetailsView 
            project={formattedProject as any}
            owner={formattedOwner as any}
            githubData={null}
            similarProjects={[]}
            currentUser={currentUser}
            isAdmin={isAdmin}
         />
      </div>
    </div>
  );
}
