// Get all posts, or CREATE a new post


// File: app/api/student/weekly-posts/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper function to create the Supabase client
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
 * POST: Creates a new weekly post for the logged-in student.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  try {
    // 1. Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Get the student profile ID linked to the user
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found. Cannot create post.' }, { status: 404 })
    }
    
    // 3. Get the post data from the request body
    const { post_title, post_content } = await request.json()
    if (!post_title || !post_content) {
      return NextResponse.json({ error: 'Post title and content are required.' }, { status: 400 })
    }

    // 4. Insert the new post into the database
    const { data: newPost, error: insertError } = await supabase
      .from('weekly_posts')
      .insert({
        student_id: studentProfile.id,
        post_title,
        post_content,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to create post.', details: error.message }, { status: 500 })
  }
}

/**
 * GET: Fetches a feed of all weekly posts from all students.
 */
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    // RLS policy ensures only authenticated users can access this.
    const { data, error } = await supabase
      .from('weekly_posts')
      .select(`
        *,
        student_profiles (
          full_name,
          avatar_url,
          university
        ),
        post_comments (
          *,
          mentors (
            full_name,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts.', details: error.message }, { status: 500 });
  }
}