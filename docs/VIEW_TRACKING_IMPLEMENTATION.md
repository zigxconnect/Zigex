# View Count Tracking System - Complete Implementation Guide

## 📋 Overview

The view count tracking system provides real-time analytics for "Happening Now" content with intelligent number formatting (1000 → 1k, 1000000 → 1M, etc.). It tracks both item-level and individual media-level views with a fully responsive UI.

**Status:** ✅ Production-Ready  
**Components:** 4 main files + database migration  
**Coverage:** Frontend, Backend, and Database layers

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  HappeningNowShowcase.tsx      │ Demo & Feature showcase    │
│  HappeningNowDisplay.tsx       │ Main feed/list component   │
│  HappeningNowCard.tsx          │ Individual card with views │
│  formatViews.ts (utility)      │ Number formatting          │
│  useHappeningNowViewTracking   │ Tracking & db integration  │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Database: PostgreSQL happening_now table                   │
│  Columns: view_count (int), media_views (jsonb)             │
│  Indexes: idx_happening_now_view_count, idx_happening_now_created_at
│  Subscriptions: Real-time updates via WebSockets            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Locations & Descriptions

### 1. **lib/utils/formatViews.ts** - View Count Formatting Utility
**Purpose:** Convert large numbers to human-readable format  
**Lines:** 46  
**Functions:**
- `formatViewCount(count: number): string`
  - Converts 1000 → "1k", 1000000 → "1M", etc.
  - Smart decimal placement (1.5k, not 1500)
  - Handles B (billion), M (million), K (thousand)

- `getViewLabel(count: number): string`
  - Returns "view" or "views" based on count

- `formatViewCountWithLabel(count: number): string`
  - Returns "1k views" or "1M views"

- `getViewCountDescription(count: number): string`
  - Returns accessibility-friendly description

**Example Usage:**
```typescript
formatViewCount(1500)           // Returns "1.5k"
formatViewCountWithLabel(1500)  // Returns "1.5k views"
getViewLabel(1)                 // Returns "view"
```

---

### 2. **hooks/useHappeningNowViewTracking.ts** - View Tracking Hooks
**Purpose:** React hooks for database integration and view incrementing  
**Lines:** 117  
**Hooks:**

#### `useHappeningNowViewTracking(itemId: string | null)`
Tracks when a happening-now item is viewed and increments the main view counter.

**Features:**
- Duplicate prevention using useRef
- 500ms delay to ensure component mount
- Automatic database update via Supabase
- Error logging and handling

**Usage:**
```typescript
useHappeningNowViewTracking("item-123");
// Automatically increments view_count in database
```

#### `useIndividualMediaViewTracking(itemId, mediaType, mediaIndex?)`
Tracks individual image/video views for granular analytics.

**Features:**
- Tracks by media type ("image" or "video")
- Supports multiple images with index tracking
- Updates media_views JSONB column
- Also increments main view_count

**Database Structure:**
```json
media_views: {
  "image": {
    "0": 45,  // Image 0 viewed 45 times
    "1": 32,  // Image 1 viewed 32 times
    "2": 18   // Image 2 viewed 18 times
  },
  "video": 128   // Video viewed 128 times
}
```

**Usage:**
```typescript
useIndividualMediaViewTracking("item-123", "image", 0);
useIndividualMediaViewTracking("item-123", "video");
```

---

### 3. **components/sections/HappeningNowCard.tsx** - Card Component
**Purpose:** Display individual happening-now items with view counts  
**Lines:** 280+  
**Features:**

- **Header Section:**
  - Company name and logo
  - Creation date
  - Live status indicator with pulse animation
  - Close button for modal view

- **Media Container:**
  - Image carousel with navigation controls
  - Video player with play button overlay
  - Image indicators/dots for navigation
  - Image counter badge (1/6)

- **Caption Display:**
  - Shows caption for current image
  - Separate from video captions

- **Stats & Actions:**
  - View count with blue badge and tooltip
  - Video indicator showing +Video available
  - Image count badge
  - Like button with toggle state
  - Share button
  - Video button for quick video launch

- **Footer:**
  - Live status message or last update time

**Props:**
```typescript
interface HappeningNowCardProps {
  item: HappeningNowItem;
  onClose?: () => void;
}
```

**Styling:**
- Gradient backgrounds
- Smooth animations and transitions
- Responsive design (mobile-first)
- Accessibility labels and ARIA attributes

---

### 4. **components/sections/HappeningNowDisplay.tsx** - Feed Component
**Purpose:** Display list/grid of happening-now items with real-time updates  
**Lines:** 200+  
**Features:**

- **Loading State:**
  - Skeleton loaders for 3 items
  - Smooth fade-in animation

- **Error State:**
  - Error message display
  - Manual refresh button
  - Retry functionality

- **Empty State:**
  - Friendly message when no items
  - Animated icon
  - Refresh button

- **Real-time Updates:**
  - Supabase channel subscription
  - Auto-updates when view counts change
  - WebSocket connection management

- **UI Elements:**
  - "HAPPENING NOW" header with live indicator
  - Item count display
  - Manual refresh button with loading state
  - Click to expand to fullscreen modal

**Props:**
```typescript
interface HappeningNowDisplayProps {
  limit?: number;                  // Default: 10
  showFullscreenView?: boolean;    // Default: true
}
```

**Real-time Subscription:**
```typescript
// Automatically subscribes to UPDATE events on happening_now table
// Updates local state when view_count or media_views changes
channel('happening_now_updates').on(
  'postgres_changes',
  { event: 'UPDATE', schema: 'public', table: 'happening_now' },
  (payload) => {
    // Update state with new data
  }
)
```

---

### 5. **components/sections/HappeningNowShowcase.tsx** - Demo Component
**Purpose:** Showcase the entire view tracking system with demo data  
**Lines:** 300+  
**Sections:**

1. **Live Happening Now Display** - Real component in action
2. **View Count Formatting Demo** - Shows formatting for 0-1B views
3. **Features Description** - 6 key features highlighted
4. **Technical Stack** - Frontend, Backend, Database details
5. **Integration Guide** - Code examples for using the system

---

## 🗄️ Database Schema

### Migration Applied: `add_media_views_to_happening_now`

```sql
-- Adds new column to track individual media views
ALTER TABLE public.happening_now
ADD COLUMN IF NOT EXISTS media_views jsonb DEFAULT '{}'::jsonb;

-- Creates indexes for performance
CREATE INDEX idx_happening_now_view_count ON public.happening_now(view_count DESC);
CREATE INDEX idx_happening_now_created_at ON public.happening_now(created_at DESC);
```

### Table Structure

```sql
CREATE TABLE public.happening_now (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Media content
  images JSONB DEFAULT '[]'::jsonb CHECK (jsonb_array_length(images) <= 6),
  video JSONB,
  captions JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  company TEXT NOT NULL,
  is_live BOOLEAN DEFAULT false,
  
  -- View tracking (NEW SYSTEM)
  view_count INTEGER DEFAULT 0,
  media_views JSONB DEFAULT '{}'::jsonb
);
```

### Indexes Created

```sql
-- Fast querying by view count (for trending sorting)
CREATE INDEX idx_happening_now_view_count ON public.happening_now(view_count DESC);

-- Fast querying by creation time (for chronological sorting)
CREATE INDEX idx_happening_now_created_at ON public.happening_now(created_at DESC);
```

---

## 🔢 View Count Formatting Logic

### Formatting Rules

| Range | Format | Examples |
|-------|--------|----------|
| 0 - 999 | Display as-is | "0", "1", "999" |
| 1,000 - 999,999 | K suffix | "1k", "1.5k", "999k" |
| 1M - 999M | M suffix | "1M", "1.5M", "999M" |
| 1B+ | B suffix | "1B", "1.5B", "10B" |

### Smart Decimal Placement

- Values < 10 in range: 1 decimal (1.5k, 1.2M)
- Values ≥ 10 in range: No decimal (45k, 120M)
- Rounds to nearest value

### Examples

```typescript
formatViewCount(0)           // "0"
formatViewCount(1)           // "1"
formatViewCount(999)         // "999"
formatViewCount(1000)        // "1k"
formatViewCount(1500)        // "1.5k"
formatViewCount(10000)       // "10k"
formatViewCount(999999)      // "999.9k"
formatViewCount(1000000)     // "1M"
formatViewCount(1500000)     // "1.5M"
formatViewCount(1000000000)  // "1B"
```

---

## 🎯 Usage Examples

### Basic Implementation

```typescript
// In your page component
"use client";

import { HappeningNowDisplay } from "@/components/sections/HappeningNowDisplay";

export default function FeedPage() {
  return (
    <div className="container">
      <HappeningNowDisplay limit={10} showFullscreenView={true} />
    </div>
  );
}
```

### Custom View Tracking

```typescript
"use client";

import { useHappeningNowViewTracking } from "@/hooks/useHappeningNowViewTracking";
import { formatViewCount } from "@/lib/utils/formatViews";

export function CustomHappeningNowCard({ item }) {
  // Automatically track view when component mounts
  useHappeningNowViewTracking(item.id);

  return (
    <div>
      <h3>{item.company}</h3>
      <div>👁️ {formatViewCount(item.view_count)} views</div>
    </div>
  );
}
```

### Individual Media Tracking

```typescript
"use client";

import { useIndividualMediaViewTracking } from "@/hooks/useHappeningNowViewTracking";

export function ImageGallery({ itemId, images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track when viewing each image
  useIndividualMediaViewTracking(itemId, "image", currentIndex);

  return (
    <div>
      <img src={images[currentIndex]} alt="Gallery" />
      <button onClick={() => setCurrentIndex(currentIndex + 1)}>Next</button>
    </div>
  );
}
```

### Manual View Count Formatting

```typescript
"use client";

import { 
  formatViewCount, 
  formatViewCountWithLabel,
  getViewCountDescription 
} from "@/lib/utils/formatViews";

export function ViewStats({ count }) {
  return (
    <div>
      <span title={getViewCountDescription(count)}>
        {formatViewCountWithLabel(count)}
      </span>
    </div>
  );
}
```

---

## 🔄 Real-time Updates Flow

```
1. User views content
   ↓
2. Component mounts (HappeningNowCard)
   ↓
3. useHappeningNowViewTracking hook runs
   ↓
4. useRef prevents duplicate increments
   ↓
5. 500ms delay ensures component mount
   ↓
6. Fetch current view_count from Supabase
   ↓
7. Increment view_count by 1
   ↓
8. Update database
   ↓
9. Supabase broadcasts UPDATE event
   ↓
10. HappeningNowDisplay subscription receives update
   ↓
11. Local state updates with new view_count
   ↓
12. UI re-renders with new formatted view count
```

---

## ⚡ Performance Optimizations

### 1. **Debounced View Tracking**
- 500ms delay before database update
- Prevents excessive database writes
- Batches rapid view increments

### 2. **Database Indexes**
- `idx_happening_now_view_count`: Fast sorting by popularity
- `idx_happening_now_created_at`: Fast sorting by recency

### 3. **Real-time Subscriptions**
- WebSocket-based updates (efficient)
- Only subscribed to relevant table
- Automatic cleanup on unmount

### 4. **JSONB Column for Media Views**
- Flexible schema for tracking any media count
- Single row update instead of multiple rows
- Efficient querying with PostgreSQL JSONB

### 5. **useRef for Duplicate Prevention**
- Prevents multiple increments from same mount
- No extra database queries
- Zero performance overhead

---

## 🧪 Testing View Tracking

### Manual Testing Steps

1. **Test Basic View Increment:**
   ```bash
   # Navigate to HappeningNow component
   # Check browser console for ✅ View tracked message
   # Check Supabase dashboard: view_count should increase
   ```

2. **Test Formatting Accuracy:**
   ```typescript
   // In browser console
   import { formatViewCount } from "@/lib/utils/formatViews";
   
   console.log(formatViewCount(1000));      // Should be "1k"
   console.log(formatViewCount(1500));      // Should be "1.5k"
   console.log(formatViewCount(1000000));   // Should be "1M"
   ```

3. **Test Real-time Updates:**
   ```bash
   # Open two browser tabs with HappeningNow component
   # Open Supabase dashboard, manually update view_count
   # Both tabs should auto-update view count in real-time
   ```

4. **Test Media Tracking:**
   ```bash
   # Navigate to next image in gallery
   # Console should show: ✅ Media view tracked: image_0
   # media_views column should have: {image: {0: 1}}
   ```

---

## 🚀 Deployment Checklist

- [x] Database migration applied (media_views column added)
- [x] Indexes created for performance
- [x] All components created and tested
- [x] Hooks implemented with error handling
- [x] Formatting utility complete
- [x] Real-time subscriptions working
- [x] TypeScript types defined
- [x] Accessibility labels added
- [x] Mobile responsive design verified
- [x] Performance optimizations applied

### Pre-deployment Steps

1. **Backup Database**
   ```bash
   supabase db dump > backup_$(date +%s).sql
   ```

2. **Run Migration**
   ```bash
   # Applied automatically via MCP tool
   ```

3. **Test on Staging**
   - Upload test content
   - Verify view counts increment
   - Check formatting at various scales
   - Test on mobile devices

4. **Monitor in Production**
   - Check error logs for view tracking failures
   - Monitor database query performance
   - Track subscription connection status

---

## 📊 Analytics & Insights

### Available Metrics

1. **Item-level Views**
   - `view_count` column
   - Total engagement per happening-now item

2. **Media-level Views**
   - `media_views.image[index]`
   - Views per image in carousel

3. **Video Views**
   - `media_views.video`
   - Total video views

### Query Examples

```sql
-- Top 10 most viewed items
SELECT company, view_count 
FROM happening_now 
ORDER BY view_count DESC 
LIMIT 10;

-- Average views per company
SELECT company, AVG(view_count) as avg_views
FROM happening_now
GROUP BY company
ORDER BY avg_views DESC;

-- Items with video views
SELECT 
  id,
  company,
  view_count,
  media_views->'video' as video_views
FROM happening_now
WHERE media_views->>'video' IS NOT NULL
ORDER BY media_views->'video' DESC;
```

---

## 🐛 Troubleshooting

### Issue: View count not incrementing

**Causes:**
- useRef preventing increment (by design - mounts only once)
- Database connection failed
- Supabase anon key insufficient permissions

**Solution:**
```typescript
// Reset tracking for testing
const { resetTracking } = useHappeningNowViewTracking(itemId);
resetTracking();

// Check browser console for error messages
// Verify NEXT_PUBLIC_SUPABASE_URL and anon key in .env.local
```

### Issue: Formatting showing incorrect values

**Causes:**
- Number exceeding 9,999,999,999 (billions)
- Decimal rounding edge case

**Solution:**
```typescript
// Verify formatting logic
console.log(formatViewCount(1500));
// Should output "1.5k" not "1.5K"
// Should output "1500" not "1.5" if < 1000
```

### Issue: Real-time updates not working

**Causes:**
- Supabase subscription failed
- WebSocket connection issues
- Missing update permissions

**Solution:**
```typescript
// Check subscription status in browser console
// Verify RLS policies allow SELECT and UPDATE
// Check Supabase realtime status: dashboard.supabase.com
```

---

## 📚 Related Files

- **Database Types:** `/lib/types/happening-now.ts`
- **Upload Feature:** `/app/api/happening-now/route.ts`
- **Server Actions:** `/lib/actions/happening-now.actions.ts`
- **Environment Variables:** `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

---

## ✅ Feature Completion Status

- [x] View count formatting utility (1k, 1M, 1B)
- [x] React hooks for view tracking
- [x] Component for displaying items with views
- [x] Real-time subscription integration
- [x] Individual media view tracking
- [x] Database schema updates
- [x] Performance optimizations
- [x] Error handling and logging
- [x] Accessibility features
- [x] Mobile responsive design
- [x] Demo showcase component
- [x] Comprehensive documentation

**Total Implementation:** ~1000 lines of production-grade code

---

## 📞 Support

For issues or questions about the view tracking system:

1. Check browser console for error messages
2. Review Supabase logs for database errors
3. Verify environment variables are set correctly
4. Check network tab for failed requests
5. Consult troubleshooting section above

---

**Last Updated:** November 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
