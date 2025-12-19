"use client";

import React, { useState, useEffect } from "react";
import { Play, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Props {
  uploadedVideo?: string | null;
  youtubeVideo?: string | null;
  coverImage?: string | null;
  title?: string;
}

export default function ProjectDetailMedia({ uploadedVideo, youtubeVideo, coverImage, title }: Props) {
  const videos: Array<{ type: "uploaded" | "youtube"; url: string }> = [];
  if (uploadedVideo) videos.push({ type: "uploaded", url: uploadedVideo });
  if (youtubeVideo) videos.push({ type: "youtube", url: youtubeVideo });

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [imageError, setImageError] = useState(false);
  const current = videos.length > 0 ? videos[index] : null;

  // Improved Image URL logic
  const getImageUrl = (url: string | null | undefined) => {
    if (!url || url.length < 5) return null;
    if (url.includes('supabase.co')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return null;
  };

  const currentImageUrl = getImageUrl(coverImage);

  // Reset playing state when switching videos in carousel
  useEffect(() => {
    setIsPlaying(false);
  }, [index, uploadedVideo, youtubeVideo]);

  const getYouTubeEmbed = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : null;
    } catch (e) {
      return null;
    }
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + videos.length) % videos.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % videos.length);
  };

  // If no videos at all, just show cover or placeholder
  if (!current) {
    return (
      <div className="w-full h-full bg-[#F6F8FF]">
         {!imageError && currentImageUrl ? (
            <div className="relative w-full h-full">
              <Image 
                src={currentImageUrl} 
                alt={title || "Project Cover"} 
                fill 
                className="object-cover" 
                priority
                onError={() => setImageError(true)}
              />
            </div>
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] text-white">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <ImageIcon size={40} className="text-white" />
                </div>
                <div className="text-xl font-black uppercase tracking-widest">{title || "PROJECT MEDIA"}</div>
              </div>
            </div>
         )}
      </div>
    );
  }

  // Active Video Rendering
  return (
    <div className="w-full h-full relative group bg-black">
      {!isPlaying ? (
        // Thumbnail / Click-to-Play State
        <div 
          className="relative w-full h-full cursor-pointer overflow-hidden" 
          onClick={() => setIsPlaying(true)}
        >
           {/* Background Image / Thumbnail */}
           {!imageError && currentImageUrl ? (
              <Image 
                src={currentImageUrl} 
                alt="Video thumbnail" 
                fill 
                className="object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110" 
                onError={() => setImageError(true)}
              />
           ) : (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center">
                 <div className="mb-2 text-slate-700 uppercase font-black tracking-widest text-[10px]">Project Preview</div>
                 <span className="text-slate-500 font-bold px-12 text-center line-clamp-2">{title}</span>
              </div>
           )}

           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent group-hover:via-slate-900/20 transition-all duration-500" />

           {/* Play Button Overlay */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#155DFC]/30 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-2xl">
                 <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#155DFC] fill-current ml-1" />
                 </div>
              </div>
           </div>

           {/* Badge showing Video Type */}
           <div className="absolute top-6 left-6 flex gap-2">
             <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-white/10">
                {current.type === 'youtube' ? 'YouTube View' : 'Motion Preview'}
             </div>
           </div>
        </div>
      ) : (
        // Playing State
        <div className="w-full h-full bg-black animate-in fade-in zoom-in-95 duration-500">
           {current.type === "youtube" ? (
              (() => {
                const emb = getYouTubeEmbed(current.url);
                return emb ? (
                  <iframe 
                    src={emb} 
                    className="w-full h-full" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-900">
                     <div className="p-4 rounded-3xl bg-slate-800 shadow-xl border border-white/5"><Loader2 className="w-8 h-8 animate-spin text-[#155DFC]" /></div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Media unavailable</span>
                  </div>
                );
              })()
           ) : (
              <video 
                src={current.url} 
                className="w-full h-full" 
                controls 
                autoPlay
              />
           )}
           <button onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }} className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-xl p-2.5 z-40 transition-all border border-white/10">
              <div className="w-3 h-3 flex items-center justify-center text-[10px] font-black">EXIT</div>
           </button>
        </div>
      )}

      {/* Navigation Controls (Only show if multiple videos) */}
      {videos.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button onClick={prev} className="pointer-events-auto p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 group-active:scale-90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button onClick={next} className="pointer-events-auto p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 group-active:scale-90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
             </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 p-1 bg-black/20 backdrop-blur-xl rounded-full border border-white/10">
            {videos.map((_, i) => (
              <div 
                 key={i} 
                 onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                 className={`h-1.5 rounded-full cursor-pointer transition-all duration-500 ${i === index ? 'bg-white w-8' : 'bg-white/20 w-3 hover:bg-white/40'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
