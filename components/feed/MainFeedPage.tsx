// components/feed/MainFeedPage.tsx
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { FeedGridClient } from "@/components/feed/FeedGridClient";
import { getAllFeedData } from "@/lib/actions/feed/feed.action";

interface MainFeedPageProps {
  searchQuery?: string;
}

/**
 * MainFeedPage - Server Component
 * 
 * Optimized for SSR:
 * - Uses React cache() for automatic request deduplication
 * - Data fetched on server, passed to client for interactivity
 * - FeedGridClient handles search, tabs, and load more
 * - HappeningNow section removed per design spec
 */
export default async function MainFeedPage({
  searchQuery,
}: MainFeedPageProps) { 
  // Fetch data on the server with React cache deduplication
  const feedData = await getAllFeedData(searchQuery);

  const { internships, events, programs, announcements, companies, error } = feedData;

  return (
    <div className="w-full">
      {/* Optimized Feed Grid - Hybrid SSR/Client */}
      <Suspense fallback={<LoadingSkeleton />}>
        <FeedGridClient
          initialData={{ internships, events, programs, announcements, companies }}
          error={error}
        />
      </Suspense>
    </div>
  );
}
