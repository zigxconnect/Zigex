// components/feed/FeedGrid.tsx
// Server Component - No "use client" directive
// Renders the feed grid on the server with pre-calculated data

import { FeedCardSSR } from "./FeedCardSSR";
import type { FeedItem, Internship, Program, Event, Announcement } from "@/lib/types/feed";

interface FeedGridProps {
  internships: Internship[];
  events: Event[];
  programs: Program[];
  announcements: Announcement[];
}

/**
 * Calculates if an item is "open" based on its dates
 * This runs on the server, avoiding client-side date calculations
 */
function calculateIsOpen(item: FeedItem): boolean {
  const now = new Date();

  if (item._type === "programs") {
    const program = item as any;
    const appDeadline = program.application_deadline ? new Date(program.application_deadline) : null;
    const endDate = program.end_date ? new Date(program.end_date) : null;
    
    if (appDeadline) appDeadline.setHours(23, 59, 59, 999);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    if (program.isLocked || (endDate && endDate < now) || (appDeadline && appDeadline < now)) {
      return false;
    }
  } else if (item._type === "internships") {
    const internship = item as any;
    const deadline = internship.deadline ? new Date(internship.deadline) : null;
    if (deadline) {
      deadline.setHours(23, 59, 59, 999);
      if (deadline < now) return false;
    }
  } else if (item._type === "events") {
    const event = item as any;
    const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
    const endDate = event.end_date ? new Date(event.end_date) : null;

    if (registrationDeadline) registrationDeadline.setHours(23, 59, 59, 999);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    if ((endDate && endDate < now) || (registrationDeadline && registrationDeadline < now)) {
      return false;
    }
  }

  return true;
}

/**
 * Transforms raw data into FeedItems with _type field
 */
function transformToFeedItems(data: FeedGridProps): FeedItem[] {
  const items: FeedItem[] = [
    ...data.internships.map((i) => ({ ...i, _type: "internships" as const })),
    ...data.events.map((e) => ({ ...e, _type: "events" as const })),
    ...data.programs.map((p) => ({ ...p, _type: "programs" as const })),
    ...data.announcements.map((a) => ({ ...a, _type: "announcements" as const })),
  ];

  // Sort by date (newest first)
  return items.sort((a, b) => {
    const dateA = new Date((a as any).start_date || (a as any).created_at || 0);
    const dateB = new Date((b as any).start_date || (b as any).created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * FeedGrid - Server Component
 * 
 * Renders the initial feed grid on the server.
 * All date calculations and data transformations happen server-side.
 * This component is streamed to the client as static HTML.
 */
export function FeedGrid({ internships, events, programs, announcements }: FeedGridProps) {
  const allItems = transformToFeedItems({ internships, events, programs, announcements });
  
  // Show first 6 items initially (server-rendered)
  const initialItems = allItems.slice(0, 6);

  if (initialItems.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Opportunities Found</h3>
        <p className="text-muted-foreground">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialItems.map((item, index) => (
        <FeedCardSSR
          key={item.id}
          item={item}
          index={index}
          isOpen={calculateIsOpen(item)}
        />
      ))}
    </div>
  );
}

// Export utilities for use in client components
export { transformToFeedItems, calculateIsOpen };
