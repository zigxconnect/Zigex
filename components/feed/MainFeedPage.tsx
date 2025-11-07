// components/feed/MainFeedPage.tsx
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { HappeningNowGrid } from "@/components/layout/dashboard/HappeningNow";
import { FeedContent } from "@/components/feed/FeedContent";
import { getAllFeedData } from "@/lib/actions/feed/feed.action";

interface MainFeedPageProps {
  searchQuery?: string;
}

/**
 * MainFeedPage - Server Component
 * 
 * Uses React cache() for automatic request deduplication
 * Page-level caching is handled by Next.js revalidation
 */
export default async function MainFeedPage({
  searchQuery,
}: MainFeedPageProps) {
  // Fetch data on the server with React cache deduplication
  const { internships, events, programs, error } = await getAllFeedData(
    searchQuery
  );

  return (
    <div className="w-full mt-6">
      {/* Happening Now Section */}
      <Suspense
        fallback={
          <div className="h-48 animate-pulse bg-gray-100 rounded-lg mb-6" />
        }
      >
        <HappeningNowGrid />
      </Suspense>

      {/* Feed Content - Client Component */}
      <Suspense fallback={<LoadingSkeleton />}>
        <FeedContent
          initialData={{ internships, events, programs }}
          error={error}
        />
      </Suspense>
    </div>
  );
}