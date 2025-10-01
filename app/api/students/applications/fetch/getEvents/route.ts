import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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
          cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Fetch event applications with safe column selection
    const { data: applications, error } = await supabase
      .from("Applications")
      .select(`
        id,
        application_type,
        status,
        expectations,
        comments,
        rsvp_status,
        created_at,
        updated_at,
        event:event (
          id,
          title,
          description,
          company:company_profiles (
            company_name,
            logo_url,
            email
          )
        )
      `)
      .eq("student_id", studentData.id)
      .eq("application_type", "event")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching event applications:", error);
      return NextResponse.json({ error: "Failed to fetch event applications." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      applications: applications || []
    });

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}