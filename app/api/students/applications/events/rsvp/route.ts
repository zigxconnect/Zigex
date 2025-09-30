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
    
    console.log("=== EVENT RSVP FORM DATA RECEIVED ===");
    for (const [key, value] of formData.entries()) {
      console.log(`"${key}":`, value);
    }
    
    const event_id_raw = formData.get("event_id") as string;
    const expectations = formData.get("expectations") as string;
    const comments = formData.get("comments") as string;
    const rsvp_status = formData.get("rsvp_status") as string;

    // ✅ Validate event_id
    if (typeof event_id_raw !== "string" || !isUUID(event_id_raw)) {
      console.error("Invalid or missing event_id:", event_id_raw);
      return NextResponse.json({ error: "Event ID is required and must be a valid UUID." }, { status: 400 });
    }
    const event_id = event_id_raw;

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

    console.log("=== EVENT RSVP EXTRACTED VALUES ===");
    console.log("event_id:", event_id);
    console.log("expectations:", expectations);
    console.log("comments:", comments);
    console.log("rsvp_status:", rsvp_status);

    // ✅ Create event RSVP (NO FILES needed)
    const applicationData = {
      student_id,
      event_id,
      application_type: "event",
      expectations: expectations || null,
      comments: comments || null,
      rsvp_status: rsvp_status === "true",
      status: "rsvp_confirmed"
    };

    console.log("=== FINAL EVENT RSVP DATA ===");
    console.log(applicationData);

    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert([applicationData])
      .select("id")
      .single();

    if (appError) {
      console.error("Event RSVP insert failed:", appError.message);
      return NextResponse.json({ error: "Failed to submit RSVP." }, { status: 500 });
    }

    return NextResponse.json(
      { message: "RSVP submitted successfully!", applicationId: appData.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Event RSVP submission failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Unexpected error during submission." },
      { status: 500 }
    );
  }
}