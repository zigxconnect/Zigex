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

/**
 * Defines the structure for a single applicant object used throughout the frontend.
 */
export type Applicant = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  internshipTitle: string;
  internshipId: string | null;
  appliedDate: string;
  status: ApplicantStatus;
  resumeUrl: string | null;
  coverLetter: string | null; // This property holds the cover_letter_url
};
