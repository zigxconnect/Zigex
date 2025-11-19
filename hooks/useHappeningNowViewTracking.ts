import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { incrementHappeningNowViewCount } from '@/lib/actions/happening-now.actions';

/**
 * Hook to track and increment view count for happening now items
 * Call this when an item is viewed/displayed
 */
export function useHappeningNowViewTracking(itemId: string | null) {
  const viewCountedRef = useRef(false);

  useEffect(() => {
    if (!itemId || viewCountedRef.current) return;

    // Mark as counted immediately to prevent duplicate increments
    viewCountedRef.current = true;

    // Increment view count with a small delay to ensure component is mounted
    const timer = setTimeout(async () => {
      try {
        console.log(`📊 Attempting to track view for: ${itemId}`);
        
        // Use server action for more reliable update with service role key
        const result = await incrementHappeningNowViewCount(itemId);
        
        if (result?.success) {
          console.log(`✅ View tracked: ${itemId} - New count: ${result.newViewCount}`);
        } else {
          console.warn('Failed to track view:', result?.error);
        }
      } catch (error) {
        console.warn('View tracking error:', error);
      }
    }, 500); // Small delay to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, [itemId]);

  /**
   * Reset tracking to allow re-increment if needed
   * Useful for testing or if item changes
   */
  const resetTracking = () => {
    viewCountedRef.current = false;
  };

  return { resetTracking };
}

/**
 * Hook to track views for images/videos within happening now items
 * Track individual image/video views
 */
export function useIndividualMediaViewTracking(
  itemId: string | null,
  mediaType: 'image' | 'video',
  mediaIndex?: number
) {
  const viewCountedRef = useRef(false);

  useEffect(() => {
    if (!itemId || viewCountedRef.current) return;

    viewCountedRef.current = true;

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get current data
        const { data: currentData, error: fetchError } = await supabase
          .from('happening_now')
          .select('*')
          .eq('id', itemId)
          .single();

        if (fetchError || !currentData) {
          console.warn('Failed to fetch data:', fetchError);
          return;
        }

        // Get or create media views object
        let mediaViews = currentData.media_views || {};
        const mediaKey = `${mediaType}_${mediaIndex || 0}`;

        if (!mediaViews[mediaKey]) {
          mediaViews[mediaKey] = 0;
        }

        mediaViews[mediaKey] = (mediaViews[mediaKey] || 0) + 1;

        // Also increment main view count
        const newViewCount = (currentData.view_count || 0) + 1;

        // Update both view count and media views
        const { error: updateError } = await supabase
          .from('happening_now')
          .update({
            view_count: newViewCount,
            media_views: mediaViews,
          })
          .eq('id', itemId);

        if (updateError) {
          console.warn('Failed to update view count:', updateError);
        } else {
          console.log(`✅ Media view tracked: ${mediaKey} - Main views: ${newViewCount}`);
        }
      } catch (error) {
        console.warn('Media view tracking error:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [itemId, mediaType, mediaIndex]);

  const resetTracking = () => {
    viewCountedRef.current = false;
  };

  return { resetTracking };
}
