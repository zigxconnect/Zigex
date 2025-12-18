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
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#155DFC] via-[#1A3CB9] to-[#155DFC] shadow-2xl shadow-blue-200/50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={normalizeImageSrc(imageUrl)}
          alt={title}
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#155DFC]/90 via-[#1A3CB9]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* Type Badge */}
        <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-md hover:bg-white/30 font-black uppercase tracking-widest text-xs shadow-lg">
          {type}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-sm text-white">
          {location && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg hover:bg-white/30 transition-all">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="font-bold">{location}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg hover:bg-white/30 transition-all">
              <Calendar size={16} className="flex-shrink-0" />
              <span className="font-bold">{formatDate(startDate)}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg hover:bg-white/30 transition-all">
              <Clock size={16} className="flex-shrink-0" />
              <span className="font-bold">Until {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
