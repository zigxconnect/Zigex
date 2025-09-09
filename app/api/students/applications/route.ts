// app/api/students/applications/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
          cookieStore.set({
            name,
            value: "",
            ...options,
            expires: new Date(0),
          });
        },
      },
    }
  );
}

// ✅ GET: Fetch student applications
export async function GET() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Get student profile
  const { data: studentData, error: studentError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (studentError || !studentData) {
    return NextResponse.json(
      { error: "Student profile not found." },
      { status: 404 }
    );
  }

  // Fetch all applications with all internship and form data
  const { data: applications, error } = await supabase
    .from("applications")
    .select(`
      *,
      internship:internships(*),
      form:application_forms(*)
    `)
    .eq("student_id", studentData.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch applications." },
      { status: 500 }
    );
  }

  return NextResponse.json(applications);
}

// ✅ PUT: Update application (status, cover letter URL, etc.)
export async function PUT(request: Request) {
  const supabase = await getSupabase();
  const { application_id, status, cover_letter_url, support_letter_url } =
    await request.json();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  const { data: studentData } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // ✅ Update applications table
  const { error: appError } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", application_id)
    .eq("student_id", studentData?.id);

  if (appError) {
    console.error("Update error:", appError.message);
    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 }
    );
  }

  // ✅ Update application_forms
  const { error: formError } = await supabase
    .from("application_forms")
    .update({
      cover_letter_url,
      support_letter_url,
    })
    .eq("application_id", application_id);

  if (formError) {
    console.error("Form update error:", formError.message);
    return NextResponse.json(
      { error: "Failed to update form details." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ✅ DELETE: Remove application
export async function DELETE(request: Request) {
  const supabase = await getSupabase();
  const { application_id } = await request.json();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  const { data: studentData } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // First delete forms
  await supabase
    .from("application_forms")
    .delete()
    .eq("application_id", application_id);

  // Then delete application
  const { error: appError } = await supabase
    .from("applications")
    .delete()
    .eq("id", application_id)
    .eq("student_id", studentData?.id);

  if (appError) {
    console.error("Delete error:", appError.message);
    return NextResponse.json(
      { error: "Failed to delete application." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
