//  to get a single post and its comments

// File: app/api/student/weekly-posts/[postId]/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper function (can be shared from a common file)
const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}

/**
 * GET: Fetches a single weekly post by its ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const supabase = await createSupabaseServerClient();
  const { postId } = params;

  try {
    const { data, error } = await supabase
      .from('weekly_posts')
      .select(`
        *,
        student_profiles (full_name, avatar_url),
        post_comments ( *, mentors (full_name, avatar_url) )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      // .single() throws an error if no row is found, which is perfect for a 404.
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch post.', details: error.message }, { status: 500 });
  }
}


/**
 * PUT: Updates an existing weekly post.
 * RLS policy ensures only the student who created the post can update it.
 */
export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const supabase = await createSupabaseServerClient();
  const { postId } = params;

  try {
    // 1. Check for authentication (RLS handles authorization)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get update data from request body
    const { post_title, post_content } = await request.json();
    if (!post_title && !post_content) {
      return NextResponse.json({ error: 'Either post_title or post_content must be provided for an update.' }, { status: 400 });
    }

    // 3. Perform the update
    // The RLS policy "Students can manage their own weekly posts." automatically filters
    // this update to only work if the user owns the post.
    const { data: updatedPost, error: updateError } = await supabase
      .from('weekly_posts')
      .update({ post_title, post_content })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      // This will also fail if the RLS policy prevents the update, resulting in a 404-like error.
      throw updateError;
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    // If the post doesn't exist or user doesn't have permission, Supabase often returns a specific error.
    if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found or you do not have permission to update it.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update post.', details: error.message }, { status: 500 });
  }
}