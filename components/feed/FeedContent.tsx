
// components/feed/FeedContent.tsx
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UnifiedFeedCard } from "@/components/feed/UnifiedFeedCard";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";
import { Search, TrendingUp, ChevronRight, Sparkles, Loader2, ArrowUp } from "lucide-react";
import type { FeedItem, Internship, Program, Event, Project } from "@/lib/types/feed";
import { useFeedStore } from "@/lib/zustand/store";

interface FeedContentProps {
  initialData: {
    internships: Internship[];
    events: Event[];
    programs: Program[];
    projects: Project[];
  };
  error: string | null;
}

const MOCK_LIVE_IDS = ["i1", "e1", "p1"];
const ITEMS_PER_PAGE = 6;

export function FeedContent({ initialData, error }: FeedContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { activeTab, searchQuery, setSearchQuery } = useFeedStore();

  const [data] = useState(initialData);
  const [liveIds] = useState<Set<string>>(new Set(MOCK_LIVE_IDS));
  const [liveMeta] = useState<Record<string, { youtube?: string; description?: string }>>({
    i1: { youtube: "https://player.vimeo.com/video/1127249560" },
    e1: { youtube: "https://player.vimeo.com/video/1127249560" },
    p1: { youtube: "https://player.vimeo.com/video/1127249560" },
  });
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

  // Transform data to include _type and is_live
  const transformedData = useMemo(
    () => ({
      internships: data.internships.map((i) => ({
        ...i,
        _type: "internships" as const,
        is_live: liveIds.has(i.id),
      })),
      events: data.events.map((e) => ({
        ...e,
        _type: "events" as const,
        is_live: liveIds.has(e.id),
      })),
      programs: data.programs.map((p) => ({
        ...p,
        _type: "programs" as const,
        is_live: liveIds.has(p.id),
      })),
      projects: data.projects.map((pr) => ({
        ...pr,
        _type: "projects" as const,
        is_live: false,
      })),
    }),
    [data, liveIds]
  );

  // Sort all content by date
  const allContentSorted = useMemo(() => {
    const combined: FeedItem[] = [
      ...transformedData.internships,
      ...transformedData.events,
      ...transformedData.programs,
      ...transformedData.projects,
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
      content = allContentSorted.filter((it) => liveIds.has(it.id));
    } else if (activeTab === "projects") {
      content = transformedData.projects as FeedItem[];
    } else {
      content = transformedData[activeTab as keyof typeof transformedData] as FeedItem[];
    }

    if (!searchQuery.trim()) return content;

    const query = searchQuery.toLowerCase();
    return content.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description = (item.description || (item as any).tagline || "").toLowerCase();
      const company = (
        typeof item.company === "string"
          ? item.company
          : item.company?.company_name || (item as any).owner?.full_name || ""
      ).toLowerCase();
      return (
        title.includes(query) ||
        description.includes(query) ||
        company.includes(query)
      );
    });
  }, [activeTab, searchQuery, transformedData, allContentSorted, liveIds]);

  // Paginated data
  const displayedData = filteredData.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredData.length;
  const remainingCount = filteredData.length - itemsToShow;

  // Calculate counts
  const counts = useMemo(
    () => ({
      all: allContentSorted.length,
      live: allContentSorted.filter((it) => liveIds.has(it.id)).length,
      internships: transformedData.internships.length,
      programs: transformedData.programs.length,
      events: transformedData.events.length,
      projects: transformedData.projects.length,
    }),
    [allContentSorted, transformedData, liveIds]
  );


  // Handle live video modal
  const handleLiveClick = (item: FeedItem) => {
    const itemMeta = liveMeta[item.id] || {};
    const companyName =
      typeof item.company === "string"
        ? item.company
        : item.company?.company_name || "Company";

    let thumbnail = "";
    if (item._type === "internships")
      thumbnail = (item as any).cover_image_url || "/intern.png";
    else if (item._type === "events")
      thumbnail = (item as any).event_picture_url || "/sky8.png";
    else if (item._type === "programs")
      thumbnail = (item as any).program_picture_url || "/skye8-internship.jpg";

    openModal({
      videoUrl: itemMeta.youtube || "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      title: item.title,
      company: companyName,
      description: itemMeta.description || item.description,
      thumbnail,
      viewerCount: Math.floor(Math.random() * 2000) + 500,
    });
  };

  // Handle search with URL update
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setItemsToShow(ITEMS_PER_PAGE); // Reset pagination on search

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

  // Handle load more with smooth animation
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay for smooth UX
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
          <Search size={32} className="text-destructive" />
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
            <Search size={40} className="text-muted-foreground" />
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
              <UnifiedFeedCard
                key={item.id}
                item={item}
                index={index}
                onLiveClick={liveIds.has(item.id) ? () => handleLiveClick(item) : undefined}
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

      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}