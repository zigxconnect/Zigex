
import React from 'react';
import { createServerActionClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Briefcase, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import MyMonthProject from '@/components/uiComponent/ProjectCard';
import CreateProjectButton from '@/components/project/CreateProjectButton';
import { getRawProfileInfo } from '@/lib/actions/profile.actions';
import { Badge } from "@/components/ui/badge";
import { slugifyUsername } from '@/lib/utils';

export const revalidate = 60;

export default async function DashboardProjectsPage() {
  try {
    // Get authenticated user's profile
    const profile = await getRawProfileInfo();

    if (!profile) {
      redirect('/sign-in');
    }

    const supabase = await createServerActionClient();

    // Fetch all projects for this user
    // Note: We use owner_id now. We check if user_id matches profile.user_id
    const [myRes, othersRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*, project_submissions(id, status)')
        .eq('owner_id', profile.user_id)
        .order('created_at', { ascending: false }),

      // Community projects: show all published projects from others
      supabase
        .from('projects')
        .select('*, student_profiles!inner(id, username, full_name, avatar_url, university, hard_skills)')
        .neq('owner_id', profile.user_id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const myProjects = (myRes.data || []).map((p: any) => ({
      ...p,
      pitch_status: p.project_submissions?.[0]?.status
    }));
    const otherProjects = othersRes.data || [];

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
                  Projects & Pitches
                </h1>
                <p className="text-sm text-slate-500 mt-1 ml-1">Showcase your innovation to investors and the community</p>
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
                  <h2 className="text-xl font-bold text-slate-900">My Portfolio</h2>
                  <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-3">
                    {myProjects.length}
                  </Badge>
               </div>
               {myProjects.length > 0 && (
                   <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>{myProjects.filter((p: any) => p.is_published).length} Published</span>
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
                        user_id: profile!.user_id,
                        full_name: profile!.full_name || 'Unknown',
                        avatar_url: (profile as any).avatar_url || null,
                        university: (profile as any).university || null,
                        hard_skills: (profile as any).hard_skills || [],
                      }}
                      project={p}
                      isVisitor={false}
                      isOwner={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center group hover:border-blue-400 transition-colors duration-500">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                     <Plus className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Launch your first pitch</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                     The world needs your ideas. Pitch your project to companies, find investors, and build your future.
                  </p>
                  <CreateProjectButton 
                    variant="custom"
                    customTrigger={
                      <div className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-95">
                        <Plus className="w-5 h-5" />
                        Start New Pitch
                      </div>
                    }
                  />
              </div>
            )}
          </section>

          {/* Other Projects Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 rounded-xl">
                 <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-slate-900">Innovation Feed</h2>
                  <p className="text-xs text-slate-500 font-medium">Top pitches from the Zigex community</p>
              </div>
            </div>

            {otherProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {otherProjects.map((p: any) => (
                  <div key={p.id} className="h-full group">
                     <MyMonthProject
                        user={
                          p.student_profiles || {
                            id: p.owner_id,
                            full_name: 'Unknown',
                            avatar_url: null,
                          }
                        }
                        project={p}
                        isVisitor={true}
                        isOwner={false}
                        profileOwnerId={p.owner_id}
                      />

                      {p.student_profiles && (
                        <div className="mt-4 px-4">
                          <a href={`/dashboard/student/${slugifyUsername(p.student_profiles.username) || p.student_profiles.id}`}
                            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-bold group/link transition-colors duration-200">
                            <span className="flex items-center gap-1.5 uppercase tracking-tighter">
                              Meet {p.student_profiles.full_name}
                              <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
                            </span>
                          </a>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No community pitches found yet.</p>
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
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">System Sync Error</h3>
          <p className="text-slate-500 text-sm mb-6">We encountered an issue syncing your project data.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
             Retry Sync
          </button>
        </div>
      </div>
    );
  }
}

const Users = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
