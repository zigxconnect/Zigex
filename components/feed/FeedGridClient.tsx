// components/feed/FeedGridClient.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedFeedCard } from "@/components/feed/UnifiedFeedCard";
import { calculateIsOpen } from "@/components/feed/FeedGrid";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";
import { ChevronLeft, ChevronRight, Search, X, Briefcase, GraduationCap, Code, Wrench, Trophy, CalendarDays } from "lucide-react";
import type { FeedItem, Internship, Program, Event, Announcement } from "@/lib/types/feed";
import { cn } from "@/lib/utils";

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

type CategoryId = "all" | "internships" | "programs" | "events" | "announcements";

const categories = [
  { id: "all" as CategoryId, label: "All Programs", icon: Briefcase },
  { id: "internships" as CategoryId, label: "Internships", icon: GraduationCap },
  { id: "programs" as CategoryId, label: "Bootcamps", icon: Code },
  { id: "events" as CategoryId, label: "Events", icon: CalendarDays },
  { id: "announcements" as CategoryId, label: "Workshops", icon: Wrench },
];

import { ProgramDetailsSlideOver } from "@/components/feed/ProgramDetailsSlideOver";

export function FeedGridClient({ initialData, error }: FeedGridClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { isOpen, modalData, openModal, closeModal } = useVideoModal();

  // Transform data with type tags
  const transformedData = useMemo(() => ({
    internships: (initialData.internships || []).map((i) => ({ ...i, _type: "internships" as const })),
    events: (initialData.events || []).map((e) => ({ ...e, _type: "events" as const })),
    programs: (initialData.programs || []).map((p) => ({ ...p, _type: "programs" as const })),
    announcements: (initialData.announcements || []).map((a) => ({ ...a, _type: "announcements" as const })),
  }), [initialData]);

  const handleItemClick = (item: FeedItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // All items sorted by date
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

  // Filter by active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return allContentSorted;
    return (transformedData[activeCategory] || []) as FeedItem[];
  }, [activeCategory, allContentSorted, transformedData]);

  // Display max 9 in carousel
  const displayedItems = filteredItems.slice(0, 9);
  const totalSlides = Math.max(1, Math.ceil(displayedItems.length / 3));

  const handleCategoryChange = (id: CategoryId) => {
    setActiveCategory(id);
    setActiveSlide(0);
    // Reset scroll position
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.offsetWidth;
    
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setActiveSlide((prev) => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setActiveSlide((prev) => Math.min(totalSlides - 1, prev + 1));
    }
  };

  if (error) return (
    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
      <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
        <X className="text-red-500" size={20} />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Something went wrong</h3>
      <p className="text-[12px] text-slate-400 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Category Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-300 border shrink-0",
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                  : "bg-card text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-650 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <cat.icon size={14} strokeWidth={2} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Cards Carousel ── */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Search size={28} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No opportunities found</h3>
          <p className="text-[12px] text-slate-400 font-medium">Check back soon for new programs and internships</p>
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 hidden lg:flex"
          >
            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 hidden lg:flex"
          >
            <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
          </button>

          {/* Cards Row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth pb-2"
          >
            <AnimatePresence mode="popLayout">
              {displayedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex-none w-[80%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start"
                >
                  <UnifiedFeedCard
                    item={item}
                    index={index}
                    isOpen={calculateIsOpen(item)}
                    onClick={handleItemClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!scrollRef.current) return;
                    scrollRef.current.scrollTo({ left: scrollRef.current.offsetWidth * i, behavior: "smooth" });
                    setActiveSlide(i);
                  }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    activeSlide === i
                      ? "w-5 h-1.5 bg-[#155DFC]"
                      : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ProgramDetailsSlideOver
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

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

