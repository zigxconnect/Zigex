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
  coverLetter: string | null;
  // Extended profile fields
  university?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  hardSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  location?: string;
  about?: string;
  // Application specific fields
  applicationType?: "internship" | "program" | "event";
  duration?: string;
  department?: string;
  workMode?: string;
  level?: string;
  expectations?: string;
  comments?: string;
  rsvpStatus?: boolean;
};
