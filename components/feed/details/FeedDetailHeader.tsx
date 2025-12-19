// components/feed/detail/FeedDetailHeader.tsx
"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/uiComponent/Badge";

interface FeedDetailHeaderProps {
  title: string;
  type: string;
  imageUrl: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export function FeedDetailHeader({
  title,
  type,
  imageUrl,
  startDate,
  endDate,
  location,
}: FeedDetailHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#155DFC] via-[#1A3CB9] to-[#155DFC] shadow-2xl shadow-blue-200/50">
      {/* Background Image with Minimal Overlay */}
      <div className="absolute inset-0">
        <Image
          src={normalizeImageSrc(imageUrl)}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* Minimal gradient overlay - only at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#155DFC]/80 via-[#155DFC]/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {/* Type Badge */}
        <Badge className="mb-3 sm:mb-4 bg-white/90 text-[#155DFC] border-white/50 backdrop-blur-md hover:bg-white font-black uppercase tracking-widest text-xs shadow-lg">
          {type}
        </Badge>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-2xl">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-white">
          {location && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/50 shadow-lg hover:bg-white transition-all text-[#155DFC]">
              <MapPin size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
              <span className="font-bold">{location}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/50 shadow-lg hover:bg-white transition-all text-[#155DFC]">
              <Calendar size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
              <span className="font-bold">{formatDate(startDate)}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/50 shadow-lg hover:bg-white transition-all text-[#155DFC]">
              <Clock size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
              <span className="font-bold">Until {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
