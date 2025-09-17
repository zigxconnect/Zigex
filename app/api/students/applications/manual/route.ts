import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid"; // Import validate

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
    const internship_id_raw = formData.get("internship_id");
    const cover_letter_file = formData.get("cover_letter_file") as File | null;
    const support_letter_file = formData.get("support_letter_file") as File | null;

    // ✅ Validate internship_id
    if (typeof internship_id_raw !== "string" || !isUUID(internship_id_raw)) {
      console.error("Invalid or missing internship_id:", internship_id_raw);
      return NextResponse.json({ error: "Internship ID is required and must be a valid UUID." }, { status: 400 });
    }
    const internship_id = internship_id_raw;

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

    // ✅ Upload Cover Letter
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

    // ✅ Upload Support Letter (if provided)
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
        throw new Error("Failed to upload support letter.");
      }

      const { data: supportPublicUrl } = supabase.storage
        .from("student-assets")
        .getPublicUrl(supportFilePath);
      supportLetterUrl = supportPublicUrl.publicUrl;
    }

    // ✅ Create application record (force new row every time)
    let { data: appData, error: appError } = await supabase
      .from("applications")
      .insert([
        {
          student_id,
          internship_id,
          application_type: "manual",
        },
      ])
      .select("id")
      .single();

    if (appError || !appData) {
      // 🚨 Special case: unique constraint violation
      if (appError?.code === "23505") {
        console.warn("Duplicate application detected. Creating a new unique record...");

        const { data: newAppData, error: newAppError } = await supabase
          .from("applications")
          .insert([
            {
              student_id,
              internship_id,
              application_type: "manual",
              created_at: new Date().toISOString(), // helps differentiate rows
            },
          ])
          .select("id")
          .single();

        if (newAppError || !newAppData) {
          console.error("Retry insert failed:", newAppError?.message);
          throw new Error("Failed to create application entry after retry.");
        }

        appData = newAppData; // reassign after retry
      } else {
        console.error("Application insert failed:", appError?.message);
        throw new Error("Failed to create application entry.");
      }
    }

    const application_id = appData.id;

    // ✅ Insert application form details
    const { error: formError } = await supabase
      .from("application_forms")
      .insert([
        {
          application_id,
          cover_letter_url: coverLetterUrl,
          support_letter_url: supportLetterUrl,
        },
      ]);

    if (formError) {
      console.error("Form insert failed:", formError.message);
      throw new Error("Failed to submit application form details.");
    }

    return NextResponse.json(
      { message: "Application submitted successfully.", applicationId: application_id },
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
