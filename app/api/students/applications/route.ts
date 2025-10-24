// file: app/api/students/applications/route.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid";

// --- 1. NOTIFICATION HELPER FUNCTION ---
// This helper creates a notification that matches your exact database schema.
const createNotification = async (
  supabase: any, // Pass the Supabase client to the function
  studentId: string,
  title: string,
  message: string,
  type: "internship" | "program" | "event",
  referenceId: string
) => {
  const { error } = await supabase.from("notifications").insert({
    user_id: studentId, // Note: your schema allows this to be null, but we should always provide it.
    title,
    message,
    type,
    reference_id: referenceId,
  });
  if (error) {
    console.error(
      "Failed to create 'application submitted' notification:",
      error
    );
    // We don't throw an error here because the main application was successful.
  }
};

// --- 2. THE SINGLE, UNIFIED POST ENDPOINT ---
export async function POST(request: Request) {
  try {
    // --- COMMON SETUP: Supabase Client & User Authentication ---
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options) =>
            cookieStore.set({ name, value, ...options }),
          remove: (name: string, options) =>
            cookieStore.set({
              name,
              value: "",
              ...options,
              expires: new Date(0),
            }),
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

    // --- COMMON SETUP: Get Student Profile ---
    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData?.id) {
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile." },
        { status: 404 }
      );
    }
    const student_id = studentData.id;

    // --- LOGIC BRANCHING: Determine Application Type ---

    // --- A) INTERNSHIP APPLICATION LOGIC ---
    if (formData.has("internship_id")) {
      const internship_id = formData.get("internship_id") as string;
      if (!isUUID(internship_id)) {
        return NextResponse.json(
          { error: "A valid Internship ID is required." },
          { status: 400 }
        );
      }

      // File handling
      const resume_file = formData.get("resume") as File | null;
      if (!resume_file || resume_file.size === 0) {
        return NextResponse.json(
          { error: "A resume file is required." },
          { status: 400 }
        );
      }
      // You can add more detailed file validation (size, type) here if needed.

      const safeExt = resume_file.name.split(".").pop() || "pdf";
      const serverFileName = `resume_${uuidv4()}.${safeExt}`;
      const filePath = `students/${user.id}/applications/${internship_id}/${serverFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-assets")
        .upload(filePath, resume_file);
      if (uploadError) {
        console.error("Resume upload failed:", uploadError.message);
        return NextResponse.json(
          { error: "Failed to upload resume." },
          { status: 500 }
        );
      }
      const resumeUrl = supabase.storage
        .from("student-assets")
        .getPublicUrl(filePath).data.publicUrl;

      // Create application data object
      const applicationData = {
        student_id,
        internship_id,
        application_type: "internship" as const,
        resume_url: resumeUrl,
        duration: (formData.get("duration") as string) || null,
        department: (formData.get("department") as string) || null,
        location: (formData.get("location") as string) || null,
        expectations: (formData.get("expectations") as string) || null,
        status: "pending",
      };

      // Insert into database
      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id, internship:internships(title)")
        .single();
      if (appError) {
        console.error(
          "Internship application insert failed:",
          appError.message
        );
        return NextResponse.json(
          { error: "Failed to submit internship application." },
          { status: 500 }
        );
      }

      // Create Notification
      const opportunityTitle = appData.internship?.title || "the internship";
      await createNotification(
        supabase,
        user.id,
        "Application Submitted!",
        `Your application for "${opportunityTitle}" is under review.`,
        "internship",
        internship_id
      );

      return NextResponse.json(
        {
          message: "Internship application submitted successfully!",
          applicationId: appData.id,
        },
        { status: 201 }
      );
    }

    // --- B) PROGRAM APPLICATION LOGIC ---
    else if (formData.has("program_id")) {
      const program_id = formData.get("program_id") as string;
      if (!isUUID(program_id)) {
        return NextResponse.json(
          { error: "A valid Program ID is required." },
          { status: 400 }
        );
      }

      const applicationData = {
        student_id,
        program_id,
        application_type: "program" as const,
        level: (formData.get("level") as string)?.toLowerCase() || null,
        expectations: (formData.get("expectations") as string) || null,
        comments: (formData.get("comments") as string) || null,
        status: "pending",
      };

      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id, program:programs(title)")
        .single();
      if (appError) {
        console.error("Program application insert failed:", appError.message);
        return NextResponse.json(
          { error: "Failed to submit program application." },
          { status: 500 }
        );
      }

      const opportunityTitle = appData.program?.title || "the program";
      await createNotification(
        supabase,
        user.id,
        "Application Submitted!",
        `Your application for "${opportunityTitle}" is under review.`,
        "program",
        program_id
      );

      return NextResponse.json(
        {
          message: "Program application submitted successfully!",
          applicationId: appData.id,
        },
        { status: 201 }
      );
    }

    // --- C) EVENT APPLICATION (RSVP) LOGIC ---
    else if (formData.has("event_id")) {
      const event_id = formData.get("event_id") as string;
      if (!isUUID(event_id)) {
        return NextResponse.json(
          { error: "A valid Event ID is required." },
          { status: 400 }
        );
      }

      const applicationData = {
        student_id,
        event_id,
        application_type: "event" as const,
        expectations: (formData.get("expectations") as string) || null,
        comments: (formData.get("comments") as string) || null,
        rsvp_status: formData.get("rsvp_status") === "true",
        status: "rsvp_confirmed",
      };

      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id, event:event(title)")
        .single();
      if (appError) {
        console.error("Event RSVP insert failed:", appError.message);
        return NextResponse.json(
          { error: "Failed to submit RSVP." },
          { status: 500 }
        );
      }

      const opportunityTitle = appData.event?.title || "the event";
      await createNotification(
        supabase,
        user.id,
        "RSVP Confirmed!",
        `You have successfully RSVP'd for "${opportunityTitle}".`,
        "event",
        event_id
      );

      return NextResponse.json(
        { message: "RSVP submitted successfully!", applicationId: appData.id },
        { status: 201 }
      );
    }

    // --- D) FALLBACK ERROR ---
    else {
      return NextResponse.json(
        {
          error:
            "Invalid application type. Missing 'internship_id', 'program_id', or 'event_id'.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(
      "A critical error occurred in the application submission API:",
      error.message
    );
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
