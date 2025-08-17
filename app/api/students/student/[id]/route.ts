import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * @swagger
 *  /api/student/[id]:
 *    put:
 *     summary: this route updates student profiles
 *     description: This route updates a particular authenticated student profile and also gets the profile 
 *     tags:
 *          - STUDENT 
 * 
 *    get:
 *     summary: this route updates student profiles
 *     description: This route gets a particular authenticated student profile 
 *     tags:
 *          - STUDENT  
 * 
 */

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies()
  
  // 1. Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
}

/**
 * Handles fetching a single student profile by their user ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Get the authenticated user securely to ensure the request is authorized.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Get the target user ID from the URL parameters.
    const { id } = params;

    // 3. Fetch the user profile from the database using the user_id.
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id) // Query by the `user_id` foreign key.
      .single();

    if (error) {
      throw error;
    }

    // 4. Return the user profile data.
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API Route Error (GET):", error);
    return NextResponse.json(
      { error: "Profile not found or an error occurred." },
      { status: 404 }
    );
  }
}

/**
 * Handles updating a student's profile.
 * This is called by the multi-step form upon submission.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Get the authenticated user securely.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify that the user is updating their own profile.
    const { id } = params;
    if (id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // 3. Get the update data from the request body.
    const updates = await request.json();

    // 4. Perform the update in the database.
    const { data, error: updateError } = await supabase
      .from("student_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        profile_status: "complete",
      })
      .eq("user_id", id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile updated',
        data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Endpoint error:', error)
    return new Response(
      JSON.stringify({
        error: 'Update failed',
        details: error.message,
        code: error.code
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}







export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Await the params to access id
    const { id } = await params;
  
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: { path?: string }) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: { path?: string }) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
  
    // Get access token from cookies/session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return Response.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
  
    // Fetch user profile
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', id) // Use the awaited id directly
      .single();
  
    // Handle errors
    if (error) {
      return Response.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }
  
    // Return the user profile
    return Response.json(data, { status: 200 });
  }
}
