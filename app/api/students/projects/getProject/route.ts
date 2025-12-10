import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


//   FETCH ALL PROJECTS FOR A STUDENT (GET)
export async function GET(req: NextRequest) {
  try {
    // --- Standard Authentication ---
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // THIS OBJECT IS REQUIRED AND IS NOW CORRECTLY INCLUDED
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    // --- End Authentication ---

    // Get the student's profile ID
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }
    const studentId = studentProfile.id;

    // Fetch all projects belonging to this student, ordered by most recent
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    return NextResponse.json(projects, { status: 200 });

  } catch (error: any) {
    console.error("A critical error occurred while fetching projects:", error.message);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

// Your existing, working POST function should also be in this file.
// The code for your POST function is correct.