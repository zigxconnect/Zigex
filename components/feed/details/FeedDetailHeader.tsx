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
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[2rem] bg-card border border-border shadow-md min-h-[400px] sm:min-h-[500px] flex flex-col justify-end">
      {/* Background Image with Minimal Overlay */}
      <div className="absolute inset-0">
        <Image
          src={normalizeImageSrc(imageUrl)}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* White Fade Overlay - Bottom 20% only */}
        <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Content Container */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-8 sm:left-8 sm:right-8 lg:bottom-10 lg:left-10 lg:right-10 flex justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-3xl border border-white/50 shadow-lg p-4 sm:p-8 max-w-4xl w-full">
          {/* Type Badge - White with Black Text */}
          <Badge className="mb-2 bg-white text-foreground border border-border px-3 py-1 rounded-md shadow-sm font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white inline-flex">
            {type}
          </Badge>

          {/* Title */}
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4 leading-tight sm:leading-[1.1] tracking-tighter drop-shadow-sm">
            {title}
          </h1>

          {/* Meta Info - Icons with Focal Backgrounds */}
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-foreground">
            {location && (
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-primary" />
                </div>
                <span className="font-bold tracking-tight">{location}</span>
              </div>
            )}
            {startDate && (
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-success/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-success" />
                </div>
                <span className="font-bold tracking-tight text-foreground">{formatDate(startDate)}</span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-destructive/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-destructive" />
                </div>
                <span className="font-bold tracking-tight text-foreground">Until {formatDate(endDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
