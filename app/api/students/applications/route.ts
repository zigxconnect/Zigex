import { ApiClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { validate as isUUID } from "uuid";
import { sendApplicationConfirmation, sendApplicationAlert, sendEventRSVPConfirmation, sendNewApplicationNotification } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getSession } from "@/lib/api/auth";
import { getFeedItem } from "@/lib/api/services/feed";
import {
  COVER_LETTER_MIME_TYPES,
  CV_MIME_TYPES,
  applicationErrorResponse,
  createApplication,
  getApplicantProfile,
  uploadCoverLetter,
  uploadResume,
  type ApplicantProfile,
} from "@/lib/api/services/applications";

/**
 * Unified apply endpoint used by the apply modals (multipart FormData).
 *
 * Creates the application on the backend (POST /applications), uploads the
 * documents (POST /uploads/cv, /uploads/cover-letter/{id}), then sends the
 * same confirmation emails / WhatsApp alerts as before.
 *
 * In-app notifications are no longer inserted here: the admin backend creates
 * notifications natively (see the backend's deprecated /notifications/broadcast).
 */

type Applicant = { email: string; fullName: string; phone?: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ZIGEX_ADMIN_EMAILS = "zigex.connect@gmail.com,zigexconnect.com@gmail.com";

// Backend enum is remote | onsite | hybrid.
const WORK_MODE_MAP: Record<string, "remote" | "onsite" | "hybrid"> = {
  "On-site": "onsite",
  Remote: "remote",
  Hybrid: "hybrid",
};

/** "3-6 months" → 6; "Flexible" → undefined */
function durationMonths(duration: string | null): number | undefined {
  const numbers = duration?.match(/\d+/g)?.map(Number);
  return numbers?.length ? Math.max(...numbers) : undefined;
}

/** Form fields the backend has no column for are kept as labelled lines in `comments`. */
function joinComments(...parts: [label: string, value: FormDataEntryValue | null][]) {
  const lines = parts
    .filter(([, value]) => typeof value === "string" && value.trim())
    .map(([label, value]) => (label ? `${label}: ${value}` : String(value)));
  return lines.length ? lines.join("\n") : undefined;
}

const text = (formData: FormData, key: string) => (formData.get(key) as string | null) || undefined;

function validateFile(file: File | null, label: string, allowed: string[], allowedLabel: string) {
  if (!file || file.size === 0) return `A ${label} file is required.`;
  if (file.size > MAX_FILE_SIZE) return `${label[0].toUpperCase()}${label.slice(1)} file size exceeds 10MB limit.`;
  if (!allowed.includes(file.type)) return `The ${label} must be a ${allowedLabel} document.`;
  return null;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Backend bug (Oct 2026): POST /applications answers every program and event
 * application with 400 "internship_id is required". Reported in
 * docs/backend/open-requests.md. Until it's fixed, tell the student
 * plainly instead of showing the backend's internal message.
 */
function friendlyMessage(message: string, kind: "program" | "event") {
  if (/internship_id is required/i.test(message)) {
    return kind === "event"
      ? "RSVPs for events aren't working on Zigex right now. Our team is fixing it; your answers are saved, so try again later."
      : "Registration for programs isn't working on Zigex right now. Our team is fixing it; your answers are saved, so try again later.";
  }
  return message;
}

// --- Application Handlers ---

const handleInternshipApplication = async (applicant: Applicant, formData: FormData) => {
  const internship_id = formData.get("internship_id") as string;
  if (!isUUID(internship_id)) return fail("A valid Internship ID is required.", 400);

  const posting = await getFeedItem("internships", internship_id);
  if (!posting) return fail("The internship you are applying for could not be found.", 404);
  if (posting.deadline && new Date(posting.deadline) < new Date()) {
    return fail("The deadline for this internship has passed.", 400);
  }

  const resume = formData.get("resume") as File | null;
  const coverLetter = formData.get("cover_letter") as File | null;
  const fileError =
    validateFile(resume, "resume", CV_MIME_TYPES, "PDF, DOC or DOCX") ??
    validateFile(coverLetter, "cover letter", COVER_LETTER_MIME_TYPES, "PDF");
  if (fileError) return fail(fileError, 400);

  const location = text(formData, "location");
  let application;
  try {
    application = await createApplication({
      application_type: "internship",
      internship_id,
      department: text(formData, "department"),
      location,
      work_mode: location ? WORK_MODE_MAP[location] ?? "onsite" : undefined,
      duration_months: durationMonths(text(formData, "duration") ?? null),
      expectations: text(formData, "expectations"),
      comments: joinComments(["Preferred duration", formData.get("duration")]),
    });
  } catch (error) {
    const { error: message, status } = applicationErrorResponse(error, "Failed to submit internship application.");
    return fail(message, status);
  }

  // The application exists now; a failed upload is reported but does not undo it.
  const uploadWarnings: string[] = [];
  const [cvResult, coverResult] = await Promise.allSettled([
    uploadResume(application.id, resume!),
    uploadCoverLetter(application.id, coverLetter!),
  ]);
  if (cvResult.status === "rejected") {
    console.error("Resume upload error:", cvResult.reason);
    uploadWarnings.push("Your resume could not be uploaded. Please upload it from your profile.");
  }
  if (coverResult.status === "rejected") {
    console.error("Cover letter upload error:", coverResult.reason);
    uploadWarnings.push("Your cover letter could not be uploaded.");
  }

  const company = posting.company;
  await safely(notifyApplication(applicant, {
    title: posting.title,
    type: "Internship",
    status: "pending",
    companyName: company?.company_name,
    companyEmail: company?.email,
    whatsApp: `✅ *Application Received!*\n\nHi ${firstName(applicant)}, your application for the *${posting.title}* internship at ${company?.company_name} has been received and is under review. Good luck! 🚀`,
  }));

  return NextResponse.json(
    {
      message: "Internship application submitted successfully!",
      applicationId: application.id,
      ...(uploadWarnings.length ? { warnings: uploadWarnings } : {}),
    },
    { status: 201 }
  );
};

const handleProgramApplication = async (applicant: Applicant, formData: FormData) => {
  const program_id = formData.get("program_id") as string;
  if (!isUUID(program_id)) return fail("A valid Program ID is required.", 400);

  const posting = await getFeedItem("programs", program_id);
  if (!posting) return fail("The program you are applying for could not be found.", 404);

  let application;
  try {
    application = await createApplication({
      application_type: "program",
      program_id,
      expectations: text(formData, "expectations"),
      level: text(formData, "level"),
      // Also in comments until the backend confirms it stores `level`.
      comments: joinComments(["Level", formData.get("level")], ["", formData.get("comments")]),
    });
  } catch (error) {
    const { error: message, status } = applicationErrorResponse(error, "Failed to submit program application.");
    return fail(friendlyMessage(message, "program"), status);
  }

  const company = posting.company;
  await safely(notifyApplication(applicant, {
    title: posting.title,
    type: "Program",
    status: "pending",
    companyName: company?.company_name,
    companyEmail: company?.email,
    whatsApp: `🚀 *Program Application Received!*\n\nHi ${firstName(applicant)}, you've successfully applied for the *${posting.title}* program. We'll notify you once your application is reviewed. Stay tuned! ✨`,
  }));

  return NextResponse.json(
    { message: "Program application submitted successfully!", applicationId: application.id },
    { status: 201 }
  );
};

const handleEventRSVP = async (applicant: Applicant, formData: FormData) => {
  const event_id = formData.get("event_id") as string;
  if (!isUUID(event_id)) return fail("A valid Event ID is required.", 400);

  const posting = await getFeedItem("events", event_id);
  if (!posting) return fail("The event you are RSVPing to could not be found.", 404);

  let application;
  try {
    application = await createApplication({
      application_type: "event",
      event_id,
      expectations: text(formData, "expectations"),
      rsvp_status: text(formData, "rsvp_status") ?? "going",
      comments: text(formData, "comments"),
    });
  } catch (error) {
    const { error: message, status } = applicationErrorResponse(error, "Failed to submit RSVP.");
    return fail(friendlyMessage(message, "event"), status);
  }

  const company = posting.company;
  const companyName = company?.company_name || "ZIGEX Partner";

  await safely(
    (async () => {
  await sendApplicationAlert({
        adminEmail: ZIGEX_ADMIN_EMAILS,
        studentName: applicant.fullName,
        studentEmail: applicant.email,
        opportunityTitle: posting.title,
        opportunityType: "Event",
        status: "accepted",
        companyName,
      });
      if (company?.email) {
        await sendNewApplicationNotification({
          companyEmail: company.email,
          companyName,
          studentName: applicant.fullName,
          studentEmail: applicant.email,
          opportunityTitle: posting.title,
          opportunityType: "Event",
        });
      }
      const emailResult = await sendEventRSVPConfirmation({
        email: applicant.email,
        name: applicant.fullName,
        eventName: posting.title,
        companyName,
        eventDate: posting.start_date ? new Date(posting.start_date).toDateString() : "TBA",
        eventLocation: posting.location || "TBA",
        eventRequirements: posting.description,
      });
      console.log(`[RSVP Email] Sent to ${applicant.email}. Success: ${emailResult.success}. Error: ${emailResult.error || "None"}`);
    
      if (applicant.phone) {
        await sendWhatsAppMessage(
          applicant.phone,
          `🎟️ *RSVP Confirmed!*\n\nHi ${firstName(applicant)}, your spot for *${posting.title}* is confirmed! We've sent the details to your email. See you there! 🙌`
        );
      }
    })()
  );

  return NextResponse.json(
    { message: "RSVP submitted successfully!", applicationId: application.id },
    { status: 201 }
  );
};

// --- Notifications (email + WhatsApp) ---

/**
 * Notifications are best effort: the application is already saved, so a
 * slow email or WhatsApp provider must not turn the student's success into
 * an error (or tempt them to apply twice).
 */
async function safely(task: Promise<unknown>) {
  try {
    await Promise.race([task, new Promise((resolve) => setTimeout(resolve, 8000))]);
  } catch (error) {
    console.error("[applications] notification failed (application was saved):", error);
  }
}

/** The backend or network didn't answer in time. */
function isTimeout(error: unknown) {
  const e = error as { name?: string; code?: string; cause?: { code?: string }; message?: string } | null;
  return Boolean(
    e &&
      (e.name === "TimeoutError" ||
        e.name === "AbortError" ||
        e.code === "UND_ERR_CONNECT_TIMEOUT" ||
        e.cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
        /fetch failed|timeout/i.test(e.message ?? ""))
  );
}

const firstName = (applicant: Applicant) => applicant.fullName.split(" ")[0];

async function notifyApplication(
  applicant: Applicant,
  opportunity: {
    title: string;
    type: "Internship" | "Program";
    status: string;
    companyName?: string;
    companyEmail?: string;
    whatsApp: string;
  }
) {
  const companyName = opportunity.companyName || "ZIGEX Partner";

  await sendApplicationAlert({
    adminEmail: ZIGEX_ADMIN_EMAILS,
    studentName: applicant.fullName,
    studentEmail: applicant.email,
    opportunityTitle: opportunity.title,
    opportunityType: opportunity.type,
    status: opportunity.status,
    // Empty string = no "via <company>" line, same as the old undefined.
    companyName: opportunity.companyName ?? "",
  });

  if (opportunity.companyEmail) {
    await sendNewApplicationNotification({
      companyEmail: opportunity.companyEmail,
      companyName,
      studentName: applicant.fullName,
      studentEmail: applicant.email,
      opportunityTitle: opportunity.title,
      opportunityType: opportunity.type,
    });
  }

  await sendApplicationConfirmation({
    email: applicant.email,
    name: applicant.fullName,
    opportunityTitle: opportunity.title,
    opportunityType: opportunity.type,
    companyName,
    isRSVP: false,
  });

  if (applicant.phone) {
    await sendWhatsAppMessage(applicant.phone, opportunity.whatsApp);
  }
}

function toApplicant(session: { email: string }, profile: ApplicantProfile | null): Applicant {
  return {
    email: profile?.email || session.email,
    fullName: profile?.full_name || session.email.split("@")[0],
    phone: profile?.phone,
  };
}

// --- Main Handler ---
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Unauthorized. Please log in.", 401);

    const profile = await getApplicantProfile();
    if (!profile) return fail("Student profile not found.", 404);
    const applicant = toApplicant(session, profile);

    const formData = await request.formData();

    if (formData.has("internship_id")) return await handleInternshipApplication(applicant, formData);
    if (formData.has("program_id")) return await handleProgramApplication(applicant, formData);
    if (formData.has("event_id")) return await handleEventRSVP(applicant, formData);

    return fail("Invalid application type. Missing 'internship_id', 'program_id', or 'event_id'.", 400);
  } catch (error: any) {
    console.error("[applications] submission failed:", error);
    if (isTimeout(error) || (error instanceof ApiClientError && error.status >= 502)) {
      return fail("Zigex couldn't reach its server just now. Nothing was sent; your answers are kept. Try again in a moment.", 503);
    }
    return fail("Something went wrong on our side. Nothing was sent; your answers are kept. Try again in a moment.", 500);
  }
}
