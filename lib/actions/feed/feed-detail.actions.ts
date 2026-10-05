// lib/actions/feed-detail.actions.ts
"use server";

import { cache } from "react";
import { findFeedItemBySlug, getFeedItem, listCompanyFeed, type FeedKind, type FeedRow } from "@/lib/api/services/feed";
import { findApplicationFor } from "@/lib/api/services/applications";

export type FeedType = "internships" | "programs" | "events" | "announcements";

type FeedItem = FeedRow & { _type: FeedType };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FEED_KINDS: FeedKind[] = ["internships", "programs", "events"];

/**
 * Get a single feed item by ID or title slug (GET /feed/{kind}/{id}).
 * Announcements have no backend endpoint yet, so they are not found here.
 */
export const getFeedItemById = cache(async (idOrSlug: string): Promise<{ data: FeedItem | null; error: string | null }> => {
  try {
    if (UUID_RE.test(idOrSlug)) {
      // The id alone doesn't say which feed it belongs to — ask all three.
      const items = await Promise.all(FEED_KINDS.map((kind) => getFeedItem(kind, idOrSlug)));
      const index = items.findIndex(Boolean);
      if (index !== -1) {
        return { data: { ...items[index]!, _type: FEED_KINDS[index] as FeedType }, error: null };
      }
    } else {
      const match = await findFeedItemBySlug(idOrSlug);
      if (match) {
        // List rows can be trimmed; fetch the full detail object.
        const item = (await getFeedItem(match.kind, match.item.id)) ?? match.item;
        return { data: { ...item, _type: match.kind as FeedType }, error: null };
      }
    }

    console.log(`[FEED_LOOKUP] No item found for slug/id: "${idOrSlug}"`);
    return { data: null, error: "Item not found" };
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return { data: null, error: "Failed to fetch item" };
  }
});

const relatedFetcher = (kind: FeedKind) =>
  cache(async (companyId: string, excludeId?: string) => {
    try {
      return { data: await listCompanyFeed(kind, companyId, excludeId), error: null };
    } catch (error) {
      console.error(`Error fetching company ${kind}:`, error);
      return { data: [], error: `Failed to fetch ${kind}` };
    }
  });

/** Related programs / internships / events from the same company */
export const getCompanyPrograms = relatedFetcher("programs");
export const getCompanyInternships = relatedFetcher("internships");
export const getCompanyEvents = relatedFetcher("events");

/**
 * Get all related items from the same company
 */
export const getCompanyRelatedItems = cache(
  async (companyId: string, currentType: FeedType, currentId: string) => {
    const exclude = (type: FeedType) => (currentType === type ? currentId : undefined);
    const [programs, internships, events] = await Promise.all([
      getCompanyPrograms(companyId, exclude("programs")),
      getCompanyInternships(companyId, exclude("internships")),
      getCompanyEvents(companyId, exclude("events")),
    ]);
    return { programs: programs.data, internships: internships.data, events: events.data };
  }
);

/**
 * The current student's application for an opportunity (GET /applications).
 * Returns hasApplied: false when signed out.
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
  // Announcements can't be applied to.
  if (opportunityType === "announcements") return { hasApplied: false, status: null };

  try {
    const application = await findApplicationFor(opportunityId);
    if (!application) return { hasApplied: false, status: null };
    return {
      hasApplied: true,
      status: application.status,
      paymentCompleted: application.payment_completed || false,
      applicationId: application.id,
    };
  } catch (error) {
    // 401 = signed out; anything else is logged and treated as "not applied".
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
      // Check if there's a deadline (database column is 'deadline')
      const deadlineField = item.deadline || item.application_deadline;
      if (deadlineField) {
        const deadline = new Date(deadlineField);
        // Set deadline to end of day to be generous
        deadline.setHours(23, 59, 59, 999);

        if (now > deadline) {
          return {
            isOpen: false,
            reason: "Application deadline has passed",
          };
        }
      }

      // Check if internship has ended (if end_date exists)
      if (item.end_date) {
        const endDate = new Date(item.end_date);
        endDate.setHours(23, 59, 59, 999);
        if (now > endDate) {
          return {
            isOpen: false,
            reason: "Internship has already ended",
          };
        }
      }

      return { isOpen: true };
    }

    if (type === "programs") {
      // Check application deadline
      if (item.application_deadline) {
        const deadline = new Date(item.application_deadline);
        deadline.setHours(23, 59, 59, 999);
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
        endDate.setHours(23, 59, 59, 999);
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
        endDate.setHours(23, 59, 59, 999);
        if (now > endDate) {
          return { isOpen: false, reason: "Event has ended" };
        }
      }

      // Check registration deadline
      if (item.registration_deadline) {
        const deadline = new Date(item.registration_deadline);
        deadline.setHours(23, 59, 59, 999);
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