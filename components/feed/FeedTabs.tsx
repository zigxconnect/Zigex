// components/feed/FeedTabs.tsx
"use client";

import { useFeedStore } from "@/lib/zustand/store";
import { Search } from "lucide-react";
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
];

export function FeedTabs({ counts, isLoading = false }: FeedTabsProps) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useFeedStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);
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
              className="w-full cursor-pointer lg:w-96 flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
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
              <div className="inline-flex bg-gray-50 rounded-xl p-1.5 shadow-sm min-w-max border border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`
                      relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm 
                      transition-all duration-300 whitespace-nowrap overflow-hidden
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                          : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Shimmer effect on active tab */}
                    {activeTab === tab.id && (
                      <span
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      />
                    )}

                    {/* Particle effects on hover for active tab */}
                    {activeTab === tab.id && hoveredTab === tab.id && (
                      <>
                        <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                        <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                        <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
                      </>
                    )}

                    {/* Pulse background on hover for active tab */}
                    {activeTab === tab.id && hoveredTab === tab.id && (
                      <span className="absolute inset-0 bg-blue-400 animate-ping opacity-20" />
                    )}

                    {/* Tab content */}
                    <span className="relative z-10">{tab.label}</span>
                    
                    {!isLoading && counts && counts[tab.id] > 0 && (
                      <span
                        className={`
                          relative z-10 px-2 py-0.5 text-xs rounded-full font-bold
                          ${
                            activeTab === tab.id
                              ? "bg-white/25 text-white"
                              : "bg-gray-200 text-gray-700"
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(5px, 20px) scale(0);
            opacity: 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-particle-1 {
          animation: particle-1 0.8s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 0.8s ease-out forwards;
          animation-delay: 0.1s;
        }

        .animate-particle-3 {
          animation: particle-3 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  );
}