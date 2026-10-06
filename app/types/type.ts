export interface UserProfile {
  name: string;
  avatarUrl: string | null;
  initials: string;
  university: string | null;
  skills: string[] | null;
  coverImageUrl: string;
  profile: Profile;
  stats?: {
    applications: number;
    profileViews: number;
  };
}

// Deferred-completion onboarding (see supabase/migrations/20260714_deferred_profile_completion.sql)
// means a new student_profiles row starts with only id/user_id/full_name/created_at/
// email/role/profile_status populated — every other column is legitimately null
// until the user fills in /dashboard/edit-profile, so it's typed nullable here.
interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  university: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  skills: string[] | null;
  created_at: string;
  first_name: string | null;
  profile_picture: string | null;
  phone: string | null;
  date_of_birth: string | null;
  location: string | null;
  about: string | null;
  degree: string | null;
  gpa: number | null;
  hard_skills: string[] | null;
  soft_skills: string[] | null;
  languages: string[] | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  has_internship_experience: boolean;
  previous_roles: string[] | null;
  preferred_industries: string[] | null;
  preferred_roles: string[] | null;
  work_mode: string | null;
  availability: string | null;
  expected_stipend: string | null;
  interests: string[] | null;
  achievements: string[] | null;
  University: string | null; // kept uppercase as in your data
  accommodations: string | null;
  updated_at: string;
  avatar_url: string | null;
  email: string;
  last_name: string | null;
  profile_status: string;
  role: string;
}
