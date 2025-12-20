import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validate as isUUID } from "uuid";
import { v4 as uuidv4 } from "uuid";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;

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

    // Validate application ID
    if (!applicationId || !isUUID(applicationId)) {
      return NextResponse.json({ error: "Valid application ID is required." }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Get student profile
    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Verify the internship application belongs to the student
    const { data: existingApp, error: fetchError } = await supabase
      .from("Applications")
      .select("id, student_id, application_type, status, internship_id")
      .eq("id", applicationId)
      .eq("application_type", "internship")
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json({ error: "Internship application not found." }, { status: 404 });
    }

    if (existingApp.student_id !== studentData.id) {
      return NextResponse.json({ error: "You can only update your own internship applications." }, { status: 403 });
    }

    // Only allow updates for pending applications
    if (existingApp.status !== 'pending') {
      return NextResponse.json({ error: "Only pending internship applications can be updated." }, { status: 400 });
    }

    // Get update data from FormData
    const formData = await request.formData();

    // Text fields
    const duration_months = formData.get("duration_months") as string;
    const department = formData.get("department") as string;
    const location = formData.get("location") as string;
    const work_mode = formData.get("work_mode") as string;

    // Files
    const cover_letter_file = formData.get("cover_letter_file") as File | null;
    const support_letter_file = formData.get("support_letter_file") as File | null;

    // Prepare updates object
    const allowedUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Handle text field updates
    if (duration_months) allowedUpdates.duration_months = parseInt(duration_months);
    if (department) allowedUpdates.department = department;
    if (location) allowedUpdates.location = location;
    if (work_mode) allowedUpdates.work_mode = work_mode;

    // Handle file uploads
    if (cover_letter_file && cover_letter_file.size > 0) {
      const coverFileExt = cover_letter_file.name.split(".").pop();
      const coverFilePath = `students/${user.id}/applications/${existingApp.internship_id}/cover_letter_${uuidv4()}.${coverFileExt}`;

      const { error: coverUploadError } = await supabase.storage
        .from("student-assets")
        .upload(coverFilePath, cover_letter_file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (coverUploadError) {
        console.error("Cover letter upload failed:", coverUploadError.message);
        return NextResponse.json({ error: "Failed to upload cover letter." }, { status: 500 });
      }

      const { data: coverPublicUrl } = supabase.storage
        .from("student-assets")
        .getPublicUrl(coverFilePath);
      allowedUpdates.cover_letter_url = coverPublicUrl.publicUrl;
    }

    if (support_letter_file && support_letter_file.size > 0) {
      const supportFileExt = support_letter_file.name.split(".").pop();
      const supportFilePath = `students/${user.id}/applications/${existingApp.internship_id}/support_letter_${uuidv4()}.${supportFileExt}`;

      const { error: supportUploadError } = await supabase.storage
        .from("student-assets")
        .upload(supportFilePath, support_letter_file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (supportUploadError) {
        console.error("Support letter upload failed:", supportUploadError.message);
        // Support letter is optional, so don't fail the entire request
        console.warn("Support letter upload failed, but continuing...");
      } else {
        const { data: supportPublicUrl } = supabase.storage
          .from("student-assets")
          .getPublicUrl(supportFilePath);
        allowedUpdates.support_letter_url = supportPublicUrl.publicUrl;
      }
    }

    // Remove updated_at from count check since it's always added
    const updateFieldsCount = Object.keys(allowedUpdates).filter(key => key !== 'updated_at').length;

    if (updateFieldsCount === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    // Update the internship application
    const { data: updatedApp, error: updateError } = await supabase
      .from("Applications")
      .update(allowedUpdates)
      .eq("id", applicationId)
      .select(`
        *,
        internship:internships (
          id,
          title,
          company:company_profiles (
            company_name,
            logo_url
          )
        )
      `)
      .single();

    if (updateError) {
      console.error("Error updating internship application:", updateError);
      return NextResponse.json({ error: "Failed to update internship application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Internship application updated successfully.",
      application: updatedApp
    });

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE method remains the same as before
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;

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

    // Validate application ID
    if (!applicationId || !isUUID(applicationId)) {
      return NextResponse.json({ error: "Valid application ID is required." }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Get student profile
    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Verify the internship application belongs to the student
    const { data: existingApp, error: fetchError } = await supabase
      .from("Applications")
      .select("id, student_id, application_type, status")
      .eq("id", applicationId)
      .eq("application_type", "internship")
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json({ error: "Internship application not found." }, { status: 404 });
    }

    if (existingApp.student_id !== studentData.id) {
      return NextResponse.json({ error: "You can only delete your own internship applications." }, { status: 403 });
    }

    // Only allow deletion of pending applications
    if (existingApp.status !== 'pending') {
      return NextResponse.json({ error: "Only pending internship applications can be deleted." }, { status: 400 });
    }

    // Delete the internship application
    const { error: deleteError } = await supabase
      .from("Applications")
      .delete()
      .eq("id", applicationId);

    if (deleteError) {
      console.error("Error deleting internship application:", deleteError);
      return NextResponse.json({ error: "Failed to delete internship application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Internship application deleted successfully."
    });

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}