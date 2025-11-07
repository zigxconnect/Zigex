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
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={normalizeImageSrc(imageUrl)}
          alt={title}
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* Type Badge */}
        <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/30">
          {type}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          {location && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Calendar size={16} />
              <span>{formatDate(startDate)}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Clock size={16} />
              <span>Until {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
