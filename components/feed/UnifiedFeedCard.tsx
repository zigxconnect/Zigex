// components/feed/UnifiedFeedCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, Building2, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import type { FeedItem, FeedType } from "@/lib/types/feed";
import { normalizeImageSrc } from "@/lib/utils";
import { Badge } from "../uiComponent/Badge";
import Link from "next/link";

interface UnifiedFeedCardProps {
  item: FeedItem;
  onLiveClick?: () => void;
}

export function UnifiedFeedCard({ item, onLiveClick }: UnifiedFeedCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError) return "/placeholder.png";
    
    switch (item._type) {
      case "internships":
        return normalizeImageSrc((item as any).cover_image_url || (item as any).internship_picture_url);
      case "programs":
        return normalizeImageSrc((item as any).program_picture_url);
      case "events":
        return normalizeImageSrc((item as any).event_picture_url);
      default:
        return "/placeholder.png";
    }
  };

  const getTypeColor = () => {
    switch (item._type) {
      case "internships":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "programs":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "events":
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getTypeLabel = () => {
    return item._type.charAt(0).toUpperCase() + item._type.slice(1, -1);
  };

  const companyName = typeof item.company === "string" 
    ? item.company 
    : item.company?.company_name || "Company";

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl transform hover:-translate-y-2">
      <Link href={`/feed/${item.id}`} className="block">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={getImageUrl()}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge className={`${getTypeColor()} border font-semibold text-xs px-3 py-1`}>
              {getTypeLabel()}
            </Badge>
            {item.is_live && (
              <Badge 
                className="bg-red-600 text-white border-red-700 font-semibold text-xs px-3 py-1 animate-pulse cursor-pointer hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  onLiveClick?.();
                }}
              >
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                LIVE
              </Badge>
            )}
          </div>

          {/* Company Logo */}
          <div className="absolute bottom-4 right-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-lg overflow-hidden border-2 border-white">
              <Image
                src={normalizeImageSrc(item.company?.logo_url || "/seedLogo.png")}
                alt={companyName}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {item.title}
          </h3>

          {/* Company Name */}
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 size={16} className="flex-shrink-0" />
            <span className="text-sm font-medium truncate">{companyName}</span>
          </div>

          {/* Meta Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>

            {item._type === "events" && (item as any).start_date && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar size={14} className="flex-shrink-0" />
                <span>{formatDate((item as any).start_date)}</span>
              </div>
            )}

            {item._type === "programs" && (item as any).duration && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock size={14} className="flex-shrink-0" />
                <span>{(item as any).duration}</span>
              </div>
            )}

            {item._type === "internships" && (item as any).department && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users size={14} className="flex-shrink-0" />
                <span>{(item as any).department}</span>
              </div>
            )}
          </div>

          {/* Description Preview */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {item.description.replace(/<[^>]*>/g, "")}
            </p>
          )}

          {/* CTA */}
          <div className="pt-4 border-t border-gray-100">
            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold rounded-lg group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
              <span>View Details</span>
              <Sparkles size={16} className="group-hover:animate-spin" />
            </button>
          </div>
        </div>
      </Link>
    </Card>
  );
}