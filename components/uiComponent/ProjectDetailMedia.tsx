"use client";

import React, { useState, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false); // Default to false, let Observer handle it
  const [isInView, setIsInView] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const current = videos.length > 0 ? videos[index] : null;

  // Optimimzation: Intersection Observer for Autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // Play when 60% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  // Reset playing state (handled by observer) but respecting manual override could be complex. 
  // simplified: Auto-play when visible, auto-pause when hidden.
  
  const getYouTubeEmbed = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      // Added mute=1 for autoplay policy compliance
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&enablejsapi=1` : null;
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
      <div className="w-full h-full">
         {coverImage ? (
            <img src={coverImage} alt={title || "Project Cover"} className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <div className="text-center p-4">
                <div className="text-lg font-bold">{title || "Project"}</div>
              </div>
            </div>
         )}
      </div>
    );
  }

  // Active Video Rendering
  return (
    <div ref={containerRef} className="w-full h-full relative group bg-black">
      {!isPlaying ? (
        // Thumbnail / Click-to-Play State
        <div 
          className="relative w-full h-full cursor-pointer overflow-hidden" 
          onClick={() => setIsPlaying(true)}
        >
           {/* Background Image */}
           {coverImage ? (
              <img src={coverImage} alt="Video thumbnail" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
           ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                 <span className="text-slate-500 font-bold">{title}</span>
              </div>
           )}

           {/* Dark Overlay */}
           <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

           {/* Play Button Overlay */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/40 shadow-xl">
                 <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 fill-current ml-1" />
                 </div>
              </div>
           </div>

           {/* Badge showing Video Type */}
           <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider border border-white/10">
              {current.type === 'youtube' ? 'YouTube' : 'Video'}
           </div>
        </div>
      ) : (
        // Playing State
        <div className="w-full h-full bg-black animate-in fade-in duration-300">
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                     <div className="p-3 rounded-full bg-slate-800"><Loader2 className="w-6 h-6 animate-spin" /></div>
                     <span className="text-sm">Video unavailable or invalid link</span>
                  </div>
                );
              })()
           ) : (
              <video 
                src={current.url} 
                className="w-full h-full" 
                controls 
                autoPlay
                muted
                playsInline
                loop
              />
           )}
        </div>
      )}

      {/* Navigation Controls (Only show if multiple videos) */}
      {videos.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={prev} className="pointer-events-auto p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors transform hover:-translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button onClick={next} className="pointer-events-auto p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors transform hover:translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
             </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {videos.map((_, i) => (
              <div 
                 key={i} 
                 onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                 className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
