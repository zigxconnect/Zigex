// app/(dashboard)/feed/page.tsx
import MainFeedPage from '@/components/feed/MainFeedPage';
import ProfileRecommendationPopup from '@/components/feed/ProfileRecommendationPopup';
import { WelcomeCard } from '@/components/sections/dashboard/WelcomeCard';
import { getProfileInfo } from '@/lib/actions/profile.actions';

interface FeedPageProps {
  searchParams: Promise<{ q?: string }>;
}

/**
 * Page-level caching configuration
 * This controls how Next.js caches the entire page
 */

// Option 1: Static with revalidation (Recommended for most cases)
export const revalidate = 180; // Revalidate every 3 minutes

// Option 2: Dynamic (always fetch fresh)
// export const dynamic = "force-dynamic";

// Option 3: Static (cache forever until manual revalidation)
// export const dynamic = "force-static";

// Metadata
export const metadata = {
  title: "Feed | Opportunities",
  description: "Discover internships, events, and programs",
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const resolvedParams = await searchParams;
  // Fetch user profile
  const userData = await getProfileInfo();
  console.log("User Data in FeedPage:", userData);

  return (
    <>
    <ProfileRecommendationPopup user={userData}/>
      <WelcomeCard user={userData} />
      <MainFeedPage searchQuery={resolvedParams.q} />
    </>
  );
}

// Optional: Generate static params for common searches
// This pre-renders pages at build time
/*
export async function generateStaticParams() {
  return [
    { q: undefined }, // Main feed
    // Add common search terms if needed
    // { q: 'engineering' },
    // { q: 'design' },
  ];
}
*/