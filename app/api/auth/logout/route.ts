// app/api/auth/logout/route.ts
// THIS VERSION USES THE SAME PATTERN AS YOUR WORKING LOGIN ROUTE

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // Create a Supabase client using the exact same setup as your login route
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // IMPORTANT: The 'set' and 'remove' methods are crucial for logout
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If a session exists, sign the user out
  if (session) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout Error:', error);
      return NextResponse.json(
        { error: 'Failed to log out.' },
        { status: 500 }
      );
    }
  }

  // signOut() will automatically use the 'remove' cookie method we provided
  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}