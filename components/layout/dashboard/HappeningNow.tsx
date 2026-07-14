// components/layout/dashboard/HappeningNow.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Eye, 
  Clock, 
  Zap, 
  Loader2, 
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { type HappeningNowItem } from "@/lib/actions/happening-now.actions";
import { getRandomViewCount, formatSimpleViewCount } from "@/lib/utils/randomViews";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const HappeningNowGrid = ({ initialData = [] }: { initialData?: HappeningNowItem[] }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HappeningNowItem | null>(null);
  const data = initialData;
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const newViewCounts: Record<string, number> = {};
    data.forEach((item) => {
      newViewCounts[item.id] = getRandomViewCount();
    });
    setViewCounts(newViewCounts);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="w-full mb-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-300 fill-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Happening Now</h2>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center h-80 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <p className="text-slate-500 font-bold">No active sessions or events found</p>
                <p className="text-slate-400 text-xs mt-1">Check back later for live workshops and networking fairs.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-16 pt-4">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Premium Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#155DFC] rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#155DFC]">Live Stream</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              Happening Now
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <TrendingUp size={14} className="text-[#155DFC]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Top Interactions</span>
          </div>
        </div>

        {/* High-Fidelity Responsive Grid */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8"
        >
          {data.map((item, index) => {
            const isFirstItem = index === 0;

            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 }
                }}
                className={cn(
                  "relative group cursor-pointer overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700",
                  isFirstItem ? 'col-span-2 row-span-2' : 'aspect-[4/5]'
                )}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (isFirstItem) {
                    const el = document.getElementById('feed-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setSelectedItem(item);
                  }
                }}
              >
                {isFirstItem ? (
                  <div className="relative w-full h-full bg-[#155DFC] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                    {/* Atmospheric Background */}
                    <div className="absolute inset-0">
                      <Image
                        src="https://i.ibb.co/hxT5NZVR/home.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-[2s]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#155DFC] via-[#1A38B1] to-[#0A1D56] opacity-90" />
                      
                      {/* Animated Orbs */}
                      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-20 animate-pulse" />
                      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
                    </div>

                    <div className="relative z-10 space-y-8">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl"
                      >
                        <Zap className="w-10 h-10 text-white fill-white" />
                      </motion.div>
                      
                      <div className="space-y-4">
                        <h3 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">
                          Discover <br/>New Horizon
                        </h3>
                        <p className="text-white/50 text-[10px] font-black tracking-[0.4em] uppercase">
                          Programs • Internships • Events
                        </p>
                      </div>

                      <div className="pt-4">
                        <span className="h-14 px-10 bg-white text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/30 hover:scale-105 transition-all duration-500 inline-flex items-center justify-center gap-3 group/btn">
                          Explore Hub
                          <ChevronRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-slate-200 dark:bg-slate-800">
                    <img
                      src={item.type === "video" ? item.thumbnail : item.src || "/placeholder.png"}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                    
                    {/* Modern Glass Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Live Badge */}
                    {item.isLive && (
                      <div className="absolute top-4 left-4 flex items-center gap-2.5 px-3.5 py-1.5 bg-rose-500 rounded-full shadow-lg border border-rose-400/30">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">
                          Live
                        </span>
                      </div>
                    )}

                    {/* View Count Glass Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-[10px] font-black tracking-tight">
                        {formatSimpleViewCount(viewCounts[item.id] || 0)}
                      </span>
                    </div>

                    {/* Video Interaction Indicator */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-14 h-14 bg-[#155DFC] rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 scale-90 group-hover:scale-100 transition-transform duration-500">
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Meta Data */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                      <div className="transform transition-transform duration-700 group-hover:-translate-y-2">
                        <p className="text-white font-black text-sm leading-tight line-clamp-2 tracking-tight group-hover:text-blue-300 transition-colors">
                          {item.caption}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-white/60 text-[9px] font-black uppercase tracking-widest truncate">
                            {item.company}
                          </span>
                          {!item.isLive && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                              <Clock className="w-2.5 h-2.5 text-blue-400" />
                              <span className="text-white/40 text-[8px] font-black uppercase tracking-tighter">Now</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Frame Effect */}
                    <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-[#155DFC]/30 rounded-[2.5rem] transition-colors duration-700 pointer-events-none" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Expanded Immersive Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 sm:p-10"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Controls */}
              <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white transition-all border border-white/20 group"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>

              {/* Navigation */}
              <div className="absolute inset-y-0 left-6 flex items-center z-40">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = data.findIndex(i => i.id === selectedItem.id);
                    const prevIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
                    setSelectedItem(data[prevIndex]);
                  }}
                  className="w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/10 hover:scale-110"
                >
                  <ChevronLeft size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="absolute inset-y-0 right-6 flex items-center z-40">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = data.findIndex(i => i.id === selectedItem.id);
                    const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
                    setSelectedItem(data[nextIndex]);
                  }}
                  className="w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/10 hover:scale-110"
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Media Content */}
              <div className="w-full h-full bg-black flex items-center justify-center">
                {selectedItem.type === "video" ? (
                  <iframe
                    src={selectedItem.src}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={selectedItem.src || "/placeholder.png"}
                    alt={selectedItem.caption}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Immersive Info Panel */}
              <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                 <div className="max-w-4xl space-y-4">
                    <div className="flex items-center gap-4">
                       {selectedItem.isLive && (
                         <div className="flex items-center gap-2 px-4 py-2 bg-rose-500 rounded-2xl shadow-2xl">
                           <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                           <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Live Stream</span>
                         </div>
                       )}
                       <div className="px-4 py-2 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10">
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">{selectedItem.company}</span>
                       </div>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-tight max-w-3xl">
                      {selectedItem.caption}
                    </h3>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Eye size={16} />
                          <span className="text-xs font-bold">{formatSimpleViewCount(viewCounts[selectedItem.id] || 0)} Viewers</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Active Now</span>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};