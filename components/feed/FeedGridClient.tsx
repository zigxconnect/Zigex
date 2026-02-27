// components/feed/FeedGridClient.tsx
"use client";

/**
 * Client-side wrapper for feed grid interactivity
 * Handles: Search, Tab switching, Load more, Video modal
 */

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { FeedListCard } from "@/components/feed/FeedListCard";
import { CompanySidebar } from "@/components/feed/CompanySidebar";
import { calculateIsOpen } from "@/components/feed/FeedGrid";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";
import { ChevronRight, Loader2, ArrowUp, Search } from "lucide-react";
import type { FeedItem, Internship, Program, Event, Announcement } from "@/lib/types/feed";
import { useFeedStore } from "@/lib/zustand/store";

interface FeedGridClientProps {
  initialData: {
    internships: Internship[];
    events: Event[];
    programs: Program[];
    announcements: Announcement[];
    companies?: any[];
  };
  error: string | null;
}

const ITEMS_PER_PAGE = 8;

export function FeedGridClient({ initialData, error }: FeedGridClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { activeTab, searchQuery, setSearchQuery } = useFeedStore();

  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isOpen, modalData, openModal, closeModal } = useVideoModal();

  // Scroll visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform
  const transformedData = useMemo(() => ({
    internships: (initialData.internships || []).map((i) => ({ ...i, _type: "internships" as const })),
    events: (initialData.events || []).map((e) => ({ ...e, _type: "events" as const })),
    programs: (initialData.programs || []).map((p) => ({ ...p, _type: "programs" as const })),
    announcements: (initialData.announcements || []).map((a) => ({ ...a, _type: "announcements" as const })),
  }), [initialData]);

  // Sort
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

  // Filter
  const filteredData = useMemo(() => {
    let content: FeedItem[] = activeTab === "all" 
      ? allContentSorted 
      : (transformedData[activeTab as keyof typeof transformedData] || []) as FeedItem[];

    if (!content) content = [];
    if (!searchQuery.trim()) return content;

    const query = searchQuery.toLowerCase();
    return content.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const company = (typeof item.company === "string" ? item.company : item.company?.company_name || "").toLowerCase();
      return title.includes(query) || description.includes(query) || company.includes(query);
    });
  }, [activeTab, searchQuery, transformedData, allContentSorted]);

  const displayedData = filteredData.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredData.length;
  const remainingCount = filteredData.length - itemsToShow;

  const counts = useMemo(() => ({
    all: allContentSorted.length,
    live: 0,
    internships: transformedData.internships.length,
    programs: transformedData.programs.length,
    events: transformedData.events.length,
    announcements: transformedData.announcements.length,
  }), [allContentSorted, transformedData]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setItemsToShow(ITEMS_PER_PAGE);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      value ? params.set("q", value) : params.delete("q");
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setItemsToShow(prev => Math.min(prev + ITEMS_PER_PAGE, filteredData.length));
      setIsLoadingMore(false);
    }, 300);
  };

  if (error) return (
    <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border border-red-50">
      <h3 className="text-xl font-black text-slate-900 mb-2">Service Interruption</h3>
      <p className="text-slate-500 font-medium">{error}</p>
    </div>
  );

  return (
    <div id="feed-content" className="space-y-12">
      {/* Header Controls - Enhanced Search & Tabs Integration */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search programs, internships..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition-all outline-none"
          />
        </div>
        <FeedTabs counts={counts} isLoading={isPending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {displayedData.length === 0 ? (
            <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching opportunities found</p>
              {searchQuery && (
                <button onClick={() => handleSearchChange("")} className="mt-6 text-[#155DFC] font-black uppercase text-[10px] tracking-widest hover:underline">
                  Reset Search
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {displayedData.map((item, index) => (
                <FeedListCard
                  key={item.id}
                  item={item}
                  index={index}
                  isOpen={calculateIsOpen(item)}
                />
              ))}
              
              {hasMore && (
                <div className="pt-10 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="h-14 px-10 bg-[#155DFC] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#155DFC]/90 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isLoadingMore ? <Loader2 className="animate-spin" size={16} /> : <ChevronRight size={16} />}
                    <span>Load {Math.min(ITEMS_PER_PAGE, remainingCount)} More Opportunities</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Directory */}
        <div className="lg:col-span-4">
          <CompanySidebar companies={initialData.companies || []} />
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 w-14 h-14 bg-[#155DFC] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          <ArrowUp size={24} className="relative z-10" />
        </button>
      )}

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
