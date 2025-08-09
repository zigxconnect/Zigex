// public internship listing

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


/**
 * @swagger 
 *  /api/internships:
 *  get:
 *     summary: this route gets all internships available in the databasee
 *     description: This route gets available internships found in the database. 
 *     tags:
 *          - STUDENT 
 */
export async function GET(request: Request) {
  const cookieStore = await cookies()

  // 1. Create Supabase client using the same server-side pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Note: set and remove are not needed for a GET-only route, 
        // but we keep the pattern for consistency.
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // 2. Fetch all internships from the 'internships' table.
    // We are also joining with 'company_profiles' to get company details.
    // Supabase foreign key relationships make this syntax possible.
    const { data: internships, error } = await supabase
      .from('internships')
      .select(`
        id,
        title,
        description,
        required_skills,
        location,
        is_paid,
        created_at,
        company_profiles (
          company_name,
          logo_url 
        )
      `)
      // Optional: Order by the newest internships first
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // Throw the error to be caught by the outer catch block
      throw error;
    }

    // 3. Return the list of internships
    return NextResponse.json(internships, { status: 200 });

  } catch (error: any) {
    console.error('API Endpoint Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch internships',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// NOTE: Unlike your user profile route, this endpoint is public.
// Anyone can view the list of internships without being logged in.
// If you wanted to protect this route, you would add the auth check:
/*
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
*/