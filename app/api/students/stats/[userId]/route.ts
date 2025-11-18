import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Fetch internship applications
    const { data: internships, error: internshipsError } = await supabase
      .from('internship_applications')
      .select('id')
      .eq('user_id', userId);

    if (internshipsError) throw internshipsError;

    // Fetch program applications
    const { data: programs, error: programsError } = await supabase
      .from('program_applications')
      .select('id')
      .eq('user_id', userId);

    if (programsError) throw programsError;

    // Fetch event RSVPs
    const { data: events, error: eventsError } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('user_id', userId);

    if (eventsError) throw eventsError;

    // Fetch project count
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('creator_id', userId);

    if (projectsError) throw projectsError;

    return NextResponse.json({
      success: true,
      data: {
        internshipsApplied: internships?.length || 0,
        programsApplied: programs?.length || 0,
        eventsApplied: events?.length || 0,
        projectsCreated: projects?.length || 0,
      },
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
