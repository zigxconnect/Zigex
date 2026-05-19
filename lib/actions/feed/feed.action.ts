// lib/actions/feed.action.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getAnnouncementsForStudent } from "../announcement.actions";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

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
 * Get internships with unstable_cache and supabaseAdmin
 */
export const getInternships = cache(async (searchQuery?: string) => {
  try {
    const fetchCached = unstable_cache(
      async (query?: string) => {
        let internships;
        let error;

        if (query) {
          const { data, error: rpcError } = await supabaseAdmin.rpc(
            "search_internships",
            {
              search_term: query,
            }
          );
          internships = data;
          error = rpcError;
        } else {
          const { data, error: fetchError } = await supabaseAdmin
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
          throw new Error(error.message || "Failed to fetch internships");
        }
        return internships || [];
      },
      ["internships-feed", searchQuery || ""],
      { revalidate: 60, tags: ["internships"] }
    );

    const data = await fetchCached(searchQuery);
    return { data, error: null };
  } catch (error: any) {
    console.error("Internships fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch internships" };
  }
});

/**
 * Get events with unstable_cache and supabaseAdmin
 */
export const getEvents = cache(async (searchQuery?: string) => {
  try {
    const fetchCached = unstable_cache(
      async (query?: string) => {
        let dbQuery = supabaseAdmin
          .from("event")
          .select("*, company:company_profiles (id, company_name, logo_url)")
          .order("created_at", { ascending: false });

        if (query) {
          dbQuery = dbQuery.or(
            `title.ilike.%${query}%,description.ilike.%${query}%`
          );
        }

        const { data: events, error } = await dbQuery;

        if (error) {
          throw new Error(error.message || "Failed to fetch events");
        }
        return events || [];
      },
      ["events-feed", searchQuery || ""],
      { revalidate: 60, tags: ["events"] }
    );

    const data = await fetchCached(searchQuery);
    return { data, error: null };
  } catch (error: any) {
    console.error("Events fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch events" };
  }
});

/**
 * Get programs with unstable_cache and supabaseAdmin
 */
export const getPrograms = cache(async (searchQuery?: string) => {
  try {
    const fetchCached = unstable_cache(
      async (query?: string) => {
        let dbQuery = supabaseAdmin
          .from("programs")
          .select("*, company:company_profiles (id, company_name, logo_url)");

        if (query) {
          dbQuery = dbQuery.or(
            `title.ilike.%${query}%,description.ilike.%${query}%`
          );
        }

        const { data: programs, error } = await dbQuery;

        if (error) {
          throw new Error(error.message || "Failed to fetch programs");
        }

        const now = new Date();
        const weekendOfCodeProgramTitle = "Weekend of Code";

        // Determine if each program is open or closed
        const programsWithStatus = (programs || []).map((program) => ({
          ...program,
          isOpen: program.end_date ? new Date(program.end_date) > now : true,
        }));

        // Separate the "Weekend of Code" program
        let pinnedProgram: Program | null = null;
        const otherPrograms: Program[] = [];

        programsWithStatus.forEach((program) => {
          if (program.title === weekendOfCodeProgramTitle) {
            pinnedProgram = program as Program;
          } else {
            otherPrograms.push(program as Program);
          }
        });

        // Sort the remaining programs: open first, then closed
        otherPrograms.sort((a, b) => {
          if (a.isOpen && !b.isOpen) return -1;
          if (!a.isOpen && b.isOpen) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return pinnedProgram ? [pinnedProgram, ...otherPrograms] : otherPrograms;
      },
      ["programs-feed", searchQuery || ""],
      { revalidate: 60, tags: ["programs"] }
    );

    const data = await fetchCached(searchQuery);
    return { data, error: null };
  } catch (error: any) {
    console.error("Programs fetch error:", error);
    return { data: [], error: error.message || "Failed to fetch programs" };
  }
});

/**
 * Get a consolidated list of companies for the sidebar directory
 */
export const getCompanyDirectory = cache(async () => {
  try {
    const fetchCached = unstable_cache(
      async () => {
        const { data: companies, error } = await supabaseAdmin
          .from("company_profiles")
          .select("id, company_name, logo_url, email, website_url")
          .order("company_name", { ascending: true });

        if (error) {
          throw new Error(error.message || "Error fetching company directory");
        }

        return companies || [];
      },
      ["company-directory"],
      { revalidate: 300, tags: ["companies"] }
    );

    return await fetchCached();
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
 * Optimized with unstable_cache and supabaseAdmin so it doesn't query the DB on every request.
 */
export const getPlatformStats = unstable_cache(async () => {
  try {
    const now = new Date().toISOString();

    // 1. Active Programs & Internships
    const [internshipsRes, programsRes, studentsRes, companiesRes, ratingsRes] = await Promise.all([
      supabaseAdmin.from("internships").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("programs").select("id", { count: "exact", head: true }).gt("end_date", now),
      supabaseAdmin.from("student_profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("company_profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("intern_logs").select("experience_rating").not("experience_rating", "is", null)
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
}, ["platform-stats-cache"], { revalidate: 3600 });