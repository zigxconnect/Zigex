"use client";

import { useState } from "react";
import { Play, Eye, Clock, Zap } from "lucide-react";

interface HappeningNowItem {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  caption: string;
  company: string;
  viewCount: number;
  isLive?: boolean;
}

const mockData: HappeningNowItem[] = [
  {
    id: "1",
    type: "video",
    src: "https://www.youtube.com/embed/CEITpcIttl4",
    thumbnail: "/n7.png",
    caption: "Live Q&A: Software Engineering Internship",
    company: "NervTech",
    viewCount: 1247,
    isLive: true,
  },
  {
    id: "2",
    type: "image",
    src: "/n8.png",
    caption: "Networking Hour with Industry Leaders",
    company: "TechHub",
    viewCount: 856,
  },
  {
    id: "3",
    type: "image",
    src: "/n2.png",
    caption: "Design Sprint Kickoff Ceremony",
    company: "Creative Labs",
    viewCount: 623,
  },
  {
    id: "4",
    type: "image",
    src: "/n3.png",
    caption: "Panel Discussion: Future of Tech",
    company: "Innovation Summit",
    viewCount: 1089,
  },
  {
    id: "5",
    type: "image",
    src: "/n5.png",
    caption: "Workshop: AI & Machine Learning",
    company: "Data Science Co",
    viewCount: 734,
  },
  {
    id: "6",
    type: "image",
    src: "/z1.png",
    caption: "Career Fair: Meet Your Future Team",
    company: "StartUp Expo",
    viewCount: 945,
  },
  {
    id: "7",
    type: "image",
    src: "/z2.png",
    caption: "Coding Challenge: Win Prizes",
    company: "DevCommunity",
    viewCount: 512,
  },
//   {
//     id: "8",
//     type: "image",
//     src: "/skye8-internship.jpg",
//     caption: "Product Launch Event",
//     company: "NextGen Labs",
//     viewCount: 1456,
//   },
//   {
//     id: "9",
//     type: "image",
//     src: "/nervtech.png",
//     caption: "Mentorship Meetup",
//     company: "Growth Network",
//     viewCount: 678,
//   },
//   {
//     id: "10",
//     type: "image",
//     src: "/sky8.png",
//     caption: "Demo Day Presentations",
//     company: "Accelerator Hub",
//     viewCount: 892,
//   },
];

export const HappeningNowGrid = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HappeningNowItem | null>(null);

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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
          {mockData.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const isFirstItem = index === 0;

            return (
              <div
                key={item.id}
                className={`
                  relative group cursor-pointer overflow-hidden rounded-2xl
                  ${isFirstItem ? 'col-span-2 row-span-2' : 'aspect-[3/4]'}
                  transform transition-all duration-300
                  ${isHovered ? 'scale-[1.02] z-10' : 'scale-100'}
                `}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedItem(item)}
              >
                {/* Image/Video Container */}
                <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
                  <img
                    src={item.type === "video" ? item.thumbnail : item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-semibold">
                      {formatViewCount(item.viewCount)}
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
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-gray-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
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
              <img
                src={selectedItem.src}
                alt={selectedItem.caption}
                className="w-full"
              />
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedItem.caption}
              </h3>
              <p className="text-gray-400">{selectedItem.company}</p>
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