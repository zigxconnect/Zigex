import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid";

// --- Notification Helper Function ---
const createNotification = async (
  supabase: any,
  studentId: string,
  title: string,
  message: string,
  type: "internship" | "program" | "event",
  referenceId: string
) => {
  const { error } = await supabase.from("notifications").insert({
    user_id: studentId,
    title,
    message,
    type,
    reference_id: referenceId,
  });
  if (error) {
    console.error("Failed to create notification:", error);
  }
};

// --- The Single, Unified POST Endpoint ---
export async function POST(request: Request) {
  try {
    // --- COMMON SETUP ---
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

    // --- A) INTERNSHIP APPLICATION LOGIC ---
    if (formData.has("internship_id")) {
      const internship_id = formData.get("internship_id") as string;
      if (!isUUID(internship_id)) {
        return NextResponse.json(
          { error: "A valid Internship ID is required." },
          { status: 400 }
        );
      }

      // --- VALIDATION 1: Check for duplicate application ---
      const { data: existingApp } = await supabase
        .from("Applications")
        .select("id")
        .eq("student_id", student_id)
        .eq("internship_id", internship_id)
        .maybeSingle();

      if (existingApp) {
        return NextResponse.json(
          { error: "You have already applied to this internship." },
          { status: 409 } // 409 Conflict
        );
      }

      const { data: postingInfo, error: postingError } = await supabase
        .from("internships")
        .select("company_id, title, deadline")
        .eq("id", internship_id)
        .single();

      if (postingError || !postingInfo?.company_id) {
        return NextResponse.json(
          { error: "The internship you are applying for could not be found." },
          { status: 404 }
        );
      }

      // --- VALIDATION 2: Check if the internship is still active ---
      if (new Date(postingInfo.deadline) < new Date()) {
        return NextResponse.json(
          { error: "The deadline for this internship has passed." },
          { status: 400 }
        );
      }

      const resume_file = formData.get("resume") as File | null;
      if (!resume_file || resume_file.size === 0) {
        return NextResponse.json(
          { error: "A resume file is required." },
          { status: 400 }
        );
      }

      // --- VALIDATION 3: Check file type ---
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(resume_file.type)) {
        return NextResponse.json(
          { error: "Only PDF and Word (DOC, DOCX) documents are allowed." },
          { status: 400 }
        );
      }

      const safeExt = resume_file.name.split(".").pop() || "pdf";
      const serverFileName = `resume_${uuidv4()}.${safeExt}`;
      const filePath = `students/${user.id}/applications/${internship_id}/${serverFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("student-assets")
        .upload(filePath, resume_file);
      if (uploadError) {
        return NextResponse.json(
          { error: "Failed to upload resume." },
          { status: 500 }
        );
      }
      const resumeUrl = supabase.storage
        .from("student-assets")
        .getPublicUrl(filePath).data.publicUrl;

      const applicationData = {
        student_id,
        internship_id,
        company_id: postingInfo.company_id,
        application_type: "internship" as const,
        resume_url: resumeUrl,
        duration: (formData.get("duration") as string) || null,
        department: (formData.get("department") as string) || null,
        location: (formData.get("location") as string) || null,
        expectations: (formData.get("expectations") as string) || null,
        status: "pending",
      };

      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id")
        .single();
      if (appError) {
        return NextResponse.json(
          { error: "Failed to submit internship application." },
          { status: 500 }
        );
      }

      await createNotification(
        supabase,
        user.id,
        "Application Submitted!",
        `Your application for "${postingInfo.title}" is under review.`,
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

      // --- VALIDATION: Check for duplicate application ---
      const { data: existingApp } = await supabase
        .from("Applications")
        .select("id")
        .eq("student_id", student_id)
        .eq("program_id", program_id)
        .maybeSingle();

      if (existingApp) {
        return NextResponse.json(
          { error: "You have already applied to this program." },
          { status: 409 }
        );
      }

      const { data: postingInfo, error: postingError } = await supabase
        .from("programs")
        .select("company_id, title")
        .eq("id", program_id)
        .single();
      if (postingError || !postingInfo?.company_id) {
        return NextResponse.json(
          { error: "The program you are applying for could not be found." },
          { status: 404 }
        );
      }

      const applicationData = {
        student_id,
        program_id,
        company_id: postingInfo.company_id,
        application_type: "program" as const,
        level: (formData.get("level") as string)?.toLowerCase() || null,
        expectations: (formData.get("expectations") as string) || null,
        comments: (formData.get("comments") as string) || null,
        status: "pending",
      };

      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id")
        .single();
      if (appError) {
        return NextResponse.json(
          { error: "Failed to submit program application." },
          { status: 500 }
        );
      }

      await createNotification(
        supabase,
        user.id,
        "Application Submitted!",
        `Your application for "${postingInfo.title}" is under review.`,
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

      // --- VALIDATION: Check for duplicate RSVP ---
      const { data: existingRsvp } = await supabase
        .from("Applications")
        .select("id")
        .eq("student_id", student_id)
        .eq("event_id", event_id)
        .maybeSingle();

      if (existingRsvp) {
        return NextResponse.json(
          { error: "You have already RSVP'd to this event." },
          { status: 409 }
        );
      }

      const { data: postingInfo, error: postingError } = await supabase
        .from("event")
        .select("company_id, title")
        .eq("id", event_id)
        .single();
      if (postingError || !postingInfo?.company_id) {
        return NextResponse.json(
          { error: "The event you are RSVPing to could not be found." },
          { status: 404 }
        );
      }

      const applicationData = {
        student_id,
        event_id,
        company_id: postingInfo.company_id,
        application_type: "event" as const,
        expectations: (formData.get("expectations") as string) || null,
        comments: (formData.get("comments") as string) || null,
        rsvp_status: formData.get("rsvp_status") === "true",
        status: "rsvp_confirmed",
      };

      const { data: appData, error: appError } = await supabase
        .from("Applications")
        .insert(applicationData)
        .select("id")
        .single();
      if (appError) {
        return NextResponse.json(
          { error: "Failed to submit RSVP." },
          { status: 500 }
        );
      }

      await createNotification(
        supabase,
        user.id,
        "RSVP Confirmed!",
        `You have successfully RSVP'd for "${postingInfo.title}".`,
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
