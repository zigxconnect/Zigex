"use client";

import { useState, useEffect } from "react";
import { Play, Eye, Clock, Zap, Loader2, AlertCircle } from "lucide-react";
import { getHappeningNowContent, type HappeningNowItem } from "@/lib/actions/happening-now.actions";
import { getRandomViewCount, formatSimpleViewCount } from "@/lib/utils/randomViews";

export const HappeningNowGrid = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HappeningNowItem | null>(null);
  const [data, setData] = useState<HappeningNowItem[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getHappeningNowContent();
        setData(result || []);
        
        // Generate random view counts for each item
        const newViewCounts: Record<string, number> = {};
        (result || []).forEach((item) => {
          newViewCounts[item.id] = getRandomViewCount();
        });
        setViewCounts(newViewCounts);
        setError(null);
      } catch (err) {
        console.error("Error loading happening now:", err);
        setError("Failed to load content");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Zap className="w-8 h-8 text-blue-500 fill-blue-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-blue-600">Happening Now</h2>
          </div>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading happening now...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || data.length === 0) {
    return (
      <div className="w-full mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Zap className="w-8 h-8 text-blue-500 fill-blue-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-blue-600">Happening Now</h2>
          </div>
          <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-red-600">
                {error || "No happening now content available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Zap className="w-8 h-8 text-blue-500 fill-blue-500 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 bg-blue-500 blur-xl opacity-50 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-blue-600 bg-clip-text ">
              Happening Now
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Don't miss out on what's live right now
            </p>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {data.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const isFirstItem = index === 0;

            return (
              <div
                key={item.id}
                className={`
                  relative group cursor-pointer overflow-hidden rounded-2xl
                  ${isFirstItem ? 'col-span-2 row-span-2' : 'aspect-3/4'}
                  transform transition-all duration-300
                  ${isHovered ? 'scale-[1.02] z-10' : 'scale-100'}
                `}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedItem(item)}
              >
                {/* Image/Video Container */}
                <div className="relative w-full h-full bg-linear-to-br from-gray-900 to-gray-800">
                  <img
                    src={item.type === "video" ? item.thumbnail : item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Live Badge (for live items) */}
                  {item.isLive && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span className="text-white text-xs font-bold uppercase tracking-wide">
                        Live
                      </span>
                    </div>
                  )}

                  {/* Video Play Button */}
                  {item.type === "video" && (
                    <div
                      className={`
                      absolute inset-0 flex items-center justify-center
                      transition-opacity duration-300
                      ${isHovered ? 'opacity-100' : 'opacity-80'}
                    `}
                    >
                      <div className="relative">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-7 h-7 text-red-600 fill-red-600 ml-1" />
                        </div>
                        {item.isLive && (
                          <div className="absolute inset-0 w-16 h-16 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 backdrop-blur-sm rounded-full">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-semibold">
                      {formatSimpleViewCount(viewCounts[item.id] || 0)}
                    </span>
                  </div>

                  {/* Content Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                      <p
                        className={`
                        text-white font-semibold mb-1 line-clamp-2
                        ${isFirstItem ? 'text-lg' : 'text-sm'}
                      `}
                      >
                        {item.caption}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-xs font-medium">
                          {item.company}
                        </span>
                        {!item.isLive && (
                          <>
                            <span className="text-gray-500">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-400 text-xs">Now</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div
                    className={`
                    absolute inset-0 rounded-2xl border-2 border-transparent
                    transition-all duration-300 pointer-events-none
                    ${
                      isHovered
                        ? item.isLive
                          ? "border-red-500 shadow-2xl shadow-red-500/50"
                          : "border-purple-500 shadow-2xl shadow-purple-500/30"
                        : ""
                    }
                  `}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* See All Button */}
        {/* <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
            Explore All Live Events
          </button>
        </div> */}
      </div>

      {/* Modal for expanded view (optional) */}
     {/* Modal for expanded view with slideshow */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-5xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Centered and Responsive */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:rotate-90 border border-white/30 flex-shrink-0"
            >
              <span className="text-xl sm:text-2xl font-light">✕</span>
            </button>

            {/* Content Container */}
            <div className="relative bg-linear-to-br from-blue-600/40 to-blue-800/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {selectedItem.type === "video" ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedItem.src}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.caption}
                    className="w-full max-h-[70vh] object-contain"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* Info Overlay */}
              <div className="relative bg-linear-to-t from-black/80 to-transparent p-8">
                <div className="max-w-3xl">
                  {selectedItem.isLive && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        <span className="text-white text-xs font-bold uppercase tracking-wide">
                          Live
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                        <Eye className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">
                          {formatSimpleViewCount(viewCounts[selectedItem.id] || 0)} watching
                        </span>
                      </div>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                    {selectedItem.caption}
                  </h3>
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="text-lg font-medium">{selectedItem.company}</span>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Happening Now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows for Slideshow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = data.findIndex((item: HappeningNowItem) => item.id === selectedItem.id);
                  const prevIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
                  setSelectedItem(data[prevIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = data.findIndex((item: HappeningNowItem) => item.id === selectedItem.id);
                  const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
                  setSelectedItem(data[nextIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                ›
              </button>

              {/* Slideshow Indicators */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {data.map((item: HappeningNowItem) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      item.id === selectedItem.id
                        ? 'w-8 bg-white'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};