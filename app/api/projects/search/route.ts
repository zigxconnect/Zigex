"use server";

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const limit = Math.min(Number(url.searchParams.get('limit') || '20'), 50);

    if (!q) {
      return NextResponse.json({ data: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('id, project_title, cover_image_url, student_id, status, student_profiles(id, full_name, avatar_url)')
      .ilike('project_title', `%${q}%`)
      .eq('status', 'valid')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('API /projects/search error', error);
      return NextResponse.json({ error: 'Failed to search projects' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /projects/search unexpected', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
