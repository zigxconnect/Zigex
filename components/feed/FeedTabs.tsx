// components/feed/FeedTabs.tsx
"use client";

import { useFeedStore } from "@/lib/zustand/store";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

type TabId = "all" | "live" | "internships" | "programs" | "events" | "announcements";

interface FeedTabsProps {
  counts?: {
    all: number;
    live: number;
    internships: number;
    programs: number;
    events: number;
    announcements: number;
  };
  isLoading?: boolean;
}

const tabs = [
  {
    id: "live" as TabId,
    label: "Live",
  },
  {
    id: "all" as TabId,
    label: "All",
  },
  {
    id: "internships" as TabId,
    label: "Internships",
  },
  {
    id: "programs" as TabId,
    label: "Programs",
  },
  {
    id: "events" as TabId,
    label: "Events",
  },
  {
    id: "announcements" as TabId,
    label: "Announcements",
  },
];

  export function FeedTabs({ counts, isLoading = false }: FeedTabsProps) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useFeedStore();
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if we're on a projects detail page
  const isProjectDetailPage = pathname.includes("/feed/projects/") && pathname !== "/feed/projects";

  // If on project detail page, don't render the tabs at all
  if (isProjectDetailPage) {
    return null;
  }

  const isDetailPage = pathname.includes("/feed/") && pathname !== "/feed" && !pathname.includes("/feed/projects");

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (isDetailPage) {
      router.push("/feed");
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Debounce URL update or update immediately? 
    // Updating immediately for responsiveness, useTransition in parent might be better but let's keep it simple and consistent with previous behavior.
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    // Use replace to avoid filling history stack with every keystroke, or push if you want history.
    // Given it's "realtime", replace is often better.
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="w-full mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-1.5 flex flex-col md:flex-row items-center gap-2">
          
          {/* Inline Search Input */}
          <div className="w-full md:w-auto md:flex-1 flex items-center gap-3 px-4 py-2.5 rounded-md bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all group border border-transparent focus-within:border-primary/50">
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search internships, programs, events..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <div className="bg-gray-200 rounded-full p-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-200 rounded bg-white">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Divider (Desktop) */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

          {/* Divider (Mobile) */}
          <div className="md:hidden w-full h-px bg-gray-200 my-1" />

          {/* Tabs */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  
                  {!isLoading && counts && counts[tab.id] > 0 && (
                    <span
                      className={`
                        px-1.5 py-0.5 text-[10px] rounded-full font-bold
                        ${
                          activeTab === tab.id
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted-foreground/10 text-muted-foreground"
                        }
                      `}
                    >
                      {counts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Search Indicator */}
        {searchQuery && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg">
            <Search size={16} className="text-primary" />
            <p className="text-sm text-muted-foreground flex-1">
              Showing results for <span className="font-semibold text-foreground">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
