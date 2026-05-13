// components/feed/UnifiedFeedCard.tsx
"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin, 
  Clock,
  Bookmark,
  Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { FeedItem } from "@/lib/types/feed";
import { normalizeImageSrc, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UnifiedFeedCardProps {
  item: FeedItem;
  onLiveClick?: () => void;
  onClick?: (item: FeedItem) => void;
  index?: number;
  isOpen?: boolean;
}

export const UnifiedFeedCard = memo(({ item, onLiveClick, onClick, index = 0, isOpen = true }: UnifiedFeedCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError) return "/placeholder.png";
    switch (item._type) {
      case "internships": return normalizeImageSrc((item as any).cover_image_url);
      case "programs": return normalizeImageSrc((item as any).program_picture_url);
      case "events": return normalizeImageSrc((item as any).event_picture_url);
      case "announcements": return normalizeImageSrc((item as any).image_url);
      default: return "/placeholder.png";
    }
  };

  const companyName = typeof item.company === "string" ? item.company : item.company?.company_name || "Zigex";
  const now = new Date();

  // Days until start
  const getStartInfo = () => {
    const startDate = (item as any).start_date || (item as any).event_date;
    if (!startDate) return null;
    const start = new Date(startDate);
    const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    if (diffDays === 0) return "Starts today";
    return `Starts in ${diffDays} days`;
  };

  // Duration
  const getDuration = () => {
    const p = item as any;
    if (p.duration) return p.duration;
    if (p.start_date && p.end_date) {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      const weeks = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weeks <= 0) return null;
      return `${weeks} Week${weeks > 1 ? "s" : ""} Program`;
    }
    return null;
  };

  // Badge
  const getBadge = () => {
    if (index === 0) return { text: "FEATURED", bg: "bg-[#155DFC]" };
    if (index === 1) return { text: "POPULAR", bg: "bg-emerald-500" };
    if (index === 2) return { text: "NEW", bg: "bg-orange-500" };
    return null;
  };

  const badge = getBadge();
  const startInfo = getStartInfo();
  const duration = getDuration();
  const locationText = item.location || (item as any).venue || "Online";

  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      const slug = slugify(item.title) || item.id;
      router.push(`/feed/${slug}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group relative overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-32 sm:h-36 flex-shrink-0 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 45vw, 25vw"
          priority={index < 4}
          quality={80}
        />

        {/* Badge */}
        {badge && (
          <div className={`absolute top-2 left-2 z-10 ${badge.bg} text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full shadow-lg`}>
            {badge.text}
          </div>
        )}

        {/* Bookmark */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md group/book"
        >
          <Bookmark size={10} className="text-slate-500 group-hover/book:text-[#155DFC] transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col space-y-2">
        {/* Title */}
        <h3 className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-[#155DFC] transition-colors">
          {item.title}
        </h3>

        {/* Location & Duration */}
        <div className="flex items-center gap-2 text-slate-400 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold truncate max-w-[120px] uppercase">{locationText}</span>
          </div>
          {duration && (
            <>
              <span className="text-slate-200 dark:text-slate-700 text-[10px]">•</span>
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold uppercase">{duration}</span>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed line-clamp-2 italic">
          {item.description || `${companyName} opportunity — explore this and grow.`}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
          {startInfo ? (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar size={9} />
              <span className="text-[8px] font-bold uppercase">{startInfo}</span>
            </div>
          ) : <div />}

          <button
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#155DFC] text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:scale-105 transition-all active:scale-[0.95] shadow-sm shadow-blue-500/20"
          >
            {item._type === 'announcements' ? 'View' : 'Apply'}
          </button>
        </div>
      </div>
    </Card>
  );
});

UnifiedFeedCard.displayName = "UnifiedFeedCard";