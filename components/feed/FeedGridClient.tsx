// components/feed/FeedGridClient.tsx
"use client";

/**
 * Client-side wrapper for feed grid interactivity
 * Handles: Search, Tab switching, Load more, Video modal
 */

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { FeedCardSSR } from "@/components/feed/FeedCardSSR";
import { calculateIsOpen } from "@/components/feed/FeedGrid";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";
import { ChevronRight, Loader2, ArrowUp } from "lucide-react";
import type { FeedItem, Internship, Program, Event, Announcement } from "@/lib/types/feed";
import { useFeedStore } from "@/lib/zustand/store";

interface FeedGridClientProps {
  initialData: {
    internships: Internship[];
    events: Event[];
    programs: Program[];
    announcements: Announcement[];
  };
  error: string | null;
}

const ITEMS_PER_PAGE = 6;

export function FeedGridClient({ initialData, error }: FeedGridClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { activeTab, searchQuery, setSearchQuery } = useFeedStore();

  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isOpen, modalData, openModal, closeModal } = useVideoModal();

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform data to include _type
  const transformedData = useMemo(
    () => ({
      internships: initialData.internships.map((i) => ({
        ...i,
        _type: "internships" as const,
      })),
      events: initialData.events.map((e) => ({
        ...e,
        _type: "events" as const,
      })),
      programs: initialData.programs.map((p) => ({
        ...p,
        _type: "programs" as const,
      })),
      announcements: initialData.announcements.map((a) => ({
        ...a,
        _type: "announcements" as const,
      })),
    }),
    [initialData]
  );

  // Sort all content by date
  const allContentSorted = useMemo(() => {
    const combined: FeedItem[] = [
      ...transformedData.internships,
      ...transformedData.events,
      ...transformedData.programs,
      ...transformedData.announcements,
    ];
    return combined.sort((a, b) => {
      const dateA = new Date((a as any).start_date || (a as any).created_at || 0);
      const dateB = new Date((b as any).start_date || (b as any).created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transformedData]);

  // Filter based on active tab and search
  const filteredData = useMemo(() => {
    let content: FeedItem[] = [];

    if (activeTab === "all") {
      content = allContentSorted;
    } else if (activeTab === "live") {
      content = []; // No live items for now
    } else {
      content = (transformedData[activeTab as keyof typeof transformedData] || []) as FeedItem[];
    }

    if (!content) content = [];

    if (!searchQuery.trim()) return content;

    const query = searchQuery.toLowerCase();
    return content.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const company = (
        typeof item.company === "string"
          ? item.company
          : item.company?.company_name || ""
      ).toLowerCase();
      return (
        title.includes(query) ||
        description.includes(query) ||
        company.includes(query)
      );
    });
  }, [activeTab, searchQuery, transformedData, allContentSorted]);

  // Paginated data
  const displayedData = filteredData.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredData.length;
  const remainingCount = filteredData.length - itemsToShow;

  // Calculate counts
  const counts = useMemo(
    () => ({
      all: allContentSorted.length,
      live: 0,
      internships: transformedData.internships.length,
      programs: transformedData.programs.length,
      events: transformedData.events.length,
      announcements: transformedData.announcements.length,
    }),
    [allContentSorted, transformedData]
  );

  // Handle search with URL update
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setItemsToShow(ITEMS_PER_PAGE);

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // Handle load more
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    setTimeout(() => {
      setItemsToShow(prev => Math.min(prev + ITEMS_PER_PAGE, filteredData.length));
      setIsLoadingMore(false);
    }, 300);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Feed</h3>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Feed Tabs */}
      <FeedTabs counts={counts} isLoading={isPending} />

      {/* Content Grid */}
      {displayedData.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Opportunities Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search" : "Check back later for new opportunities"}
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedData.map((item, index) => (
              <FeedCardSSR
                key={item.id}
                item={item}
                index={index}
                isOpen={calculateIsOpen(item)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex flex-col items-center gap-3 pt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load {Math.min(ITEMS_PER_PAGE, remainingCount)} More</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-sm text-muted-foreground">
                {remainingCount} more {remainingCount === 1 ? 'opportunity' : 'opportunities'} available
              </p>
            </div>
          )}
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 z-50 animate-bounce-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* Live Video Modal */}
      {modalData && (
        <LiveVideoModal
          isOpen={isOpen}
          onClose={closeModal}
          videoUrl={modalData.videoUrl}
          title={modalData.title}
          company={modalData.company}
          description={modalData.description}
          thumbnail={modalData.thumbnail}
          viewerCount={modalData.viewerCount}
        />
      )}
    </div>
  );
}
