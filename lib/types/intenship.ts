export interface FullInternship {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  is_paid: boolean;
  created_at: string;
  deadline: string | null;
  compensation: string | null;
  type: string;
  start_date: string | null;
  category: string;
  company_profiles: {
    email: string;
    logo_url: string | null;
    website_url: string | null;
    company_name: string;
    cover_image_url: string | null;
  } | null;
}
