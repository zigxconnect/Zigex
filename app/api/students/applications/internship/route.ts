import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid";

export async function POST(request: Request) {
  // Wrapping the entire function in a try...catch is great for debugging
  try {
    const cookieStore = cookies();
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

    const formData = await request.formData();

    // ✅ FIX: Look for 'resume' instead of 'cover_letter_file'
    const resume_file = formData.get("resume") as File | null;
    const internship_id_raw = formData.get("internship_id");

    // Get other text fields
    const duration = formData.get("duration") as string;
    const department = formData.get("department") as string;
    const location = formData.get("location") as string;
    const expectations = formData.get("expectations") as string;

    // Validate internship_id
    if (typeof internship_id_raw !== "string" || !isUUID(internship_id_raw)) {
      return NextResponse.json(
        { error: "Internship ID is required." },
        { status: 400 }
      );
    }
    const internship_id = internship_id_raw;

    // ✅ FIX: Validate the 'resume_file'
    if (!resume_file || resume_file.size === 0) {
      return NextResponse.json(
        { error: "A resume file is required." },
        { status: 400 }
      );
    }

    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }
    const student_id = studentData.id;

    // ✅ FIX: Use the 'resume_file' for uploading
    const fileExt = resume_file.name.split(".").pop();
    const filePath = `students/${user.id}/applications/${internship_id}/resume_${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("student-assets") // Make sure this bucket exists and has correct policies
      .upload(filePath, resume_file);

    if (uploadError) {
      console.error("Resume upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload resume." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("student-assets")
      .getPublicUrl(filePath);
    const resumeUrl = publicUrlData.publicUrl;

    const applicationData = {
      student_id,
      internship_id,
      application_type: "internship",
      resume_url: resumeUrl, // Make sure your DB has a 'resume_url' column
      duration: duration || null,
      department: department || null,
      location: location || null,
      expectations: expectations || null,
      status: "pending",
    };

    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert([applicationData])
      .select("id")
      .single();

    if (appError) {
      console.error("Application insert failed:", appError.message);
      return NextResponse.json(
        { error: "Failed to create application entry." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Internship application submitted successfully.",
        applicationId: appData.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // This will catch any unexpected errors (like missing env vars) and return a proper JSON response
    console.error(
      "A critical error occurred in the internship API:",
      error.message
    );
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
