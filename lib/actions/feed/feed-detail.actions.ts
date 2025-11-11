// lib/actions/feed-detail.actions.ts
"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FeedType = "internships" | "programs" | "events";

/**
 * Get a single feed item by ID
 * Searches across all feed types
 */
export const getFeedItemById = cache(async (id: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Try to find in internships
    const { data: internship, error: internshipError } = await supabase
      .from("internships")
      .select(
        `
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          cover_image_url,
          location,
          website_url
        )
      `
      )
      .eq("id", id)
      .single();

    if (internship && !internshipError) {
      return {
        data: { ...internship, _type: "internships" as FeedType },
        error: null,
      };
    }

    // Try to find in programs
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select(
        `
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          cover_image_url,
          location,
          website_url
        )
      `
      )
      .eq("id", id)
      .single();

    if (program && !programError) {
      return {
        data: { ...program, _type: "programs" as FeedType },
        error: null,
      };
    }

    // Try to find in events
    const { data: event, error: eventError } = await supabase
      .from("event")
      .select(
        `
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          cover_image_url,
          location,
          website_url
        )
      `
      )
      .eq("id", id)
      .single();

    if (event && !eventError) {
      return {
        data: { ...event, _type: "events" as FeedType },
        error: null,
      };
    }

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
});

/**
 * Get related programs from the same company
 */
export const getCompanyPrograms = cache(
  async (companyId: string, excludeId?: string) => {
    try {
      const supabase = await createSupabaseServerClient();

      let query = supabase
        .from("programs")
        .select("id, title, company_id, created_at, program_picture_url, duration, start_date, end_date")
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
        .select("id, title,company_id, created_at, cover_image_url, duration, type")
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