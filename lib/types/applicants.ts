// file: src/lib/types/applicants.ts

/**
 * Defines the allowed statuses for an application.
 * These values MUST match the 'Applications_status_check' constraint in your database.
 */
export type ApplicantStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected"
  | "rsvp_confirmed";

export type ApplicationType = "internship" | "program" | "event";

/**
 * Defines the structure for a single applicant object used throughout the frontend.
 * Includes ALL form fields that candidates submit.
 */
export type Applicant = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  internshipTitle: string;
  internshipId: string | null;
  opportunityDescription?: string;
  appliedDate: string;
  status: ApplicantStatus;
  resumeUrl: string | null;
  coverLetter: string | null;

  // Application Type
  applicationType: ApplicationType;

  // Form Fields - Internship
  duration?: string;
  department?: string;
  workMode?: string;

  // Form Fields - Program/Event
  level?: string;
  expectations?: string;
  comments?: string;

  // Form Fields - Event RSVP
  rsvpStatus?: boolean;

  // User Info
  studentId?: string;
  userId?: string;

  // Payment Status (for paid programs)
  isPaid?: boolean;
  programId?: string | null;
};
