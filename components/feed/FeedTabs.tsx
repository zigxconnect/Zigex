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
  { id: "all" as TabId, label: "All" },
  { id: "programs" as TabId, label: "Programs" },
  { id: "internships" as TabId, label: "Internships" },
  { id: "events" as TabId, label: "Events" },
  { id: "announcements" as TabId, label: "Posts" },
];

export function FeedTabs({ counts, isLoading = false }: FeedTabsProps) {
  const { activeTab, setActiveTab } = useFeedStore();
  const router = useRouter();
  const pathname = usePathname();

  // Navigation logic
  const isDetailPage = pathname.includes("/feed/") && pathname !== "/feed" && !pathname.includes("/feed/projects");

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (isDetailPage) router.push("/feed");
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id] || 0;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2
              ${isActive 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }
            `}
          >
            <span>{tab.label}</span>
            {count > 0 && !isLoading && (
              <span className={`
                w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold
                ${isActive ? "bg-[#155DFC] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
