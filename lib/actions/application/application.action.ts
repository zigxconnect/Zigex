// file: app/actions/applications.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import { z } from "zod";

// ============================================
// TYPES & SCHEMAS
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Map frontend work mode values to database values
const WORK_MODE_MAP: Record<string, string> = {
  "On-site": "onsite",
  "Remote": "online",
  "Hybrid": "hybrid",
};

// Internship application schema
const internshipSchema = z.object({
  internship_id: z.string().uuid("Invalid internship ID"),
  duration: z.string().min(1, "Duration is required"),
  department: z.string().min(1, "Department is required"),
  work_mode: z.enum(["On-site", "Remote", "Hybrid"], {
    errorMap: () => ({ message: "Please select a valid work mode" }),
  }),
  expectations: z.string().min(10, "Please provide detailed expectations (min 10 characters)"),
});

// Program application schema
const programSchema = z.object({
  program_id: z.string().uuid("Invalid program ID"),
  programName: z.string().min(2, "Full name is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Please select a valid experience level" }),
  }),
  expectations: z.string().min(10, "Please provide detailed expectations (min 10 characters)"),
  comments: z.string().optional(),
  info: z.literal("on", { errorMap: () => ({ message: "You must acknowledge the program duration" }) }),
});

// Event RSVP schema
const eventSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  name: z.string().min(2, "Full name is required"),
  expectations: z.string().min(10, "Please share what you hope to gain (min 10 characters)"),
  comments: z.string().optional(),
  rsvp_status: z.literal("true"),
});

type ActionResult<T = any> = 
  | { success: true; data: T; message: string }
  | { success: false; error: string; field?: string };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates a Supabase server client
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

/**
 * Gets authenticated user and their student profile
 */
async function getAuthenticatedStudent(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized. Please log in to continue." };
  }

  const { data: studentData, error: studentError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (studentError || !studentData?.id) {
    return {
      error: "Student profile not found. Please complete your profile first.",
    };
  }

  return { user, studentId: studentData.id };
}

/**
 * Checks if student has already applied
 */
async function checkExistingApplication(
  supabase: any,
  studentId: string,
  type: "internship" | "program" | "event",
  referenceId: string
): Promise<boolean> {
  const columnMap = {
    internship: "internship_id",
    program: "program_id",
    event: "event_id",
  };

  const { data, error } = await supabase
    .from("Applications")
    .select("id")
    .eq("student_id", studentId)
    .eq(columnMap[type], referenceId)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing application:", error);
    return false;
  }

  return !!data;
}

/**
 * Creates a notification for the user
 */
async function createNotification(
  supabase: any,
  userId: string,
  title: string,
  message: string,
  type: "internship" | "program" | "event",
  referenceId: string
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    reference_id: referenceId,
    read: false,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Validates and uploads file (resume or cover letter)
 */
async function uploadFile(
  supabase: any,
  file: File,
  userId: string,
  internshipId: string,
  fileType: "resume" | "cover_letter"
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File size exceeds 10MB limit. Please upload a smaller file.",
    };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Please upload a PDF, DOC, or DOCX file.",
    };
  }

  // Validate file name
  const safeExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
  if (!["pdf", "doc", "docx"].includes(safeExt)) {
    return {
      success: false,
      error: "Invalid file extension. Allowed: PDF, DOC, DOCX.",
    };
  }

  try {
    const serverFileName = `${fileType}_${uuidv4()}.${safeExt}`;
    const filePath = `students/${userId}/applications/${internshipId}/${serverFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("student-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`${fileType} upload error:`, uploadError);
      return {
        success: false,
        error: `Failed to upload ${fileType.replace("_", " ")}. Please try again.`,
      };
    }

    const { data: urlData } = supabase.storage
      .from("student-assets")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Unexpected error during file upload:", error);
    return {
      success: false,
      error: "An unexpected error occurred during file upload.",
    };
  }
}

/**
 * Gets opportunity title for notification
 */
async function getOpportunityTitle(
  supabase: any,
  type: "internship" | "program" | "event",
  id: string
): Promise<string> {
  const tableMap = {
    internship: "internships",
    program: "programs",
    event: "event",
  };

  const { data } = await supabase
    .from(tableMap[type])
    .select("title")
    .eq("id", id)
    .single();

  return data?.title || `the ${type}`;
}

// ============================================
// MAIN SERVER ACTIONS
// ============================================

/**
 * Submit internship application
 */
export async function submitInternshipApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await getSupabaseClient();

    // Authenticate user
    const authResult = await getAuthenticatedStudent(supabase);
    if ("error" in authResult) {
      return { success: false, error: authResult.error };
    }
    const { user, studentId } = authResult;

    // Parse and validate form data
    const rawData = {
      internship_id: formData.get("internship_id") as string,
      duration: formData.get("duration") as string,
      department: formData.get("department") as string,
      work_mode: formData.get("work_mode") as string,
      expectations: formData.get("expectations") as string,
    };

    const validation = internshipSchema.safeParse(rawData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0] as string,
      };
    }

    const { internship_id, duration, department, work_mode, expectations } = validation.data;

    // Check for duplicate application
    const hasApplied = await checkExistingApplication(
      supabase,
      studentId,
      "internship",
      internship_id
    );

    if (hasApplied) {
      return {
        success: false,
        error: "You have already applied to this internship.",
      };
    }

    // Handle resume upload (required)
    const resumeFile = formData.get("resume") as File | null;
    if (!resumeFile || resumeFile.size === 0) {
      return {
        success: false,
        error: "Resume file is required.",
        field: "resume",
      };
    }

    const resumeUpload = await uploadFile(
      supabase,
      resumeFile,
      user.id,
      internship_id,
      "resume"
    );

    if (!resumeUpload.success) {
      return { success: false, error: resumeUpload.error, field: "resume" };
    }

    // Handle cover letter upload (required by database constraint)
    const coverLetterFile = formData.get("cover_letter") as File | null;
    if (!coverLetterFile || coverLetterFile.size === 0) {
      return {
        success: false,
        error: "Cover letter is required for internship applications.",
        field: "cover_letter",
      };
    }

    const coverLetterUpload = await uploadFile(
      supabase,
      coverLetterFile,
      user.id,
      internship_id,
      "cover_letter"
    );

    if (!coverLetterUpload.success) {
      return { success: false, error: coverLetterUpload.error, field: "cover_letter" };
    }

    // Map work_mode to database values
    const dbWorkMode = WORK_MODE_MAP[work_mode] || work_mode.toLowerCase();

    // Insert application
    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert({
        student_id: studentId,
        internship_id,
        application_type: "internship",
        resume_url: resumeUpload.url,
        cover_letter_url: coverLetterUpload.url,
        duration,
        department,
        work_mode: dbWorkMode,
        expectations,
        status: "pending",
      })
      .select("id")
      .single();

    if (appError) {
      console.error("Application insert error:", appError);
      return {
        success: false,
        error: "Failed to submit application. Please try again.",
      };
    }

    // Get opportunity title and create notification
    const title = await getOpportunityTitle(supabase, "internship", internship_id);
    await createNotification(
      supabase,
      user.id,
      "Application Submitted!",
      `Your application for "${title}" is under review. We'll notify you once it's been reviewed.`,
      "internship",
      internship_id
    );

    // Send confirmation email
    const { data: companyData } = await supabase
      .from("internships")
      .select("company_id, company_profiles(company_name)")
      .eq("id", internship_id)
      .single();

    const companyName = companyData?.company_profiles?.company_name || "The Company";
    
    if (user.email) {
      const { sendApplicationConfirmationEmail } = await import("@/lib/mail");
      await sendApplicationConfirmationEmail(
        user.email,
        user.user_metadata?.full_name || "Student",
        title,
        "Internship",
        companyName
      );
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/applications");
    revalidatePath("/opportunities/internships");

    return {
      success: true,
      data: { applicationId: appData.id },
      message: "Your internship application has been submitted successfully!",
    };
  } catch (error) {
    console.error("Unexpected error in submitInternshipApplication:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Submit program application
 */
export async function submitProgramApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await getSupabaseClient();

    // Authenticate user
    const authResult = await getAuthenticatedStudent(supabase);
    if ("error" in authResult) {
      return { success: false, error: authResult.error };
    }
    const { user, studentId } = authResult;

    // Parse and validate form data
    const rawData = {
      program_id: formData.get("program_id") as string,
      programName: formData.get("programName") as string,
      level: formData.get("level") as string,
      expectations: formData.get("expectations") as string,
      comments: formData.get("comments") as string,
      info: formData.get("info") as string,
    };

    const validation = programSchema.safeParse(rawData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0] as string,
      };
    }

    const { program_id, level, expectations, comments } = validation.data;

    // Check for duplicate application
    const hasApplied = await checkExistingApplication(
      supabase,
      studentId,
      "program",
      program_id
    );

    if (hasApplied) {
      return {
        success: false,
        error: "You have already applied to this program.",
      };
    }

    // Map level to database format (lowercase)
    const dbLevel = level.toLowerCase();

    // Insert application
    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert({
        student_id: studentId,
        program_id,
        application_type: "program",
        level: dbLevel,
        expectations,
        comments: comments || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (appError) {
      console.error("Program application insert error:", appError);
      return {
        success: false,
        error: "Failed to submit application. Please try again.",
      };
    }

    // Get opportunity title and create notification
    const title = await getOpportunityTitle(supabase, "program", program_id);
    await createNotification(
      supabase,
      user.id,
      "Application Submitted!",
      `Your application for "${title}" is under review. We'll notify you once it's been reviewed.`,
      "program",
      program_id
    );

    // Send confirmation email
    const { data: companyData } = await supabase
      .from("programs")
      .select("company_id, company_profiles(company_name)")
      .eq("id", program_id)
      .single();

    const companyName = companyData?.company_profiles?.company_name || "The Company";
    
    if (user.email) {
      const { sendApplicationConfirmationEmail } = await import("@/lib/mail");
      await sendApplicationConfirmationEmail(
        user.email,
        user.user_metadata?.full_name || "Student",
        title,
        "Program",
        companyName
      );
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/applications");
    revalidatePath("/opportunities/programs");

    return {
      success: true,
      data: { applicationId: appData.id },
      message: "Your program application has been submitted successfully!",
    };
  } catch (error) {
    console.error("Unexpected error in submitProgramApplication:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Submit event RSVP
 */
export async function submitEventRSVP(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await getSupabaseClient();

    // Authenticate user
    const authResult = await getAuthenticatedStudent(supabase);
    if ("error" in authResult) {
      return { success: false, error: authResult.error };
    }
    const { user, studentId } = authResult;

    // Parse and validate form data
    const rawData = {
      event_id: formData.get("event_id") as string,
      name: formData.get("name") as string,
      expectations: formData.get("expectations") as string,
      comments: formData.get("comments") as string,
      rsvp_status: formData.get("rsvp_status") as string,
    };

    const validation = eventSchema.safeParse(rawData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0] as string,
      };
    }

    const { event_id, expectations, comments } = validation.data;

    // Check for duplicate RSVP
    const hasRSVPd = await checkExistingApplication(
      supabase,
      studentId,
      "event",
      event_id
    );

    if (hasRSVPd) {
      return {
        success: false,
        error: "You have already RSVP'd to this event.",
      };
    }

    // Insert RSVP
    const { data: appData, error: appError } = await supabase
      .from("Applications")
      .insert({
        student_id: studentId,
        event_id,
        application_type: "event",
        expectations,
        comments: comments || null,
        rsvp_status: true,
        status: "rsvp_confirmed",
      })
      .select("id")
      .single();

    if (appError) {
      console.error("Event RSVP insert error:", appError);
      return {
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      };
    }

    // Get opportunity title and create notification
    const title = await getOpportunityTitle(supabase, "event", event_id);
    await createNotification(
      supabase,
      user.id,
      "RSVP Confirmed!",
      `You have successfully RSVP'd for "${title}". We look forward to seeing you there!`,
      "event",
      event_id
    );

    // Send confirmation email
    const { data: companyData } = await supabase
      .from("event")
      .select("company_id, company_profiles(company_name)")
      .eq("id", event_id)
      .single();

    const companyName = companyData?.company_profiles?.company_name || "The Company";
    
    if (user.email) {
      const { sendApplicationConfirmationEmail } = await import("@/lib/mail");
      await sendApplicationConfirmationEmail(
        user.email,
        user.user_metadata?.full_name || "Student",
        title,
        "Event",
        companyName
      );
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/events");
    revalidatePath("/opportunities/events");

    return {
      success: true,
      data: { applicationId: appData.id },
      message: "Your RSVP has been confirmed successfully!",
    };
  } catch (error) {
    console.error("Unexpected error in submitEventRSVP:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}