// components/feed/FeedContent.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UnifiedFeedCard } from "@/components/feed/UnifiedFeedCard";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";
import { Search } from "lucide-react";
import type { FeedItem, Internship, Program, Event } from "@/lib/types/feed";
import { useFeedStore } from "@/lib/zustand/store";

interface FeedContentProps {
  initialData: {
    internships: Internship[];
    events: Event[];
    programs: Program[];
  };
  error: string | null;
}

const MOCK_LIVE_IDS = ["i1", "e1", "p1"];

export function FeedContent({ initialData, error }: FeedContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { activeTab, searchQuery, setSearchQuery } = useFeedStore();

  const [data] = useState(initialData);
  const [liveIds] = useState<Set<string>>(new Set(MOCK_LIVE_IDS));
  const [liveMeta] = useState<
    Record<string, { youtube?: string; description?: string }>
  >({
    i1: { youtube: "https://player.vimeo.com/video/1127249560" },
    e1: { youtube: "https://player.vimeo.com/video/1127249560" },
    p1: { youtube: "https://player.vimeo.com/video/1127249560" },
  });

  const { isOpen, modalData, openModal, closeModal } = useVideoModal();
console.log("The data is : ", initialData.internships)
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
    }),
    [data, liveIds]
  );

  // Sort all content by date
  const allContentSorted = useMemo(() => {
    const combined: FeedItem[] = [
      ...transformedData.internships,
      ...transformedData.events,
      ...transformedData.programs,
    ];
    return combined.sort((a, b) => {
      const dateA = new Date(
        (a as any).start_date || (a as any).created_at || 0
      );
      const dateB = new Date(
        (b as any).start_date || (b as any).created_at || 0
      );
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
    } else {
      content = transformedData[activeTab] as FeedItem[];
    }

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
  }, [activeTab, searchQuery, transformedData, allContentSorted, liveIds]);

  // Calculate counts
  const counts = useMemo(
    () => ({
      all: allContentSorted.length,
      live: allContentSorted.filter((it) => liveIds.has(it.id)).length,
      internships: transformedData.internships.length,
      programs: transformedData.programs.length,
      events: transformedData.events.length,
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
      videoUrl:
        itemMeta.youtube || "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      title: item.title,
      company: companyName,
      description: itemMeta.description || item.description,
      thumbnail,
      viewerCount: Math.floor(Math.random() * 2000) + 500,
    });
  };

  // Handle search with URL update (optional - enables shareable search URLs)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Optional: Update URL with search query
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

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <Search size={32} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Feed
        </h3>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Feed Tabs */}
      <FeedTabs counts={counts} isLoading={isPending} />

      {/* Results Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {activeTab === "all"
            ? "All"
            : activeTab === "live"
            ? "Live"
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
          Opportunities
        </h2>
        {filteredData.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "result" : "results"} found
          </p>
        )}
      </div>

      {/* Content Grid */}
      {filteredData.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Opportunities Found
          </h3>
          <p className="text-gray-600 text-sm">
            {searchQuery
              ? "Try adjusting your search"
              : "Check back later for new opportunities"}
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, index) => (
            <div
              key={item.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <UnifiedFeedCard
                item={item}
                onLiveClick={
                  liveIds.has(item.id) ? () => handleLiveClick(item) : undefined
                }
              />
            </div>
          ))}
        </div>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}