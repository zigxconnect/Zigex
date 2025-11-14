"use server";

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Math.min(Number(url.searchParams.get('limit') || '12'), 50);
    const offset = (page - 1) * limit;

    // Fetch lightweight summary fields for other students' projects
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('id, project_title, cover_image_url, project_duration, created_at, is_valid, student_id, student_profiles(id, full_name, avatar_url)')
      .eq('is_valid', true)
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('API /projects/other error', error);
      return NextResponse.json({ error: 'Failed to fetch other projects' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /projects/other unexpected', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
