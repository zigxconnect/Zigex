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
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#1A3CB9] shadow-2xl">
      {/* Background Image with Minimal Overlay */}
      <div className="absolute inset-0">
        <Image
          src={normalizeImageSrc(imageUrl)}
          alt={title}
          fill
          className="object-cover opacity-60"
          priority
        />
        {/* Blue Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A3CB9] via-[#1A3CB9]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-10 sm:px-12 sm:py-16 lg:px-16 lg:py-20 flex flex-col items-start">
        {/* Type Badge - Focal Point */}
        <Badge className="mb-6 bg-[#155DFC] text-white border-0 px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(21,93,252,0.5)] font-black uppercase tracking-widest text-xs">
          {type}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter max-w-4xl">
          {title}
        </h1>

        {/* Meta Info - Icons with Focal Backgrounds */}
        <div className="flex flex-wrap gap-4 text-sm text-white">
          {location && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#155DFC] flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <span className="font-bold tracking-tight">{location}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#155DFC] flex items-center justify-center">
                <Calendar size={18} className="text-white" />
              </div>
              <span className="font-bold tracking-tight">{formatDate(startDate)}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#155DFC] flex items-center justify-center">
                <Calendar size={18} className="text-white" />
              </div>
              <span className="font-bold tracking-tight">Until {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
