// components/feed/FeedTabs.tsx
"use client";

import { useFeedStore } from "@/lib/zustand/store";
// import { useFeedStore } from "@/lib/zustand/store";
// import { useFeedStore } from "@/lib/store/feedStore";
import { Briefcase, GraduationCap, Calendar, Sparkles, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type TabId = "all" | "live" | "internships" | "programs" | "events";

interface FeedTabsProps {
  counts?: {
    all: number;
    live: number;
    internships: number;
    programs: number;
    events: number;
  };
  isLoading?: boolean;
}

const tabs = [
  {
    id: "live" as TabId,
    label: "Live",
    icon: Sparkles,
    color: "red",
  },
  {
    id: "all" as TabId,
    label: "All",
    icon: Sparkles,
    color: "gray",
  },
  {
    id: "internships" as TabId,
    label: "Internships",
    icon: Briefcase,
    color: "blue",
  },
  {
    id: "programs" as TabId,
    label: "Programs",
    icon: GraduationCap,
    color: "purple",
  },
  {
    id: "events" as TabId,
    label: "Events",
    icon: Calendar,
    color: "green",
  },
];

const getTabColorClasses = (color: string, isActive: boolean) => {
  const colorMap: Record<string, any> = {
    red: {
      active: "bg-red-600 text-white shadow-red-200",
      inactive: "text-red-600 hover:bg-red-50",
    },
    gray: {
      active: "bg-blue-600 text-white shadow-blue-200",
      inactive: "text-gray-600 hover:bg-gray-50",
    },
    blue: {
      active: "bg-blue-600 text-white shadow-blue-200",
      inactive: "text-blue-600 hover:bg-blue-50",
    },
    purple: {
      active: "bg-purple-600 text-white shadow-purple-200",
      inactive: "text-purple-600 hover:bg-purple-50",
    },
    green: {
      active: "bg-green-600 text-white shadow-green-200",
      inactive: "text-green-600 hover:bg-green-50",
    },
  };
  return isActive ? colorMap[color].active : colorMap[color].inactive;
};

export function FeedTabs({ counts, isLoading = false }: FeedTabsProps) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useFeedStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isDetailPage = pathname.includes("/feed/") && pathname !== "/feed";

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (isDetailPage) {
      router.push("/feed");
    }
  };

  return (
    <>
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6">
        <div className="w-full px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full lg:w-96 flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
            >
              <Search
                size={20}
                className="text-gray-400 group-hover:text-blue-600 transition-colors"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors flex-1 text-left">
                {searchQuery || "Search opportunities..."}
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Tabs */}
            <div className="w-full lg:w-auto overflow-x-auto scrollbar-hide">
              <div className="inline-flex bg-gray-100 rounded-xl p-1.5 shadow-sm min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${getTabColorClasses(
                      tab.color,
                      activeTab === tab.id
                    )} ${
                      activeTab === tab.id ? "scale-105 shadow-lg" : "hover:scale-102"
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {!isLoading && counts && counts[tab.id] > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
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
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Search size={16} className="text-blue-600" />
              <p className="text-sm text-blue-900 flex-1">
                Showing results for <span className="font-semibold">"{searchQuery}"</span>
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search size={24} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search internships, programs, events..."
                    className="flex-1 text-lg border-none focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> to close
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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