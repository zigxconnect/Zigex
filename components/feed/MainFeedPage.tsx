// components/feed/MainFeedPage.tsx
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { HappeningNowGrid } from "@/components/layout/dashboard/HappeningNow";
import { FeedGridClient } from "@/components/feed/FeedGridClient";
import { getAllFeedData } from "@/lib/actions/feed/feed.action";
import { getHappeningNowContent } from "@/lib/actions/happening-now.actions";

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
 */
export default async function MainFeedPage({
  searchQuery,
}: MainFeedPageProps) {
  // Fetch data on the server with React cache deduplication
  const [feedData, happeningNowData] = await Promise.all([
    getAllFeedData(searchQuery),
    getHappeningNowContent()
  ]);

  const { internships, events, programs, announcements, error } = feedData;

  return (
    <div className="w-full mt-6">
      {/* Happening Now Section */}
      <Suspense
        fallback={
          <div className="h-48 animate-pulse bg-gray-100 rounded-lg mb-6" />
        }
      >
        <HappeningNowGrid initialData={happeningNowData} />
      </Suspense>

      {/* Optimized Feed Grid - Hybrid SSR/Client */}
      <Suspense fallback={<LoadingSkeleton />}>
        <FeedGridClient
          initialData={{ internships, events, programs, announcements }}
          error={error}
        />
      </Suspense>
    </div>
  );
}
