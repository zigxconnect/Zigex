// lib/actions/feed-detail.actions.ts
"use server";

import { cache } from "react";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { isUUID } from "@/lib/utils";

export type FeedType = "internships" | "programs" | "events";

/**
 * Get a single feed item by ID
 * Searches across all feed types using cached admin query
 */
// Helper to match slug in SQL
const matchSlug = (table: string, slug: string) => {
  // This is a bit of a hack since we don't have a slug column.
  // We'll replace dashes with spaces and use ILIKE.
  // It won't be perfect for titles with actual dashes but it's a good fallback.
  return `title.ilike.${slug.replace(/-/g, ' ')}`;
};

/**
 * Get a single feed item by ID or Slug
 * Searches across all feed types using cached admin query
 */
const fetchFeedItemById = async (idOrSlug: string) => {
  try {
    const isIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    // Helper function to create a search pattern from slug
    // Converts "seed-cohort-test-2026" to pattern that matches "Seed Cohort Test 2026"
    const createSearchPattern = (slug: string) => {
      // Replace dashes with wildcards for flexible matching
      // Also handle numbers that might be at the end (like years)
      return slug.replace(/-/g, ' ').trim();
    };

    const searchTerm = isIdUUID ? idOrSlug : createSearchPattern(idOrSlug);

    // Try to find in internships
    let internshipQuery = supabaseAdmin
      .from("internships")
      .select(`
        *,
        company_profiles (
          id, company_name, logo_url, cover_image_url, location, website_url
        )
      `);

    if (isIdUUID) {
      internshipQuery = internshipQuery.eq("id", idOrSlug);
    } else {
      // Use case-insensitive search that matches the unslugified title
      internshipQuery = internshipQuery.ilike("title", `%${searchTerm}%`);
    }

    const { data: internship, error: internshipError } = await internshipQuery.maybeSingle();

    if (internship && !internshipError) {
      return {
        data: { ...internship, _type: "internships" as FeedType },
        error: null,
      };
    }

    // Try to find in programs
    let programQuery = supabaseAdmin
      .from("programs")
      .select(`
        *,
        company_profiles (
          id, company_name, logo_url, cover_image_url, location, website_url
        )
      `);

    if (isIdUUID) {
      programQuery = programQuery.eq("id", idOrSlug);
    } else {
      programQuery = programQuery.ilike("title", `%${searchTerm}%`);
    }

    const { data: program, error: programError } = await programQuery.maybeSingle();

    if (program && !programError) {
      return {
        data: { ...program, _type: "programs" as FeedType },
        error: null,
      };
    }

    // Try to find in events
    let eventQuery = supabaseAdmin
      .from("event")
      .select(`
        *,
        company_profiles (
          id, company_name, logo_url, cover_image_url, location, website_url
        )
      `);

    if (isIdUUID) {
      eventQuery = eventQuery.eq("id", idOrSlug);
    } else {
      eventQuery = eventQuery.ilike("title", `%${searchTerm}%`);
    }

    const { data: event, error: eventError } = await eventQuery.maybeSingle();

    if (event && !eventError) {
      return {
        data: { ...event, _type: "events" as FeedType },
        error: null,
      };
    }

    // If no match found with space replacement, try with the original slug pattern
    // This handles cases where the title might contain actual dashes
    if (!isIdUUID) {
      console.log(`[FEED_LOOKUP] No match for "${searchTerm}", trying fallback patterns...`);

      // Try internships with original slug pattern
      const { data: internshipFallback } = await supabaseAdmin
        .from("internships")
        .select(`*, company_profiles (id, company_name, logo_url, cover_image_url, location, website_url)`)
        .ilike("title", `%${idOrSlug.replace(/-/g, '%')}%`)
        .maybeSingle();

      if (internshipFallback) {
        return { data: { ...internshipFallback, _type: "internships" as FeedType }, error: null };
      }

      // Try programs with original slug pattern
      const { data: programFallback } = await supabaseAdmin
        .from("programs")
        .select(`*, company_profiles (id, company_name, logo_url, cover_image_url, location, website_url)`)
        .ilike("title", `%${idOrSlug.replace(/-/g, '%')}%`)
        .maybeSingle();

      if (programFallback) {
        return { data: { ...programFallback, _type: "programs" as FeedType }, error: null };
      }

      // Try events with original slug pattern  
      const { data: eventFallback } = await supabaseAdmin
        .from("event")
        .select(`*, company_profiles (id, company_name, logo_url, cover_image_url, location, website_url)`)
        .ilike("title", `%${idOrSlug.replace(/-/g, '%')}%`)
        .maybeSingle();

      if (eventFallback) {
        return { data: { ...eventFallback, _type: "events" as FeedType }, error: null };
      }
    }

    console.log(`[FEED_LOOKUP] No item found for slug/id: "${idOrSlug}"`);
    return {
      data: null,
      error: "Item not found",
    };
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return {
      data: null,
      error: "Failed to fetch item",
    };
  }
};


export const getFeedItemById = unstable_cache(
  fetchFeedItemById,
  ["feed-item-details"],
  {
    revalidate: 300,
    tags: ["feed-item"],
  }
);

/**
 * Get related programs from the same company
 */
export const getCompanyPrograms = cache(
  async (companyId: string, excludeId?: string) => {
    try {
      const supabase = await createSupabaseServerClient();

      let query = supabase
        .from("programs")
        .select("id, title, company_id, created_at, program_picture_url, start_date, end_date")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching company programs:", error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getCompanyPrograms:", error);
      return { data: [], error: "Failed to fetch programs" };
    }
  }
);

/**
 * Get related internships from the same company
 */
export const getCompanyInternships = cache(
  async (companyId: string, excludeId?: string) => {
    try {
      const supabase = await createSupabaseServerClient();

      let query = supabase
        .from("internships")
        .select("id, title,company_id, created_at, type")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching company internships:", error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getCompanyInternships:", error);
      return { data: [], error: "Failed to fetch internships" };
    }
  }
);

/**
 * Get related events from the same company
 */
export const getCompanyEvents = cache(
  async (companyId: string, excludeId?: string) => {
    try {
      const supabase = await createSupabaseServerClient();

      let query = supabase
        .from("event")
        .select("id, title,company_id, created_at, event_picture_url, start_date, end_date")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false })
        .limit(6);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching company events:", error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getCompanyEvents:", error);
      return { data: [], error: "Failed to fetch events" };
    }
  }
);

/**
 * Get all related items from the same company
 */
export const getCompanyRelatedItems = cache(
  async (companyId: string, currentType: FeedType, currentId: string) => {
    try {
      const [programs, internships, events] = await Promise.all([
        currentType !== "programs"
          ? getCompanyPrograms(companyId)
          : getCompanyPrograms(companyId, currentId),
        currentType !== "internships"
          ? getCompanyInternships(companyId)
          : getCompanyInternships(companyId, currentId),
        currentType !== "events"
          ? getCompanyEvents(companyId)
          : getCompanyEvents(companyId, currentId),
      ]);

      return {
        programs: programs.data,
        internships: internships.data,
        events: events.data,
      };
    } catch (error) {
      console.error("Error fetching related items:", error);
      return {
        programs: [],
        internships: [],
        events: [],
      };
    }
  }
);

/**
 * Get the current user's application status for an opportunity
 * Returns the application status if the user has applied, null otherwise
 */
export async function getApplicationStatus(
  opportunityId: string,
  opportunityType: FeedType
): Promise<{
  hasApplied: boolean;
  status: string | null;
  paymentCompleted?: boolean;
  applicationId?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { hasApplied: false, status: null };
    }

    // Get student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !studentProfile) {
      return { hasApplied: false, status: null };
    }

    // Map feed type to application type
    const applicationTypeMap: Record<FeedType, string> = {
      internships: "internship",
      programs: "program",
      events: "event",
    };

    const applicationType = applicationTypeMap[opportunityType];

    // Map feed type to the correct foreign key column
    const foreignKeyMap: Record<FeedType, string> = {
      internships: "internship_id",
      programs: "program_id",
      events: "event_id",
    };

    const foreignKey = foreignKeyMap[opportunityType];

    // Check if the user has applied to this opportunity
    const { data: application, error: applicationError } = await supabase
      .from("Applications")
      .select("id, status, payment_completed")
      .eq("student_id", studentProfile.id)
      .eq("application_type", applicationType)
      .eq(foreignKey, opportunityId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (applicationError || !application) {
      return { hasApplied: false, status: null };
    }

    return {
      hasApplied: true,
      status: application.status,
      paymentCompleted: application.payment_completed || false,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Error checking application status:", error);
    return { hasApplied: false, status: null };
  }
}

/**
 * Check if the opportunity is still open based on dates
 * Note: This is async to comply with "use server" requirements
 */
export async function isOpportunityOpen(
  item: any,
  type: FeedType
): Promise<{ isOpen: boolean; reason?: string }> {
  const now = new Date();

  try {
    if (type === "internships") {
      // Check if there's an application deadline
      if (item.application_deadline) {
        const deadline = new Date(item.application_deadline);
        if (now > deadline) {
          return {
            isOpen: false,
            reason: "Application deadline has passed",
          };
        }
      }

      // Check if there's a start date in the past (assuming internship has started)
      if (item.start_date) {
        const startDate = new Date(item.start_date);
        if (now > startDate) {
          return {
            isOpen: false,
            reason: "Internship has already started",
          };
        }
      }

      return { isOpen: true };
    }

    if (type === "programs") {
      // Check application deadline
      if (item.application_deadline) {
        const deadline = new Date(item.application_deadline);
        if (now > deadline) {
          return {
            isOpen: false,
            reason: "Application deadline has passed",
          };
        }
      }

      // Check if program has ended
      if (item.end_date) {
        const endDate = new Date(item.end_date);
        if (now > endDate) {
          return { isOpen: false, reason: "Program has ended" };
        }
      }

      // Check if program has started (and no applications after start)
      // if (item.start_date && !item.allow_late_applications) {
      //   const startDate = new Date(item.start_date);
      //   if (now > startDate) {
      //     return { isOpen: true, reason: "Program has already started" };
      //   }
      // }

      return { isOpen: true };
    }

    if (type === "events") {
      // Check if event has ended
      if (item.end_date) {
        const endDate = new Date(item.end_date);
        if (now > endDate) {
          return { isOpen: false, reason: "Event has ended" };
        }
      }

      // Check registration deadline
      if (item.registration_deadline) {
        const deadline = new Date(item.registration_deadline);
        if (now > deadline) {
          return {
            isOpen: false,
            reason: "Registration deadline has passed",
          };
        }
      }

      return { isOpen: true };
    }

    return { isOpen: true };
  } catch (error) {
    console.error("Error checking opportunity status:", error);
    return { isOpen: true }; // Default to open if we can't determine
  }
}