/**
 * This is the single source of truth for the shape of our student profile form data.
 * It matches the updatable columns in the 'student_profiles' table.
 */
export interface ProfileFormData {
  // From Step 1: Personal Information
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  about: string;

  // From Step 2: Education
  university: string;
  degree: string;
  field_of_study: string;
  graduation_year: string;
  gpa: number | null;

  // From Step 3: Skills
  hard_skills: string[];
  soft_skills: string[];
  languages: string[];
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;

  // From Step 4: Experience
  previous_roles: string; // Simplified to a textarea for now
  preferred_industries: string[];
  work_mode: string[];

  // From Step 5: Additional Info
  interests: string[];
  achievements: string;
  accommodations: string;
}
