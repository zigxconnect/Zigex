import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    let query = supabase
        .from('applications')
        .select(`
            *,
            internship:internship_id(*)
        `)
        .order('created_at', { ascending: true });

    if (student_id) {
        query = query.eq('student_id', student_id);
    }

    const { data: applications, error } = await query;

    if (error) {
        console.error('Error fetching applications:', error.message);
        return Response.json({ error: 'Error fetching applications' }, { status: 500 });
    }

    return Response.json(applications, { status: 200 });
}