import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid";

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
    console.log("=== FORM DATA RECEIVED ===");
    for (const [key, value] of formData.entries()) {
      console.log(`"${key}":`, value); // Show exact key with quotes to see spaces
    }
    
    const internship_id_raw = formData.get("internship_id");
    const cover_letter_file = formData.get("cover_letter_file") as File | null;
    const support_letter_file = formData.get("support_letter_file") as File | null;
    
    // ✅ Get text fields - handle both with and without spaces
    const duration_months = formData.get("duration_months") as string || formData.get(" duration_months") as string;
    const department = formData.get("department") as string || formData.get(" department") as string;
    const location = formData.get("location") as string || formData.get(" location") as string;
    const work_mode = formData.get("work_mode") as string || formData.get(" work_mode") as string;
    
    // ✅ Validate internship_id
    if (typeof internship_id_raw !== "string" || !isUUID(internship_id_raw)) {
      console.error("Invalid or missing internship_id:", internship_id_raw);
      return NextResponse.json({ error: "Internship ID is required and must be a valid UUID." }, { status: 400 });
    }
    const internship_id = internship_id_raw;

    // ✅ Only cover letter is required
    if (!cover_letter_file || cover_letter_file.size === 0) {
      return NextResponse.json({ error: "Cover letter file is required." }, { status: 400 });
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
    let coverLetterUrl: string | null = null;
    let supportLetterUrl: string | null = null;

    // ✅ Upload Cover Letter (required)
    const coverFileExt = cover_letter_file.name.split(".").pop();
    const coverFilePath = `students/${user.id}/applications/${internship_id}/cover_letter_${uuidv4()}.${coverFileExt}`;

    const { error: coverUploadError } = await supabase.storage
      .from("student-assets")
      .upload(coverFilePath, cover_letter_file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (coverUploadError) {
      console.error("Cover letter upload failed:", coverUploadError.message);
      throw new Error("Failed to upload cover letter.");
    }

    const { data: coverPublicUrl } = supabase.storage
      .from("student-assets")
      .getPublicUrl(coverFilePath);
    coverLetterUrl = coverPublicUrl.publicUrl;

    // ✅ Upload Support Letter (optional)
    if (support_letter_file && support_letter_file.size > 0) {
      const supportFileExt = support_letter_file.name.split(".").pop();
      const supportFilePath = `students/${user.id}/applications/${internship_id}/support_letter_${uuidv4()}.${supportFileExt}`;

      const { error: supportUploadError } = await supabase.storage
        .from("student-assets")
        .upload(supportFilePath, support_letter_file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (supportUploadError) {
        console.error("Support letter upload failed:", supportUploadError.message);
        // Don't throw error - support letter is optional
        console.warn("Support letter upload failed, but continuing without it...");
      } else {
        const { data: supportPublicUrl } = supabase.storage
          .from("student-assets")
          .getPublicUrl(supportFilePath);
        supportLetterUrl = supportPublicUrl.publicUrl;
      }
    }

    // ✅ Create application record (ONLY internship fields)
    const applicationData = {
      student_id,
      internship_id,
      application_type: "internship",
      cover_letter_url: coverLetterUrl,
      support_letter_url: supportLetterUrl,
      duration_months: duration_months ? parseInt(duration_months) : null,
      department: department || null,
      location: location || null,
      work_mode: work_mode || null,
      // ❌ REMOVE expectations and comments (only for programs)
      status: "pending"
    };

    console.log("=== FINAL APPLICATION DATA ===");
    console.log(applicationData);

    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert([applicationData])
      .select("id")
      .single();

    if (appError) {
      console.error("Application insert failed:", appError.message);
      throw new Error("Failed to create application entry.");
    }

    return NextResponse.json(
      { message: "Internship application submitted successfully.", applicationId: appData.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Application submission failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Unexpected error during submission." },
      { status: 500 }
    );
  }
}