/**
 * INTEGRATION GUIDE - Quick Start Examples
 * 
 * Copy and paste these code snippets to integrate view tracking into your existing components
 */

// ============================================================================
// EXAMPLE 1: Add to Existing Feed Page
// ============================================================================

// File: app/(dashboard)/feed/page.tsx

'use client';

import { HappeningNowDisplay } from "@/components/sections/HappeningNowDisplay";

export default function FeedPage() {
  return (
    <div className="container mx-auto py-8">
      {/* Your existing feed content */}
      <h1 className="text-3xl font-bold mb-8">Feed</h1>
      
      {/* ADD THIS SECTION - Happening Now with View Tracking */}
      <section className="mb-12">
        <HappeningNowDisplay 
          limit={10} 
          showFullscreenView={true} 
        />
      </section>

      {/* Your other feed content continues... */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Add to Main Dashboard Layout
// ============================================================================

// File: app/(dashboard)/layout.tsx

import { HappeningNowDisplay } from "@/components/sections/HappeningNowDisplay";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main content */}
      <div className="lg:col-span-3">
        {children}
      </div>

      {/* Sidebar with Happening Now */}
      <aside className="lg:col-span-1">
        <div className="sticky top-4">
          <HappeningNowDisplay 
            limit={5} 
            showFullscreenView={false}
          />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Custom Display with Manual Formatting
// ============================================================================

// File: components/CustomHappeningNowCard.tsx

'use client';

import { HappeningNowItem } from "@/lib/types/happening-now";
import { formatViewCount, formatViewCountWithLabel } from "@/lib/utils/formatViews";
import { useHappeningNowViewTracking } from "@/hooks/useHappeningNowViewTracking";
import { Eye } from "lucide-react";

interface CustomCardProps {
  item: HappeningNowItem;
}

export function CustomHappeningNowCard({ item }: CustomCardProps) {
  // Automatically track view when component mounts
  useHappeningNowViewTracking(item.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-200">
        {item.images && item.images.length > 0 && (
          <img 
            src={item.images[0]} 
            alt={item.company}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* View Count Badge */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Eye size={14} />
          {formatViewCount(item.view_count || 0)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{item.company}</h3>
        {item.captions && item.captions.length > 0 && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.captions[0]}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {formatViewCountWithLabel(item.view_count || 0)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Gallery with Individual Media View Tracking
// ============================================================================

// File: components/HappeningNowGallery.tsx

'use client';

import { useState } from 'react';
import { HappeningNowItem } from "@/lib/types/happening-now";
import { 
  useHappeningNowViewTracking, 
  useIndividualMediaViewTracking 
} from "@/hooks/useHappeningNowViewTracking";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface GalleryProps {
  item: HappeningNowItem;
}

export function HappeningNowGallery({ item }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Track main item view
  useHappeningNowViewTracking(item.id);

  // Track individual image views (updates when currentIndex changes)
  useIndividualMediaViewTracking(item.id, "image", currentIndex);

  const images = item.images || [];
  const hasVideo = !!item.video?.url;

  if (!images.length && !hasVideo) {
    return <div className="bg-gray-200 h-96 rounded-lg" />;
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group">
      {isVideoPlaying && hasVideo ? (
        // Video
        <video
          src={item.video.url}
          className="w-full h-full object-cover"
          controls
          autoPlay
          onPlay={() => useIndividualMediaViewTracking(item.id, "video")}
        />
      ) : (
        // Image
        <>
          {images.length > 0 && (
            <img
              src={images[currentIndex]}
              alt={`${item.company} - ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          {/* Play Button for Video */}
          {hasVideo && (
            <button
              onClick={() => setIsVideoPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Play size={32} className="fill-gray-900 text-gray-900 ml-1" />
              </div>
            </button>
          )}

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white disabled:opacity-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
                disabled={currentIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white disabled:opacity-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-2.5' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Using in UnifiedFeedCard Component
// ============================================================================

// File: components/feed/UnifiedFeedCard.tsx (Modified)

'use client';

import { HappeningNowItem } from "@/lib/types/happening-now";
import { HappeningNowCard } from "@/components/sections/HappeningNowCard";
import { formatViewCount } from "@/lib/utils/formatViews";

export function UnifiedFeedCard({ item }: { item: HappeningNowItem }) {
  // This will automatically use view tracking via HappeningNowCard
  return <HappeningNowCard item={item} />;
}

// ============================================================================
// EXAMPLE 6: Real-time View Count Display
// ============================================================================

// File: components/ViewCountLiveUpdate.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatViewCount } from '@/lib/utils/formatViews';
import { Eye } from 'lucide-react';

interface ViewCountProps {
  itemId: string;
  refreshInterval?: number; // ms between refreshes
}

export function ViewCountLiveUpdate({ itemId, refreshInterval = 5000 }: ViewCountProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('happening_now')
          .select('view_count')
          .eq('id', itemId)
          .single();

        if (data) {
          setViewCount(data.view_count || 0);
        }
      } catch (error) {
        console.warn('Failed to fetch view count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewCount();

    // Poll for updates
    const interval = setInterval(fetchViewCount, refreshInterval);

    // Also subscribe to real-time updates
    const supabase = createClient();
    const subscription = supabase
      .channel(`happening_now_${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'happening_now',
          filter: `id=eq.${itemId}`,
        },
        (payload) => {
          setViewCount(payload.new.view_count);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [itemId, refreshInterval]);

  if (loading) return <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />;

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
      <Eye size={14} />
      {formatViewCount(viewCount || 0)}
    </div>
  );
}

// Usage in any component:
// <ViewCountLiveUpdate itemId="item-123" refreshInterval={3000} />

// ============================================================================
// EXAMPLE 7: Top Happening Now Items (Trending)
// ============================================================================

// File: components/TrendingHappeningNow.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HappeningNowItem } from '@/lib/types/happening-now';
import { formatViewCount } from '@/lib/utils/formatViews';
import { TrendingUp } from 'lucide-react';

export function TrendingHappeningNow() {
  const [items, setItems] = useState<HappeningNowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('happening_now')
          .select('*')
          .order('view_count', { ascending: false })
          .limit(5);

        setItems((data || []) as HappeningNowItem[]);
      } catch (error) {
        console.error('Failed to fetch trending items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <div>Loading trending...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-orange-600" />
        <h3 className="font-bold text-gray-900">Top 5 Happening Now</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900">#{idx + 1}</p>
              <p className="text-sm text-gray-600">{item.company}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">{formatViewCount(item.view_count || 0)}</p>
              <p className="text-xs text-gray-500">views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK COPY-PASTE CHECKLIST
// ============================================================================

/*
To integrate view tracking into your app:

1. ✅ Add HappeningNowDisplay to feed page:
   - Import: import { HappeningNowDisplay } from "@/components/sections/HappeningNowDisplay";
   - Use: <HappeningNowDisplay limit={10} showFullscreenView={true} />

2. ✅ Format view counts in existing components:
   - Import: import { formatViewCount } from "@/lib/utils/formatViews";
   - Use: {formatViewCount(item.view_count)}

3. ✅ Track views automatically:
   - Import: import { useHappeningNowViewTracking } from "@/hooks/useHappeningNowViewTracking";
   - Use: useHappeningNowViewTracking(item.id); in your component

4. ✅ Track individual media:
   - Import: import { useIndividualMediaViewTracking } from "@/hooks/useHappeningNowViewTracking";
   - Use: useIndividualMediaViewTracking(item.id, "image", 0);

5. ✅ Check database migration was applied:
   - Run: SELECT column_name FROM information_schema.columns WHERE table_name = 'happening_now';
   - Should see: view_count, media_views columns

6. ✅ Test view increment:
   - Open component in browser
   - Check browser console for: ✅ View tracked: ...
   - Check Supabase dashboard: view_count should increase

7. ✅ Deploy to production:
   - All files created and tested
   - Database migration applied
   - Environment variables configured
   - Ready to merge and deploy
*/
