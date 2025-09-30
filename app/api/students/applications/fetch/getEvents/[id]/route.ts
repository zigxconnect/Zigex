import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validate as isUUID } from "uuid";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { id: applicationId } = params;

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

    // Verify the event application belongs to the student
    const { data: existingApp, error: fetchError } = await supabase
      .from("Applications")
      .select("id, student_id, application_type, status")
      .eq("id", applicationId)
      .eq("application_type", "event")
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json({ error: "Event RSVP not found." }, { status: 404 });
    }

    if (existingApp.student_id !== studentData.id) {
      return NextResponse.json({ error: "You can only update your own event RSVPs." }, { status: 403 });
    }

    // Get update data from FormData
    const formData = await request.formData();
    
    const expectations = formData.get("expectations") as string;
    const comments = formData.get("comments") as string;
    const rsvp_status = formData.get("rsvp_status") as string;

    // Prepare updates object
    const allowedUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Handle text field updates
    if (expectations) allowedUpdates.expectations = expectations;
    if (comments) allowedUpdates.comments = comments;
    if (rsvp_status) allowedUpdates.rsvp_status = rsvp_status === "true";

    // Remove updated_at from count check since it's always added
    const updateFieldsCount = Object.keys(allowedUpdates).filter(key => key !== 'updated_at').length;
    
    if (updateFieldsCount === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    // Update the event application
    const { data: updatedApp, error: updateError } = await supabase
      .from("Applications")
      .update(allowedUpdates)
      .eq("id", applicationId)
      .select(`
        *,
        event:event (
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
      console.error("Error updating event RSVP:", updateError);
      return NextResponse.json({ error: "Failed to update event RSVP." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Event RSVP updated successfully.",
      application: updatedApp
    });

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE method remains the same
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... (same DELETE implementation as before)
}