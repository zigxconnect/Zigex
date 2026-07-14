// components/feed/MainFeedPage.tsx
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { FeedGridClient } from "@/components/feed/FeedGridClient";
import { getAllFeedData } from "@/lib/actions/feed/feed.action";

interface MainFeedPageProps {
  searchQuery?: string;
  /** Whether the visiting user is authenticated. Defaults to true so existing
   *  dashboard usage is unaffected. Pass false from the public feed layout. */
  isAuthenticated?: boolean;
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
  isAuthenticated = true,
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
          isAuthenticated={isAuthenticated}
        />
      </Suspense>
    </div>
  );
}
