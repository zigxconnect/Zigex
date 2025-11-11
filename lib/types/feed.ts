// lib/types/feed.ts
export type FeedType = "internships" | "programs" | "events";

export interface BaseFeedItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  created_at: string;
  company_id?: string;
  company?: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  is_live?: boolean;
}

export interface Internship extends BaseFeedItem {
  duration?: string;
  department?: string;
  type?: string;
  internship_picture_url?: string;
  cover_image_url?: string;
  logo_url?: string;
}

export interface Program extends BaseFeedItem {
  duration?: string;
  format?: string;
  level?: string;
  type?: string;
  program_category?: string;
  program_picture_url?: string;
  start_date?: string;
  end_date?: string;
  organizer?: string;
}

export interface Event extends BaseFeedItem {
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  format?: string;
  event_picture_url?: string;
  max_participants?: number;
  registration_deadline?: string;
}

export type FeedItem = (Internship | Program | Event) & { _type: FeedType };

export interface FeedConfig {
  type: FeedType;
  apiEndpoint: string;
  label: string;
  color: string;
}

export const FEED_CONFIGS: Record<FeedType, FeedConfig> = {
  internships: {
    type: "internships",
    apiEndpoint: "/api/students/internships",
    label: "Internships",
    color: "blue",
  },
  programs: {
    type: "programs",
    apiEndpoint: "/api/students/programs",
    label: "Programs",
    color: "purple",
  },
  events: {
    type: "events",
    apiEndpoint: "/api/students/events",
    label: "Events",
    color: "green",
  },
};