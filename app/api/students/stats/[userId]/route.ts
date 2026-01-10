import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: studentId } = await params;

    // Fetch counts from the unified Applications table and projects table in parallel
    const [statsResult, projectsResult] = await Promise.all([
      supabaseAdmin
        .from('Applications')
        .select('application_type, status')
        .eq('student_id', studentId)
        .neq('status', 'rejected'),

      // For projects, we need to know the user_id. Let's get it from profiles first or assume studentId IS user_id if they are the same in some contexts.
      // But usually student_profiles.id != user_id. Let's fetch the profile to be sure.
      supabaseAdmin
        .from('student_profiles')
        .select('user_id')
        .eq('id', studentId)
        .maybeSingle()
    ]);

    if (statsResult.error) throw statsResult.error;

    const applications = statsResult.data || [];
    const userId = projectsResult.data?.user_id;

    // Fetch project count if we have a user_id
    let projectsCount = 0;
    if (userId) {
      const { count, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId);

      if (!projectsError) projectsCount = count || 0;
    }

    const stats = {
      internshipsApplied: applications.filter(a => a.application_type === 'internship').length,
      programsApplied: applications.filter(a => a.application_type === 'program').length,
      eventsApplied: applications.filter(a => a.application_type === 'event').length,
      projectsCreated: projectsCount,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch student statistics',
        data: {
          internshipsApplied: 0,
          programsApplied: 0,
          eventsApplied: 0,
          projectsCreated: 0,
        },
      },
      { status: 500 }
    );
  }
}
