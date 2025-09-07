// app/api/applications/manual/route.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get access token from cookies/session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Parse request body
  const { internship_id, cover_letter, cv_url, linkedin_url, answers } =
    await request.json();

  // Validate that internship_id is provided
  if (!internship_id) {
    return NextResponse.json(
      { error: "Internship ID is required." },
      { status: 400 }
    );
  }

  // Get the student ID
  const { data: studentData, error: studentError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", session.user.id) // Use the authenticated user's ID
    .single();

  if (studentError || !studentData) {
    return NextResponse.json(
      { error: "Student profile not found." },
      { status: 404 }
    );
  }

  const student_id = studentData.id;

  // Create a new application record
  const { data: appData, error: appError } = await supabase
    .from("applications")
    .insert([
      {
        student_id,
        internship_id,
        application_type: "manual",
      },
    ])
    .select()
    .single();

  if (appError || !appData) {
    console.error("Error creating application:", appError);
    return NextResponse.json(
      { error: "Failed to create application." },
      { status: 500 }
    );
  }

    const application_id = appData.id;

    // Parse answers if provided as JSON string
    let parsedAnswers = null;
    if (answers) {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (e) {
        console.error('Error parsing answers:', e);
      }
    }

  // Insert the application form details
  const { error: formError } = await supabase.from("application_forms").insert([
    {
      application_id,
      cover_letter,
      cv_url,
      linkedin_url,
      answers,
    },
  ]);

  if (formError) {
    console.error("Error inserting application form:", formError);
    return NextResponse.json(
      { error: "Failed to submit application form." },
      { status: 500 }
    );
  }

  // Return success response
  return NextResponse.json(
    { message: "Application submitted successfully." },
    { status: 201 }
  );
}
