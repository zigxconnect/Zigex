export interface UserProfile {
  name: string;
  avatarUrl: string | null;
  initials: string;
  university: string;
  skills: string[];
  coverImageUrl: string;
  profile: Profile;
  stats?: {
    applications: number;
    profileViews: number;
  };
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  university: string;
  field_of_study: string;
  graduation_year: number;
  skills: string[] | null;
  created_at: string;
  first_name: string;
  profile_picture: string | null;
  phone: string;
  date_of_birth: string | null;
  location: string;
  about: string;
  degree: string;
  gpa: number;
  hard_skills: string[];
  soft_skills: string[];
  languages: string[];
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;
  has_internship_experience: boolean;
  previous_roles: string;
  preferred_industries: string[];
  preferred_roles: string[] | null;
  work_mode: string[];
  availability: string | null;
  expected_stipend: number | null;
  interests: string[];
  achievements: string;
  University: string | null; // kept uppercase as in your data
  accommodations: string;
  updated_at: string;
  avatar_url: string | null;
  email: string;
  last_name: string;
  profile_status: string;
  role: string;
}
