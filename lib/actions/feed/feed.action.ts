// lib/actions/feed.action.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

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
      .select("*, company:company_profiles (company_name, logo_url)")
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
      .select("*, company:company_profiles (company_name, logo_url)");
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
 * Get all feed data in parallel
 * This is the main function to use in your components
 * Uses React cache to deduplicate requests
 */
export const getAllFeedData = cache(async (searchQuery?: string) => {
  try {
    // Fetch all data in parallel for better performance
    const [internshipsResult, eventsResult, programsResult] =
      await Promise.all([
        getInternships(searchQuery),
        getEvents(searchQuery),
        getPrograms(searchQuery),
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
      error: errors.length > 0 ? errors.join(", ") : null,
    };
  } catch (error) {
    console.error("Error in getAllFeedData:", error);
    return {
      internships: [],
      events: [],
      programs: [],
      error: "Failed to fetch feed data",
    };
  }
});