import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import { sendApplicationConfirmation, sendApplicationAlert, sendEventRSVPConfirmation } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";


// --- Types ---
type ApplicationType = "internship" | "program" | "event";

interface NotificationParams {
  supabase: any;
  studentId: string;
  title: string;
  message: string;
  type: ApplicationType;
  referenceId: string;
}

// --- Helper Functions ---

const createNotification = async ({
  supabase,
  studentId,
  title,
  message,
  type,
  referenceId,
}: NotificationParams) => {
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

// --- Email Helpers moved to lib/mail ---


const getSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
};

const getAuthenticatedStudent = async (supabase: any) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized. Please log in.", status: 401 };
  }

  const { data: studentData, error: studentError } = await supabase
    .from("student_profiles")
    .select("id, full_name, phone")
    .eq("user_id", user.id)
    .single();

  if (studentError || !studentData?.id) {
    return { error: "Student profile not found.", status: 404 };
  }

  return { user, studentData };
};

// --- Application Handlers ---

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const handleInternshipApplication = async (
  supabase: any,
  user: any,
  studentData: any,
  formData: FormData
) => {
  const internship_id = formData.get("internship_id") as string;
  if (!isUUID(internship_id)) {
    return NextResponse.json(
      { error: "A valid Internship ID is required." },
      { status: 400 }
    );
  }

  // Check duplicate
  const { data: existingApp } = await supabase
    .from("Applications")
    .select("id")
    .eq("student_id", studentData.id)
    .eq("internship_id", internship_id)
    .maybeSingle();

  if (existingApp) {
    return NextResponse.json(
      { error: "You have already applied to this internship." },
      { status: 409 }
    );
  }

  // Get posting info
  const { data: postingInfo, error: postingError } = await supabase
    .from("internships")
    .select("company_id, title, deadline, company_profiles(company_name, email)")
    .eq("id", internship_id)
    .single();

  if (postingError || !postingInfo?.company_id) {
    return NextResponse.json(
      { error: "The internship you are applying for could not be found." },
      { status: 404 }
    );
  }

  if (new Date(postingInfo.deadline) < new Date()) {
    return NextResponse.json(
      { error: "The deadline for this internship has passed." },
      { status: 400 }
    );
  }

  // Handle Resume
  const resume_file = formData.get("resume") as File | null;
  if (!resume_file || resume_file.size === 0) {
    return NextResponse.json(
      { error: "A resume file is required." },
      { status: 400 }
    );
  }

  if (resume_file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Resume file size exceeds 10MB limit." },
      { status: 400 }
    );
  }

  // Handle Cover Letter
  const cover_letter_file = formData.get("cover_letter") as File | null;
  if (!cover_letter_file || cover_letter_file.size === 0) {
    return NextResponse.json(
      { error: "A cover letter is required." },
      { status: 400 }
    );
  }

  if (cover_letter_file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Cover letter file size exceeds 10MB limit." },
      { status: 400 }
    );
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(resume_file.type) || !allowedTypes.includes(cover_letter_file.type)) {
    return NextResponse.json(
      { error: "Only PDF and Word (DOC, DOCX) documents are allowed." },
      { status: 400 }
    );
  }

  // Upload Files in Parallel
  const resumeExt = resume_file.name.split(".").pop() || "pdf";
  const resumeFileName = `resume_${uuidv4()}.${resumeExt}`;
  const resumePath = `students/${user.id}/applications/${internship_id}/${resumeFileName}`;

  const clExt = cover_letter_file.name.split(".").pop() || "pdf";
  const clFileName = `cover_letter_${uuidv4()}.${clExt}`;
  const clPath = `students/${user.id}/applications/${internship_id}/${clFileName}`;

  const [resumeUpload, clUpload] = await Promise.all([
    supabase.storage.from("student-assets").upload(resumePath, resume_file),
    supabase.storage.from("student-assets").upload(clPath, cover_letter_file),
  ]);

  if (resumeUpload.error) {
    console.error("Resume upload error:", resumeUpload.error);
    return NextResponse.json(
      { error: "Failed to upload resume." },
      { status: 500 }
    );
  }

  if (clUpload.error) {
    console.error("Cover letter upload error:", clUpload.error);
    return NextResponse.json(
      { error: "Failed to upload cover letter." },
      { status: 500 }
    );
  }

  const resumeUrl = supabase.storage
    .from("student-assets")
    .getPublicUrl(resumePath).data.publicUrl;

  const coverLetterUrl = supabase.storage
    .from("student-assets")
    .getPublicUrl(clPath).data.publicUrl;

  // Map location to work_mode
  const location = formData.get("location") as string;
  const WORK_MODE_MAP: Record<string, string> = {
    "On-site": "onsite",
    "Remote": "online",
    "Hybrid": "hybrid",
  };
  const dbWorkMode = WORK_MODE_MAP[location] || location?.toLowerCase() || "onsite";

  // Insert Application
  const { data: appData, error: appError } = await supabase
    .from("Applications")
    .insert({
      student_id: studentData.id,
      internship_id,
      company_id: postingInfo.company_id,
      application_type: "internship",
      resume_url: resumeUrl,
      cover_letter_url: coverLetterUrl,
      duration: (formData.get("duration") as string) || null,
      department: (formData.get("department") as string) || null,
      work_mode: dbWorkMode,
      expectations: (formData.get("expectations") as string) || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (appError) {
    console.error("Internship application insert error:", appError);
    return NextResponse.json(
      { error: "Failed to submit internship application." },
      { status: 500 }
    );
  }

  // Notifications
  await createNotification({
    supabase,
    studentId: user.id,
    title: "Application Submitted!",
    message: `Your application for "${postingInfo.title}" is under review.`,
    type: "internship",
    referenceId: internship_id,
  });

  // Centralized Alerts
  await sendApplicationAlert({
    adminEmail: "zigex.connect@gmail.com,zigexconnect.com@gmail.com",
    studentName: studentData.full_name,
    studentEmail: user.email,
    opportunityTitle: postingInfo.title,
    opportunityType: "Internship",
    status: "pending",
    companyName: postingInfo.company_profiles?.company_name
  });

  // Send to company if email exists
  if (postingInfo.company_profiles?.email) {
    await sendApplicationAlert({
      adminEmail: postingInfo.company_profiles.email,
      studentName: studentData.full_name,
      studentEmail: user.email,
      opportunityTitle: postingInfo.title,
      opportunityType: "Internship",
      status: "pending",
      companyName: postingInfo.company_profiles?.company_name
    });
  }

  // Send confirmation to candidate
  await sendApplicationConfirmation({
    email: user.email,
    name: studentData.full_name,
    opportunityTitle: postingInfo.title,
    opportunityType: "Internship",
    companyName: postingInfo.company_profiles?.company_name || "ZIGEX Partner",
    isRSVP: false
  });

  // Automated WhatsApp Alert
  if (studentData.phone) {
    const waMessage = `✅ *Application Received!*\n\nHi ${studentData.full_name.split(' ')[0]}, your application for the *${postingInfo.title}* internship at ${postingInfo.company_profiles?.company_name} has been received and is under review. Good luck! 🚀`;
    await sendWhatsAppMessage(studentData.phone, waMessage);
  }

  return NextResponse.json(
    {
      message: "Internship application submitted successfully!",
      applicationId: appData.id,
    },
    { status: 201 }
  );
};

const handleProgramApplication = async (
  supabase: any,
  user: any,
  studentData: any,
  formData: FormData
) => {
  const program_id = formData.get("program_id") as string;
  if (!isUUID(program_id)) {
    return NextResponse.json(
      { error: "A valid Program ID is required." },
      { status: 400 }
    );
  }

  const { data: existingApp } = await supabase
    .from("Applications")
    .select("id")
    .eq("student_id", studentData.id)
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
    .select("company_id, title, company_profiles(company_name, email)")
    .eq("id", program_id)
    .single();

  if (postingError || !postingInfo?.company_id) {
    return NextResponse.json(
      { error: "The program you are applying for could not be found." },
      { status: 404 }
    );
  }

  const { data: appData, error: appError } = await supabase
    .from("Applications")
    .insert({
      student_id: studentData.id,
      program_id,
      company_id: postingInfo.company_id,
      application_type: "program",
      level: (formData.get("level") as string)?.toLowerCase() || null,
      expectations: (formData.get("expectations") as string) || null,
      comments: (formData.get("comments") as string) || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (appError) {
    return NextResponse.json(
      { error: "Failed to submit program application." },
      { status: 500 }
    );
  }

  await createNotification({
    supabase,
    studentId: user.id,
    title: "Application Submitted!",
    message: `Your application for "${postingInfo.title}" is under review.`,
    type: "program",
    referenceId: program_id,
  });

  // Centralized Alerts
  await sendApplicationAlert({
    adminEmail: "zigex.connect@gmail.com,zigexconnect.com@gmail.com",
    studentName: studentData.full_name,
    studentEmail: user.email,
    opportunityTitle: postingInfo.title,
    opportunityType: "Program",
    status: "pending",
    companyName: postingInfo.company_profiles?.company_name
  });

  // Send to company if email exists
  if (postingInfo.company_profiles?.email) {
    await sendApplicationAlert({
      adminEmail: postingInfo.company_profiles.email,
      studentName: studentData.full_name,
      studentEmail: user.email,
      opportunityTitle: postingInfo.title,
      opportunityType: "Program",
      status: "pending",
      companyName: postingInfo.company_profiles?.company_name
    });
  }

  // Send confirmation to candidate
  await sendApplicationConfirmation({
    email: user.email,
    name: studentData.full_name,
    opportunityTitle: postingInfo.title,
    opportunityType: "Program",
    companyName: postingInfo.company_profiles?.company_name || "ZIGEX Partner",
    isRSVP: false
  });

  // Automated WhatsApp Alert
  if (studentData.phone) {
    const waMessage = `🚀 *Program Application Received!*\n\nHi ${studentData.full_name.split(' ')[0]}, you've successfully applied for the *${postingInfo.title}* program. We'll notify you once your application is reviewed. Stay tuned! ✨`;
    await sendWhatsAppMessage(studentData.phone, waMessage);
  }

  return NextResponse.json(
    {
      message: "Program application submitted successfully!",
      applicationId: appData.id,
    },
    { status: 201 }
  );
};

const handleEventRSVP = async (
  supabase: any,
  user: any,
  studentData: any,
  formData: FormData
) => {
  const event_id = formData.get("event_id") as string;
  if (!isUUID(event_id)) {
    return NextResponse.json(
      { error: "A valid Event ID is required." },
      { status: 400 }
    );
  }

  const { data: existingRsvp } = await supabase
    .from("Applications")
    .select("id")
    .eq("student_id", studentData.id)
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
    .select("company_id, title, start_date, location, description, company_profiles(company_name, email)")
    .eq("id", event_id)
    .single();

  if (postingError || !postingInfo?.company_id) {
    return NextResponse.json(
      { error: "The event you are RSVPing to could not be found." },
      { status: 404 }
    );
  }

  const { data: appData, error: appError } = await supabase
    .from("Applications")
    .insert({
      student_id: studentData.id,
      event_id,
      company_id: postingInfo.company_id,
      application_type: "event",
      expectations: (formData.get("expectations") as string) || null,
      comments: (formData.get("comments") as string) || null,
      rsvp_status: formData.get("rsvp_status") === "true",
      status: "rsvp_confirmed",
    })
    .select("id")
    .single();

  if (appError) {
    return NextResponse.json(
      { error: "Failed to submit RSVP." },
      { status: 500 }
    );
  }

  await createNotification({
    supabase,
    studentId: user.id,
    title: "RSVP Confirmed!",
    message: `You have successfully RSVP'd for "${postingInfo.title}".`,
    type: "event",
    referenceId: event_id,
  });

  // Centralized Alerts
  await sendApplicationAlert({
    adminEmail: "zigex.connect@gmail.com,zigexconnect.com@gmail.com",
    studentName: studentData.full_name,
    studentEmail: user.email,
    opportunityTitle: postingInfo.title,
    opportunityType: "Event",
    status: "rsvp_confirmed",
    companyName: postingInfo.company_profiles?.company_name
  });

  // Send to company if email exists
  if (postingInfo.company_profiles?.email) {
    await sendApplicationAlert({
      adminEmail: postingInfo.company_profiles.email,
      studentName: studentData.full_name,
      studentEmail: user.email,
      opportunityTitle: postingInfo.title,
      opportunityType: "Event",
      status: "rsvp_confirmed",
      companyName: postingInfo.company_profiles?.company_name
    });
  }

  // Send RSVP confirmation to candidate
  // Send RSVP confirmation to candidate
  await sendEventRSVPConfirmation({
    email: user.email,
    name: studentData.full_name,
    eventName: postingInfo.title,
    companyName: postingInfo.company_profiles?.company_name || "ZIGEX Partner",
    eventDate: postingInfo.start_date ? new Date(postingInfo.start_date).toDateString() : "TBA",
    eventLocation: postingInfo.location || "TBA",
    eventRequirements: postingInfo.description
  });

  // Automated WhatsApp Alert
  if (studentData.phone) {
    const waMessage = `🎟️ *RSVP Confirmed!*\n\nHi ${studentData.full_name.split(' ')[0]}, your spot for *${postingInfo.title}* is confirmed! We've sent the details to your email. See you there! 🙌`;
    await sendWhatsAppMessage(studentData.phone, waMessage);
  }

  return NextResponse.json(
    { message: "RSVP submitted successfully!", applicationId: appData.id },
    { status: 201 }
  );
};

// --- Main Handler ---

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const authResult = await getAuthenticatedStudent(supabase);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, studentData } = authResult;
    const formData = await request.formData();

    if (formData.has("internship_id")) {
      return await handleInternshipApplication(supabase, user, studentData, formData);
    } else if (formData.has("program_id")) {
      return await handleProgramApplication(supabase, user, studentData, formData);
    } else if (formData.has("event_id")) {
      return await handleEventRSVP(supabase, user, studentData, formData);
    } else {
      return NextResponse.json(
        {
          error: "Invalid application type. Missing 'internship_id', 'program_id', or 'event_id'.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Critical error in application submission API:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

