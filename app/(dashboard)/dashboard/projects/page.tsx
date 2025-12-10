
import React from 'react';
import { createServerActionClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Briefcase, Users, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import MyMonthProject from '@/components/uiComponent/ProjectCard';
import CreateProjectButton from '@/components/project/CreateProjectButton';
import { getRawProfileInfo } from '@/lib/actions/profile.actions';
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function DashboardProjectsPage() {
  try {
    // Get authenticated user's profile
    const profile = await getRawProfileInfo();

    if (!profile) {
      redirect('/sign-in');
    }

    const supabase = await createServerActionClient();

    // Fetch all projects for this student profile
    const [myRes, othersRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('student_id', profile!.id)
        .order('created_at', { ascending: false }),

      // Public (valid) projects by other students
      supabaseAdmin
        .from('projects')
        .select('*, student_profiles(id, user_id, full_name, avatar_url, university, hard_skills)')
        .eq('status', 'valid')
        .gt('end_date', new Date().toISOString())
        .neq('student_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const myProjects = myRes.data || [];
    const otherProjects = othersRes.data || [];

    // Fallback fetch logic if needed
    let displayedOtherProjects = otherProjects;
    if ((!otherProjects || otherProjects.length === 0) && !othersRes.error) {
       try {
        const { data: fbData } = await supabaseAdmin
          .from('projects')
          .select('*, student_profiles(id, user_id, full_name, avatar_url, university, hard_skills)')
          .neq('student_id', profile!.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (fbData) displayedOtherProjects = fbData;
       } catch (e) {
         console.error('Fallback fetch error', e);
       }
    }

    return (
      <div className="min-h-screen bg-slate-50/50 selection:bg-blue-100 selection:text-blue-900">
        {/* Header Section */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                     <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  Projects
                </h1>
                <p className="text-sm text-slate-500 mt-1 ml-1">Manage your work and explore the community</p>
              </div>
              
              <CreateProjectButton />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
          
          {/* My Projects Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">My Projects</h2>
                  <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-3">
                    {myProjects.length}
                  </Badge>
               </div>
               {myProjects.length > 0 && (
                   <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>{myProjects.filter((p: any) => p.status === 'valid').length} Active</span>
                   </div>
               )}
            </div>

            {myProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {myProjects.map((p: any) => (
                  <div key={p.id} className="h-full">
                    <MyMonthProject
                      user={{
                        id: profile!.id,
                        full_name: profile!.full_name || 'Unknown',
                        avatar_url: (profile as any).avatar_url || null,
                        university: (profile as any).university || null,
                        hard_skills: (profile as any).hard_skills || [],
                        user_id: profile!.user_id
                      }}
                      project={p}
                      isVisitor={false}
                      isOwner={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Plus className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Create your first project</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                     Showcase your skills to the world. It takes less than 2 minutes to get started.
                  </p>
                  <a href="/dashboard/projects/create" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                     <Plus className="w-5 h-5" />
                     Start New Project
                  </a>
              </div>
            )}
          </section>

          {/* Other Projects Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                 <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-slate-900">Discover Community</h2>
                  <p className="text-xs text-slate-500 font-medium">Top projects picking up steam</p>
              </div>
            </div>

            {displayedOtherProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayedOtherProjects.map((p: any) => (
                  <div key={p.id} className="h-full group">
                     {/* Card Wrapper */}
                     <MyMonthProject
                        user={
                          p.student_profiles || {
                            id: p.student_id,
                            full_name: 'Unknown',
                            avatar_url: null,
                            user_id: p.student_id // Fallback
                          }
                        }
                        project={p}
                        isVisitor={true}
                        isOwner={false}
                        profileOwnerId={p.student_id}
                      />
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-20">
                  <p className="text-slate-400 font-medium">No community projects found at the moment.</p>
               </div>
            )}
          </section>

        </div>
      </div>
    );
  } catch (err) {
    console.error('Unexpected error in dashboard projects page', err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-500">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }
}
