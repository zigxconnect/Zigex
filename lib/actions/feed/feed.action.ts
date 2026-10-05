// lib/actions/feed.action.ts
"use server";

import { cache } from "react";
import { listFeed } from "@/lib/api/services/feed";

// Types
export type Internship = {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  description?: string;
  created_at: string;
  cover_image_url?: string;
  company: {
    id: string;
    company_name: string;
    logo_url: string;
    cover_image_url: string;
  };
};

export type Event = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description?: string;
  event_picture_url?: string;
  created_at: string;
  company: {
    id: string;
    company_name: string;
    logo_url: string;
  };
};

export type Program = {
  id: string;
  title: string;
  program_category: string;
  start_date: string;
  end_date: string;
  location: string;
  description?: string;
  program_picture_url?: string;
  created_at: string;
  company: {
    id: string;
    company_name: string;
    logo_url: string;
  };
  // ADDED: isOpen property to determine if the program is locked
  isOpen: boolean;
};

const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

/**
 * Get visible internships (GET /feed/internships)
 */
export const getInternships = cache(async (searchQuery?: string) => {
  try {
    const data = (await listFeed("internships", searchQuery)) as Internship[];
    return { data: data.sort(byNewest), error: null };
  } catch (error: any) {
    console.error("Internships fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch internships" };
  }
});

/**
 * Get visible events (GET /feed/events)
 */
export const getEvents = cache(async (searchQuery?: string) => {
  try {
    const data = (await listFeed("events", searchQuery)) as Event[];
    return { data: data.sort(byNewest), error: null };
  } catch (error: any) {
    console.error("Events fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch events" };
  }
});

/**
 * Get visible programs (GET /feed/programs)
 * "Weekend of Code" is pinned first, then open programs, then closed ones.
 */
export const getPrograms = cache(async (searchQuery?: string) => {
  try {
    const now = new Date();
    const weekendOfCodeProgramTitle = "Weekend of Code";

    const programs = ((await listFeed("programs", searchQuery)) as Program[]).map((program) => ({
      ...program,
      isOpen: program.end_date ? new Date(program.end_date) > now : true,
    }));

    const pinnedProgram = programs.find((p) => p.title === weekendOfCodeProgramTitle);
    const otherPrograms = programs
      .filter((p) => p !== pinnedProgram)
      .sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || byNewest(a, b));

    return { data: pinnedProgram ? [pinnedProgram, ...otherPrograms] : otherPrograms, error: null };
  } catch (error: any) {
    console.error("Programs fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch programs" };
  }
});

/**
 * Company directory for the feed sidebar.
 * TODO(backend): no endpoint yet (see "Missing endpoints: Company profiles").
 */
export const getCompanyDirectory = cache(async () => {
  return [] as { id: string; company_name: string; logo_url: string; email?: string; website_url?: string }[];
});

/**
 * Get all feed data in parallel
 * This is the main function to use in your components
 * Uses React cache to deduplicate requests
 */
export const getAllFeedData = cache(async (searchQuery?: string, _studentId?: string) => {
  const [internshipsResult, eventsResult, programsResult, companies] = await Promise.all([
    getInternships(searchQuery),
    getEvents(searchQuery),
    getPrograms(searchQuery),
    getCompanyDirectory(),
  ]);

  const errors = [internshipsResult.error, eventsResult.error, programsResult.error].filter(Boolean);

  return {
    internships: internshipsResult.data,
    events: eventsResult.data,
    programs: programsResult.data,
    // TODO(backend): announcements have no endpoint yet (see "Missing endpoints: Intern workspace").
    announcements: [] as any[],
    companies,
    error: errors.length > 0 ? errors.join(", ") : null,
  };
});

/**
 * Landing-page statistics.
 * TODO(backend): no endpoint yet (see "Missing endpoints: Platform stats") — shows the static fallback.
 */
export const getPlatformStats = async () => ({
  activePrograms: "12+",
  students: "2.5K+",
  satisfactionRate: "95%",
  partnerCompanies: "50+",
});
