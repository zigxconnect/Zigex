"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Share2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Reuse formatting from the main stories component
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface ProfileStoriesProps {
  stories: any[];
  user: any;
}

export default function ProfileStories({ stories, user }: ProfileStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  if (!stories || stories.length === 0) return null;

  const handleNext = () => {
    const idx = stories.findIndex(s => s.id === selectedStory.id);
    if (idx < stories.length - 1) setSelectedStory(stories[idx + 1]);
    else setSelectedStory(null);
  };

  const handlePrev = () => {
    const idx = stories.findIndex(s => s.id === selectedStory.id);
    if (idx > 0) setSelectedStory(stories[idx - 1]);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Status Updates
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStory(story)}
            className={cn(
              "flex-none w-32 h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm border-2 border-white relative group",
              story.type === 'text' ? (story.color || "bg-blue-600") : "bg-black"
            )}
          >
            {story.type === 'image' ? (
              <img src={story.content} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-3 text-center">
                <p className={cn("text-white font-bold line-clamp-4 leading-tight", 
                  story.font_size === 'text-6xl' ? 'text-lg' : 
                  story.font_size === 'text-4xl' ? 'text-sm' : 'text-[10px]'
                )}>
                  {story.content}
                </p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[8px] text-white/80 font-bold uppercase tracking-widest">{formatTime(story.created_at)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black backdrop-blur-xl p-0"
          >
            <div className="relative w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-50">
                {stories.map((s) => (
                  <div key={s.id} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                    <div 
                      className={cn("h-full bg-white transition-all duration-300", 
                        s.id === selectedStory.id ? "w-full" : 
                        stories.indexOf(s) < stories.indexOf(selectedStory) ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 p-0.5">
                    <img src={user.avatar_url || "https://i.ibb.co/CpS0wpjC/z3.jpg"} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black tracking-tight">{user.full_name}</p>
                    <p className="text-[10px] text-white/60 font-medium">{formatTime(selectedStory.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStory(null)} className="text-white/80 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center relative group">
                {/* Tap Targets */}
                <div className="absolute inset-0 z-10 flex">
                  <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
                  <div className="w-2/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
                </div>

                {selectedStory.type === 'image' ? (
                  <div className="w-full h-full relative">
                    <img src={selectedStory.content} className="w-full h-full object-cover" alt="" />
                    {selectedStory.caption && (
                      <div className="absolute bottom-32 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-lg font-bold leading-relaxed">{selectedStory.caption}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center p-12 text-center", selectedStory.color || "bg-blue-600")}>
                    <p className={cn("text-white font-black leading-tight max-w-sm", selectedStory.font_size || "text-3xl")}>
                      {selectedStory.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="absolute bottom-10 left-6 right-6 z-50 flex gap-4">
                <Button 
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full h-14 gap-2 backdrop-blur-md"
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: `Zigex Story - ${user.full_name}`,
                        text: selectedStory.type === 'text' ? selectedStory.content : (selectedStory.caption || 'Check my story!'),
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <Share2 size={20} /> Share
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
