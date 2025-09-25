import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Building2,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Share2,
  Linkedin,
  Facebook,
  Copy,
  Check
} from "lucide-react";
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
  viewMode?: "grid" | "list";
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
  viewMode = "grid",
}: InternshipCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const internshipUrl = `https://zigex.vercel.app/internships/${id}`;
  const shareText = `Check out this ${type} internship at ${company}: ${title} on ZIGEX`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(internshipUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(internshipUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(internshipUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(internshipUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${internshipUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(internshipUrl)}&text=${encodeURIComponent(shareText)}`
  };

  if (viewMode === "list") {
    return (
      <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex">
          {/* Enhanced Image Section */}
          <div className="relative w-56 h-36 flex-shrink-0">
            <Image
              src={cover_image_url || "/int.png"}
              alt={`${company} internship`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full backdrop-blur-sm shadow-lg">
                {category}
              </span>
            </div>
          </div>

          {/* Enhanced Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Header with Company Logo */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${logoColor}, ${logoColor}dd)` 
                  }}
                >
                  {company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    <p className="text-sm text-gray-700 font-medium">{company}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Details */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MapPin size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">{type}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="p-2.5 hover:bg-blue-50 hover:scale-110 transition-all duration-200 rounded-lg"
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={18} className="text-blue-600" />
                  ) : (
                    <Bookmark size={18} className="text-gray-400 hover:text-blue-600" />
                  )}
                </Button>

                {/* Enhanced Share Button with Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="p-2.5 hover:bg-gray-50 hover:scale-110 transition-all duration-200 rounded-lg"
                  >
                    <Share2 size={18} className="text-gray-400 hover:text-gray-600" />
                  </Button>

                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 px-1 z-20 min-w-[200px]">
                      <div className="flex items-center gap-2 p-2">
                        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-sm">
                          <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">𝕏</span>
                          </div>
                          <span>X (Twitter)</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors w-full text-sm">
                          <Linkedin size={16} className="text-blue-600" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors w-full text-sm">
                          <Facebook size={16} className="text-blue-500" />
                          <span>Facebook</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors w-full text-sm">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                            </svg>
                          </div>
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors w-full text-sm">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                          </div>
                          <span>Telegram</span>
                        </a>
                      </div>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-5 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-sm"
                      >
                        {copySuccess ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="text-gray-500" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`students/internships/${id}`}>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="font-medium">Read More</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Click Outside Handler */}
        {showShareMenu && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowShareMenu(false)}
          />
        )}
      </div>
    );
  }

  // Enhanced Grid View
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden hover:-translate-y-2">
      {/* Action Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="p-2.5 bg-white/95 hover:bg-white shadow-lg rounded-xl backdrop-blur-sm hover:scale-110 transition-all duration-200"
        >
          {isBookmarked ? (
            <BookmarkCheck size={16} className="text-blue-600" />
          ) : (
            <Bookmark size={16} className="text-gray-600" />
          )}
        </Button>

        {/* Share Button with Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2.5 bg-white/95 hover:bg-white shadow-lg rounded-xl backdrop-blur-sm hover:scale-110 transition-all duration-200"
          >
            <Share2 size={16} className="text-gray-600" />
          </Button>

          {/* Share Dropdown */}
          {showShareMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 px-1 z-30 min-w-[180px]">
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">𝕏</span>
                </div>
                <span>X (Twitter)</span>
              </a>
              <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                <Linkedin size={16} className="text-blue-600" />
                <span>LinkedIn</span>
              </a>
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                <Facebook size={16} className="text-blue-500" />
                <span>Facebook</span>
              </a>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 rounded-lg transition-colors text-sm">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </a>
              <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span>Telegram</span>
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors w-full text-sm"
              >
                {copySuccess ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-gray-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={cover_image_url || "/int.png"}
          alt={`${company} internship`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category Badge on Image */}
        <div className="absolute bottom-4 left-4">
          <span className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full backdrop-blur-sm shadow-lg">
            {category}
          </span>
        </div>
      </div>

      {/* Enhanced Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${logoColor}, ${logoColor}dd)` 
            }}
          >
            {company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              <p className="text-sm text-gray-700 font-medium truncate">
                {company}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Details Section */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-600 truncate">{location}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-600">{type}</span>
          </div>
        </div>

        {/* Enhanced Action Button */}
        <div className="mt-auto pt-4">
          <Link href={`/internships/${id}`} className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 group/btn hover:scale-105">
              <span>Read More</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Button>
          </Link>
        </div>
      </div>

      {/* Click Outside Handler */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};