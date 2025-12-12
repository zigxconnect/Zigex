import React from 'react';
import { createServerActionClient, supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
// import MyMonthProject from '@/components/uiComponent/MyMonthProject';
import { getRawProfileInfo } from '@/lib/actions/profile.actions';
import { redirect } from 'next/navigation';
import { Plus, Briefcase, Users, ExternalLink } from 'lucide-react';
import MyMonthProject from '@/components/uiComponent/ProjectCard';
import CreateProjectButton from '@/components/project/CreateProjectButton';
import ProjectSearch from '@/components/project/ProjectSearch';

export const revalidate = 60;

export default async function DashboardProjectsPage() {
  try {
    // Get authenticated user's profile
    const profile = await getRawProfileInfo();

    if (!profile) {
      // not signed in — send to sign-in
      redirect('/sign-in');
    }

    const supabase = await createServerActionClient();

    // Fetch all projects for this student profile (including pending/validated)
    const [myRes, othersRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('student_id', profile!.id)
        .order('created_at', { ascending: false }),

      // Public (valid) projects by other students (use admin client to bypass RLS)
      supabaseAdmin
        .from('projects')
        .select('*, student_profiles(id, username, full_name, avatar_url, university, hard_skills)')
        .eq('is_valid', true)
        .gt('end_date', new Date().toISOString())
        .neq('student_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const myProjects = myRes.data || [];
    const otherProjects = othersRes.data || [];

    if (myRes.error) {
      console.error('Error fetching user projects:', myRes.error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <p className="text-red-600 font-medium">Failed to load your projects.</p>
          </div>
        </div>
      );
    }

    if (othersRes.error) {
      console.error('Error fetching other projects:', othersRes.error);
    }

    // Fallback: if no public projects returned (RLS or validation flags), try a broader admin fetch
    let fallbackProjects: any[] = [];
    if (!otherProjects || otherProjects.length === 0) {
      try {
        const { data: fbData, error: fbError } = await supabaseAdmin
          .from('projects')
          .select('*, student_profiles(id, username, full_name, avatar_url, university, hard_skills)')
          .neq('student_id', profile!.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!fbError && fbData) {
          fallbackProjects = fbData;
        } else if (fbError) {
          console.error('Fallback fetch error:', fbError);
        }
      } catch (e) {
        console.error('Fallback fetch unexpected error', e);
      }
    }

    const displayedOtherProjects = otherProjects && otherProjects.length > 0 ? otherProjects : fallbackProjects;

    return (
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  Projects
                </h1>
                <p className="text-sm text-gray-600 mt-2">Showcase your work and discover amazing projects</p>
              </div>
              
              <CreateProjectButton />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          {/* My Projects Section */}
          <section className="mb-12 sm:mb-14 lg:mb-16">
            {/* Section Header with Badge */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-md"></div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  My Projects
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-sm">
                    {myProjects.length}
                  </span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">Projects you have created and shared</p>
              </div>
            </div>

            {/* My Projects Content */}
            <div className="rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
              {myProjects && myProjects.length > 0 ? (
                <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                  {myProjects.map((p: any) => (
                    <div 
                      key={p.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300 group overflow-hidden">
                      <MyMonthProject
                        user={{
                          id: profile!.id,
                          full_name: profile!.full_name || '',
                          avatar_url: (profile as any).avatar_url || null,
                          university: (profile as any).university || null,
                          hard_skills: (profile as any).hard_skills || []
                        }}
                        project={p}
                        isVisitor={false}
                        isOwner={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20 lg:py-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full mb-5 border border-blue-200">
                    <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No projects yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-7 max-w-md mx-auto">
                    Start building your portfolio by creating your first project
                  </p>
                  
                    <a href="/dashboard/projects/create"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base">
                    <Plus className="w-5 h-5" />
                    Create Your First Project
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Other Projects Section */}
          <section>
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-1.5 h-10 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full shadow-md"></div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-6 h-6 text-slate-600" />
                  Discover Projects
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 shadow-sm">
                    {displayedOtherProjects.length}
                  </span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">Explore projects from other students</p>
              </div>
            </div>

            {/* Other Projects Content */}
            <div className="rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 bg-white shadow-md">
              {displayedOtherProjects && displayedOtherProjects.length > 0 ? (
                <div className="space-y-6 sm:space-y-7 lg:space-y-8">
                  {displayedOtherProjects.map((p: any) => (
                    <div 
                      key={p.id}
                      className="group">
                      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-slate-300 overflow-hidden">
                        <MyMonthProject
                          user={
                            p.student_profiles || {
                              id: p.student_id,
                              full_name: 'Unknown',
                              avatar_url: null,
                            }
                          }
                          project={p}
                          isVisitor={true}
                          isOwner={false}
                          profileOwnerId={p.student_id}
                        />
                      </div>

                      {/* Link to visit owner's profile */}
                      {p.student_profiles && (
                        <div className="mt-3 px-4">
                          
                            <a href={`/dashboard/student/${p.student_profiles.username || p.student_profiles.id}`}
                            className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 font-semibold group/link transition-colors duration-200">
                            <span className="flex items-center gap-1.5">
                              View {p.student_profiles.full_name}&apos;s profile
                              <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20 lg:py-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-5 border border-gray-200">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No projects available</h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                    Check back later to discover projects from other students
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Unexpected error in dashboard projects page', err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">An unexpected error occurred. Please try again later.</p>
        </div>
      </div>
    );
  }
}