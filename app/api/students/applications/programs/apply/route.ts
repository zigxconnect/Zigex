import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validate as isUUID } from "uuid";

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
          cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError?.message || "No user found");
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    
    // ✅ Debug: Log all form data keys and values
    console.log("=== PROGRAM FORM DATA RECEIVED ===");
    for (const [key, value] of formData.entries()) {
      console.log(`"${key}":`, value);
    }
    
    const program_id_raw = formData.get("program_id") as string;
    const level = formData.get("level") as string;
    const expectations = formData.get("expectations") as string;
    const comments = formData.get("comments") as string;

    // ✅ Validate program_id
    if (typeof program_id_raw !== "string" || !isUUID(program_id_raw)) {
      console.error("Invalid or missing program_id:", program_id_raw);
      return NextResponse.json({ error: "Program ID is required and must be a valid UUID." }, { status: 400 });
    }
    const program_id = program_id_raw;

    // ✅ Validate required fields for programs
    if (!level) {
      return NextResponse.json({ error: "Level is required for program applications." }, { status: 400 });
    }

    if (!expectations) {
      return NextResponse.json({ error: "Expectations are required for program applications." }, { status: 400 });
    }

    // ✅ Get student profile
    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      console.error("Student profile not found:", studentError?.message);
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile." },
        { status: 404 }
      );
    }

    const student_id = studentData.id;

    // ✅ Debug: Log all extracted values
    console.log("=== PROGRAM EXTRACTED VALUES ===");
    console.log("program_id:", program_id);
    console.log("level:", level);
    console.log("expectations:", expectations);
    console.log("comments:", comments);

    // ✅ Create program application (NO FILES needed)
    const applicationData = {
      student_id,
      program_id,
      application_type: "program",
      level: level.toLowerCase(), // Convert to lowercase for consistency
      expectations: expectations || null,
      comments: comments || null,
      status: "pending"
    };

    console.log("=== FINAL PROGRAM APPLICATION DATA ===");
    console.log(applicationData);

    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert([applicationData])
      .select("id")
      .single();

    if (appError) {
      console.error("Program application insert failed:", appError.message);
      return NextResponse.json({ error: "Failed to submit program application." }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Program application submitted successfully!", applicationId: appData.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Program application submission failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Unexpected error during submission." },
      { status: 500 }
    );
  }
}