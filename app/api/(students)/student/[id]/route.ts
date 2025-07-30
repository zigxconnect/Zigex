import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )

  try {
    // 2. Get session with debug logging
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    console.log('Session data:', session)
    console.log('Auth error:', authError)
    console.log('Cookies:', cookieStore.getAll())

    if (!session?.user) {
      return new Response(
        JSON.stringify({ 
          error: 'Not authenticated',
          details: authError?.message || 'No session found'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verify user owns the profile
    if (params.id !== session.user.id) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          detail: 'You can only update your own profile'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 4. Process the update
    const updates = await request.json()
    console.log('Request updates:', updates)

    const { data, error: updateError } = await supabase
      .from('student_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', params.id)
      .select()
      .single()

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