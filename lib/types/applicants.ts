export type ApplicantStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Requesting Info";

export type Applicant = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  internshipTitle: string;
  internshipId: string;
  appliedDate: string;
  status: ApplicantStatus;
  resumeUrl: string;
  coverLetter: string;
};
