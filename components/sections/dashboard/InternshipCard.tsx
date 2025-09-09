import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Building2, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";

interface InternshipCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logoColor: string;
  cover_image_url: string;
  viewMode?: 'grid' | 'list';
}

export const InternshipCard = ({
  id,
  title,
  company,
  location,
  type,
  category,
  logoColor,
  cover_image_url,
  viewMode = 'grid'
}: InternshipCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-200 rounded-2xl shadow-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="flex">
          {/* Image Section - Left Side */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={cover_image_url || "/int.png"}
              alt={`Cover image for ${company}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          </div>

          {/* Content Section - Right Side */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md"
                    style={{ backgroundColor: logoColor }}
                  >
                    {company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1">
                      {title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Building2 size={14} className="text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">{company}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock size={14} />
                    <span>{type}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1.5 text-xs text-blue-800 bg-blue-100 rounded-full font-medium border border-blue-200">
                    {category}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="p-2 hover:bg-gray-100"
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={18} className="text-blue-600" />
                  ) : (
                    <Bookmark size={18} className="text-gray-400" />
                  )}
                </Button>
                <Link href={`/internships/${id}`}>
                  <Button className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                    View Details
                    <ExternalLink size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group relative">
      {/* Bookmark Button - Top Right */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white shadow-md rounded-lg backdrop-blur-sm"
      >
        {isBookmarked ? (
          <BookmarkCheck size={16} className="text-blue-600" />
        ) : (
          <Bookmark size={16} className="text-gray-600" />
        )}
      </Button>

      {/* Image Section with Enhanced Overlay */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={cover_image_url || "/int.png"}
          alt={`Cover image for ${company}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Category Badge on Image */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 text-xs text-white bg-blue-800/90 rounded-full font-medium backdrop-blur-sm border border-white/20">
            {category}
          </span>
        </div>
      </div>

      {/* Card Content with Enhanced Spacing */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md"
            style={{ backgroundColor: logoColor }}
          >
            {company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1 line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-1">
              <Building2 size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium truncate">{company}</p>
            </div>
          </div>
        </div>

        {/* Details Section with Icons */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-blue-100 text-blue-700 p-1 rounded-full">
              <MapPin size={12} />
            </div>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-blue-100 text-blue-700 p-1 rounded-full">
              <Clock size={12} />
            </div>
            <span>{type}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link href={`/internships/${id}`} className="block">
            <Button className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 group/btn">
              <span>View Details</span>
              <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};