/**
 * @file Centralized type definitions for the application's data models.
 */

// ========== GENERIC & SHARED TYPES ==========

/**
 * Represents the essential profile of a company, used across different models.
 */
export interface CompanyProfile {
  company_name: string;
  logo_url?: string;
  cover_image_url?: string;
}

// ========== DASHBOARD-SPECIFIC TYPES ==========

/**
 * Defines the structure for an Event object fetched from the API.
 */
export interface Event {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  event_picture_url: string;
  company: CompanyProfile | null;
}

/**
 * Defines the structure for a Program object fetched from the API.
 * NOTE: For full functionality, the API should be updated to join and include
 * a nested `company: CompanyProfile` object, similar to the Event type.
 */
export interface Program {
  id: string;
  title: string;
  description: string;
  company_id: string;
  program_category: string;
  start_date: string;
  end_date: string;
  application_deadline: string | null;
  location: string | null;
  type: string;
  program_picture_url: string;
  required_skills: string[] | null;
  // This should be added to your API response for consistency:
  company?: CompanyProfile | null;
}

/**
 * Defines the employer profile data nested within an Internship.
 */
export interface EmployerProfile {
  company_name?: string;
  logoColor?: string;
  headQuarterImage?: string;
}

/**
 * Defines the structure for an Internship object fetched from the API.
 */
export interface Internship {
  id: string;
  title: string;
  company_profiles?: EmployerProfile;
  company: string;
  logoColor: string;
  headQuarterImage: string;
  location: string;
  type: string;
  category: string;
  cover_image_url?: string;
}
