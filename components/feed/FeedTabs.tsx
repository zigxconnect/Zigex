// components/feed/FeedTabs.tsx
"use client";

import { useFeedStore } from "@/lib/zustand/store";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

  const isDetailPage = pathname.includes("/feed/") && pathname !== "/feed" && !pathname.includes("/feed/projects");

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (isDetailPage) router.push("/feed");
    
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <div className="relative group/tabs">
      {/* Mobile Scroll Indicators - Left */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
      
      <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 scroll-smooth">
        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] w-max min-w-full sm:min-w-0 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts?.[tab.id] || 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.8rem] transition-all duration-500 outline-none group shrink-0",
                  isActive 
                    ? "text-white" 
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {/* Premium Glow Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeFeedTab"
                    className="absolute inset-0 bg-[#155DFC] rounded-[1.8rem] shadow-[0_10px_25px_-5px_rgba(21,93,252,0.5)] z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                
                <span className={cn(
                  "relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500",
                  isActive ? "scale-100" : "scale-95 group-hover:scale-100"
                )}>
                  {tab.label}
                </span>
                
                <AnimatePresence mode="wait">
                  {count > 0 && !isLoading && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className={cn(
                        "relative z-10 min-w-[22px] h-5.5 flex items-center justify-center rounded-xl text-[9px] font-black transition-all duration-500 border",
                        isActive 
                          ? "bg-white/10 text-white border-white/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 shadow-sm"
                      )}
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Interactive State */}
                {!isActive && (
                  <div className="absolute inset-0 bg-[#155DFC]/0 group-hover:bg-[#155DFC]/5 rounded-[1.8rem] transition-all duration-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Scroll Indicators - Right */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
    </div>
  );
}
