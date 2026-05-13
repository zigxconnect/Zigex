// lib/actions/feed.action.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getAnnouncementsForStudent } from "../announcement.actions";

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

/**
 * Create Supabase client - uses cookies()
 * This function is NOT cached
 */
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie errors handled silently in Server Actions
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Cookie errors handled silently in Server Actions
          }
        },
      },
    }
  );
}

/**
 * Get internships with React cache
 * Deduplicates requests in the same render pass
 */
export const getInternships = cache(async (searchQuery?: string) => {
  try {
    const supabase = await createClient();

    let internships;
    let error;

    if (searchQuery) {
      const { data, error: rpcError } = await supabase.rpc(
        "search_internships",
        {
          search_term: searchQuery,
        }
      );
      internships = data;
      error = rpcError;
    } else {
      const { data, error: fetchError } = await supabase
        .from("internships")
        .select(
          `
          id,
          title,
          location,
          type,
          category,
          description,
          created_at,
          cover_image_url,
          company: company_profiles (
            id,
            company_name,
            logo_url,
            cover_image_url
          )
        `
        )
        .order("created_at", { ascending: false });
      internships = data;
      error = fetchError;
    }

    if (error) {
      console.error("Error fetching internships:", error);
      return { data: [], error: "Failed to fetch internships" };
    }

    return { data: internships || [], error: null };
  } catch (error) {
    console.error("Internships fetch error:", error);
    return { data: [], error: "Failed to fetch internships" };
  }
});

/**
 * Get events with React cache
 */
export const getEvents = cache(async (searchQuery?: string) => {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("event")
      .select("*, company:company_profiles (id, company_name, logo_url)")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return { data: [], error: "Failed to fetch events" };
    }

    return { data: events || [], error: null };
  } catch (error) {
    console.error("Events fetch error:", error);
    return { data: [], error: "Failed to fetch events" };
  }
});

/**
 * MODIFIED: Get programs with React cache, status checks, and custom sorting
 */
export const getPrograms = cache(async (searchQuery?: string) => {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("programs")
      .select("*, company:company_profiles (id, company_name, logo_url)");
    // REMOVED: .order("created_at", { ascending: false });
    // Sorting will be handled in the code now.

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    const { data: programs, error } = await query;

    if (error) {
      console.error("Error fetching programs:", error);
      return { data: [], error: "Failed to fetch programs" };
    }

    const now = new Date();
    const weekendOfCodeProgramTitle = "Weekend of Code";

    // 1. Determine if each program is open or closed
    const programsWithStatus = (programs || []).map((program) => ({
      ...program,
      isOpen: program.end_date ? new Date(program.end_date) > now : true, // Assumes open if no end date
    }));

    // 2. Separate the "Weekend of Code" program
    let pinnedProgram: Program | null = null;
    const otherPrograms: Program[] = [];

    programsWithStatus.forEach((program) => {
      if (program.title === weekendOfCodeProgramTitle) {
        pinnedProgram = program as Program;
      } else {
        otherPrograms.push(program as Program);
      }
    });

    // 3. Sort the remaining programs: open first, then closed
    otherPrograms.sort((a, b) => {
      if (a.isOpen && !b.isOpen) return -1; // a (open) comes before b (closed)
      if (!a.isOpen && b.isOpen) return 1;  // b (open) comes before a (closed)
      // Optional: if both are open or both are closed, sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // 4. Combine the lists: pinned program first, then the sorted programs
    const sortedPrograms = pinnedProgram ? [pinnedProgram, ...otherPrograms] : otherPrograms;

    return { data: sortedPrograms, error: null };
  } catch (error) {
    console.error("Programs fetch error:", error);
    return { data: [], error: "Failed to fetch programs" };
  }
});

/**
 * NEW: Get a consolidated list of companies for the sidebar directory
 */
export const getCompanyDirectory = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: companies, error } = await supabase
      .from("company_profiles")
      .select("id, company_name, logo_url, email, website_url")
      .order("company_name", { ascending: true });

    if (error) {
      console.error("Error fetching company directory:", error);
      return [];
    }

    return companies || [];
  } catch (error) {
    console.error("Company directory fetch error:", error);
    return [];
  }
});

/**
 * Get all feed data in parallel
 * This is the main function to use in your components
 * Uses React cache to deduplicate requests
 */
export const getAllFeedData = cache(async (searchQuery?: string, studentId?: string) => {
  try {
    // Fetch all data in parallel for better performance
    const [internshipsResult, eventsResult, programsResult, announcements, companies] =
      await Promise.all([
        getInternships(searchQuery),
        getEvents(searchQuery),
        getPrograms(searchQuery),
        studentId ? getAnnouncementsForStudent(studentId) : Promise.resolve([]),
        getCompanyDirectory()
      ]);

    // Collect any errors
    const errors = [
      internshipsResult.error,
      eventsResult.error,
      programsResult.error,
    ].filter(Boolean);

    return {
      internships: internshipsResult.data,
      events: eventsResult.data,
      programs: programsResult.data,
      announcements: announcements || [],
      companies: companies || [],
      error: errors.length > 0 ? errors.join(", ") : null,
    };
  } catch (error) {
    console.error("Error in getAllFeedData:", error);
    return {
      internships: [],
      events: [],
      programs: [],
      announcements: [],
      error: "Failed to fetch feed data",
    };
  }
});

/**
 * NEW: Get platform statistics for the dashboard
 */
export const getPlatformStats = cache(async () => {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. Active Programs & Internships
    const [internshipsRes, programsRes, studentsRes, companiesRes, ratingsRes] = await Promise.all([
      supabase.from("internships").select("id", { count: "exact", head: true }),
      supabase.from("programs").select("id", { count: "exact", head: true }).gt("end_date", now),
      supabase.from("student_profiles").select("id", { count: "exact", head: true }),
      supabase.from("company_profiles").select("id", { count: "exact", head: true }),
      supabase.from("intern_logs").select("experience_rating").not("experience_rating", "is", null)
    ]);

    // Active programs = all internships (usually ongoing) + open programs
    const activePrograms = (internshipsRes.count || 0) + (programsRes.count || 0);
    const totalStudents = studentsRes.count || 0;
    const totalCompanies = companiesRes.count || 0;

    // Calculate Satisfaction Rate from logs
    let satisfactionRate = 95; // Default fallback
    if (ratingsRes.data && ratingsRes.data.length > 0) {
      const avg = ratingsRes.data.reduce((acc, curr) => acc + (curr.experience_rating || 0), 0) / ratingsRes.data.length;
      // experience_rating is 1-5, convert to percentage
      satisfactionRate = Math.round((avg / 5) * 100);
    }

    return {
      activePrograms: activePrograms > 0 ? `${activePrograms}+` : "12+",
      students: totalStudents > 1000 ? `${(totalStudents / 1000).toFixed(1)}K+` : `${totalStudents}+`,
      satisfactionRate: `${satisfactionRate}%`,
      partnerCompanies: totalCompanies > 0 ? `${totalCompanies}+` : "50+",
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return {
      activePrograms: "12+",
      students: "2.5K+",
      satisfactionRate: "95%",
      partnerCompanies: "50+",
    };
  }
});