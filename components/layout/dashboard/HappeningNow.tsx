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
              <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Happening Now</h2>
          </div>
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading happening now...</p>
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
              <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Happening Now</h2>
          </div>
          <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-destructive">
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
            <Zap className="w-8 h-8 text-primary fill-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Happening Now
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
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
                <div className="relative w-full h-full bg-muted">
                  <img
                    src={item.type === "video" ? item.thumbnail : item.src || "/placeholder.png"}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />

                  {/* Gradient Overlay - Kept for text readability but standard black */}
                  <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Live Badge (for live items) */}
                  {item.isLive && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-destructive rounded-full shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
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
                        <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-7 h-7 text-primary fill-primary ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
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
                        <span className="text-gray-200 text-xs font-medium">
                          {item.company}
                        </span>
                        {!item.isLive && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-300 text-xs">Now</span>
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
                        ? "border-primary/50"
                        : ""
                    }
                  `}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for expanded view */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-5xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:rotate-90 border border-white/10 flex-shrink-0"
            >
              <span className="text-xl sm:text-2xl font-light">✕</span>
            </button>

            {/* Content Container */}
            <div className="relative bg-card rounded-3xl overflow-hidden border border-border shadow-2xl">
              {selectedItem.type === "video" ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={selectedItem.src}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative bg-black">
                  <img
                    src={selectedItem.src || "/placeholder.png"}
                    alt={selectedItem.caption}
                    className="w-full max-h-[70vh] object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
              )}

              {/* Info Overlay Panel */}
              <div className="p-6 bg-card border-t border-border">
                <div className="max-w-3xl">
                  {selectedItem.isLive && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-wide">
                          Live
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm font-semibold">
                          {formatSimpleViewCount(viewCounts[selectedItem.id] || 0)} watching
                        </span>
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {selectedItem.caption}
                  </h3>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-lg font-medium text-foreground">{selectedItem.company}</span>
                    <span>•</span>
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
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 border border-white/10 hover:scale-110"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 border border-white/10 hover:scale-110"
              >
                ›
              </button>
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