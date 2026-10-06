import { NextResponse, NextRequest } from 'next/server';
import { serverApi } from '@/lib/api/server-client';

type StudentStats = {
  internshipsApplied: number;
  programsApplied: number;
  eventsApplied: number;
  projectsCreated: number;
};

const EMPTY_STATS: StudentStats = {
  internshipsApplied: 0,
  programsApplied: 0,
  eventsApplied: 0,
  projectsCreated: 0,
};

/**
 * Application counts for a student card.
 *
 * The backend only exposes the signed-in student's own applications, so
 * other students get zeros.
 * TODO(backend): public stats for any student ("Missing endpoints: Public
 * student profiles") and project counts ("Missing endpoints: Projects").
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: studentId } = await params;

  try {
    const me = (await serverApi.get<{ id?: string; user_id?: string }>('/students/me')).data;
    if (studentId !== me?.id && studentId !== me?.user_id) {
      return NextResponse.json({ success: true, data: EMPTY_STATS });
    }

    const applications = (await serverApi.get<{ application_type?: string; status?: string }[]>('/applications')).data ?? [];
    const active = applications.filter((a) => a.status !== 'rejected');
    const count = (type: string) => active.filter((a) => a.application_type?.toLowerCase() === type).length;

    return NextResponse.json({
      success: true,
      data: {
        internshipsApplied: count('internship'),
        programsApplied: count('program'),
        eventsApplied: count('event'),
        projectsCreated: 0,
      } satisfies StudentStats,
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student statistics', data: EMPTY_STATS },
      { status: 500 }
    );
  }
}
