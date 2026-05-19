import React from 'react';
import { redirect } from 'next/navigation';
import { getRawProfileInfo } from '@/lib/actions/profile.actions';
import PersonalizedFeed from '@/components/feed/PersonalizedFeed';

export const revalidate = 60;

export default async function DashboardProgramsPage() {
  try {
    // Get authenticated user's profile
    const profile = await getRawProfileInfo();

    if (!profile) {
      redirect('/sign-in');
    }

    return (
      <div className="min-h-screen bg-slate-50/50 selection:bg-blue-100 selection:text-blue-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
            <PersonalizedFeed 
              userId={profile.id} 
              userSkills={profile.hard_skills || []} 
              university={profile.university || undefined} 
            />
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Unexpected error in dashboard programs page', err);
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
