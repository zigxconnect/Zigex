// app/api/profile/student/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This function handles both creating and updating a student profile
export async function PUT(request: Request) {
  const cookieStore = await cookies();

  // 1. Create the Supabase client using the pattern that works for you
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Get the user's session from the request cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('API Auth Error:', sessionError);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = session.user;

  // 3. Get the profile data from the request body
  const formData = await request.json();

  // 4. Prepare data for upsert
  // The user_id MUST come from the secure session, not the request body.
  const profileData = {
    ...formData,
    user_id: user.id,
    updated_at: new Date().toISOString(), // Manually set updated_at timestamp
  };

  // 5. Use 'upsert' to either insert a new profile or update an existing one
  // The 'user_id' is the conflict target, making this operation safe and idempotent.
  const { data, error: upsertError } = await supabase
    .from('student_profiles')
    .upsert(profileData)
    .select() // .select() returns the upserted data
    .single(); // .single() ensures we get a single object back, not an array

  if (upsertError) {
    console.error('Supabase Upsert Error:', upsertError);

    // Provide a more specific error for RLS violations
    if (upsertError.code === '42501') {
      return NextResponse.json(
        { error: 'Row-Level Security permission denied.' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to save profile.', details: upsertError.message },
      { status: 500 }
    );
  }

  // 6. Return the saved profile data
  return NextResponse.json({ message: 'Profile saved successfully.', profile: data }, { status: 200 });
}