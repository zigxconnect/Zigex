"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Type, ChevronLeft, ChevronRight, Share2, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn, slugifyUsername } from '@/lib/utils';
import { Input } from '@/components/ui/input';

import { api } from '@/lib/api/browser-client';
import { ApiClientError, isEndpointMissing, whenAvailable } from '@/lib/api/errors';
import { Trash2 } from 'lucide-react';
import { UserProfile } from '@/app/types/type'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronUp } from 'lucide-react';

const formatWhatsAppTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (date.getDate() === now.getDate()) {
       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Types ---
type StoryType = 'image' | 'text' | 'mixed';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: StoryType;
  content: string; // Image URL or Text content
  caption?: string; 
  timestamp: string;
  viewed: boolean;
  color?: string; // For text-only backgrounds
  likes?: number;
  created_at: string;
  userSlug?: string;
  fontSize?: string;
  isAnnouncement?: boolean;
}

const STORY_COLORS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-br from-orange-400 to-red-500',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-slate-700 to-slate-900',
  'bg-gradient-to-br from-amber-400 to-orange-600',
];

const FONT_SIZES = [
  { label: 'Small', value: 'text-lg' },
  { label: 'Medium', value: 'text-2xl' },
  { label: 'Large', value: 'text-4xl' },
  { label: 'Huge', value: 'text-6xl' },
];

interface FeedStoriesProps {
  currentUser?: any; // The passed profile data
}

export default function FeedStories({ currentUser }: FeedStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<StoryType>('text');
  const [loading, setLoading] = useState(true);
  
  // Creation States
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryImage, setNewStoryImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Alert & Dialog State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertOpen(true);
  };

  const scrollContainerRef = useRef<HTMLUListElement>(null);

  // New Creation Customization States
  const [selectedColor, setSelectedColor] = useState(STORY_COLORS[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(FONT_SIZES[1].value); // Default Medium (text-2xl)

  useEffect(() => {
    fetchStories();
  }, [currentUser]);

  const fetchStories = async () => {
    try {
      setLoading(true);

      // GET /stories (active ones, author embedded) and the latest
      // announcements, shown in the same strip. Spec'd: empty until deployed.
      const [storiesData, announcementsData] = await Promise.all([
        whenAvailable(async () => (await api.get<any[]>('/stories')).data ?? [], [] as any[]),
        whenAvailable(async () => (await api.get<any[]>('/announcements?limit=5')).data ?? [], [] as any[]),
      ]);


      // 5. Map User Stories
      const formattedUserStories: Story[] = storiesData.map((s: any) => {
        const isMe = s.user_id === currentUser?.profile?.user_id;
        const profile = s.author;
        
        return {
            id: s.id,
            userId: s.user_id,
            userName: isMe ? (currentUser?.name || 'Me') : (profile?.full_name || 'App User'),
            userAvatar: isMe ? (currentUser?.avatarUrl || '') : (profile?.avatar_url || `https://i.pravatar.cc/150?u=${s.user_id}`),
            userSlug: isMe ? (currentUser?.profile?.username) : (profile?.username),
            type: s.type as StoryType,
            content: s.content,
            caption: s.caption,
            timestamp: formatWhatsAppTime(s.created_at),
            viewed: false,
            color: s.color,
            fontSize: s.font_size || 'text-2xl',
            likes: 0,
            created_at: s.created_at
        };
      });

      // 6. Map Announcements to Stories
      const formattedAnnouncementStories: Story[] = announcementsData.map((a: any) => {
        const company = a.company ?? null;
        const companyName = company ? company.company_name : "Zigex Global";
        const companyLogo = company?.logo_url;

        // Use image_url if present, else text content
        const type: StoryType = a.image_url ? 'image' : 'text';
        
        return {
          id: `announcement-${a.id}`,
          userId: a.company_id || 'zigex-global',
          userName: companyName,
          userAvatar: companyLogo || '', 
          userSlug: company ? company.company_name.toLowerCase().replace(/\s+/g, '') : 'zigex',
          type: type,
          content: a.image_url || a.content.replace(/<[^>]*>/g, ""),
          caption: a.image_url ? a.content.replace(/<[^>]*>/g, "") : undefined,
          timestamp: formatWhatsAppTime(a.created_at),
          viewed: false,
          color: 'bg-gradient-to-br from-blue-700 to-slate-900',
          fontSize: 'text-xl',
          likes: 0,
          created_at: a.created_at,
          isAnnouncement: true, // Flag for specific styling and logic
        };
      });

      // 7. Merge and Sort
      const allStories = [...formattedAnnouncementStories, ...formattedUserStories].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setStories(allStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Viewing Logic
  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, viewed: true } : s));
  };
  
  const handleNextStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
    if (currentIndex < stories.length - 1) {
      handleStoryClick(stories[currentIndex + 1]);
    } else {
      setSelectedStory(null);
    }
  };

  const handlePrevStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
    if (currentIndex > 0) {
      handleStoryClick(stories[currentIndex - 1]);
    }
  };

  /* ... inside component ... */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ... existing useEffect ... */

  /* ... existing fetchStories ... */

  /* ... existing scroll ... */ 

  /* ... existing handleStoryClick ... */

  /* ... existing handleNextStory/Prev ... */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert("File Too Large", "Please select an image smaller than 5MB.");
        return;
      }
      setSelectedFile(file);
      setNewStoryImage(URL.createObjectURL(file)); // Preview
      setCreateType('image');
    }
  };

  const handleCreatePost = async () => {
    // Debug log to check what we are receiving
    // console.log("HandleCreatePost - CurrentUser:", currentUser);

    const userId = currentUser?.profile?.user_id;

    if ((!newStoryText && !newStoryImage) || !userId) {
      console.error("Missing content or user ID", { content: newStoryText || newStoryImage, userId });
      return;
    }
    
    setIsPosting(true);

    try {
      let content = newStoryImage || newStoryText;
      let finalType: StoryType = newStoryImage ? (newStoryText ? 'mixed' : 'image') : 'text';

      // POST /stories (multipart; the backend stores the image in R2).
      const body = new FormData();
      body.set('type', finalType);
      if (selectedFile && newStoryImage) {
        body.set('file', selectedFile);
        if (newStoryText) body.set('caption', newStoryText);
      } else {
        body.set('content', content);
        body.set('color', selectedColor);
        body.set('font_size', selectedFontSize);
      }

      let data: any;
      try {
        data = (await api.post<any>('/stories', body)).data;
      } catch (error) {
        if (isEndpointMissing(error)) {
          showAlert("Coming soon", "Posting stories will be available shortly.");
        } else if (error instanceof ApiClientError && error.status === 409) {
          showAlert("Limit Reached", "You can only post one story per day.");
        } else {
          throw error;
        }
        return;
      }

      // Add to local state immediately
      const newStory: Story = {
        id: data.id,
        userId: userId,
        userName: currentUser.name || 'Me',
        userAvatar: currentUser.avatarUrl || '',
        type: data.type as StoryType,
        content: data.content,
        caption: data.caption,
        color: data.color,
        fontSize: data.font_size || 'text-2xl',
        timestamp: 'Just now',
        viewed: false,
        created_at: data.created_at
      };

      setStories([newStory, ...stories]);
      setIsCreating(false);
      setNewStoryText('');
      setNewStoryImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to create story:", err);
      showAlert("Error", "Failed to post story. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const promptDeleteStory = (storyId: string) => {
    setStoryToDelete(storyId);
    setDeleteDialogOpen(true);
  };

  const executeDeleteStory = async () => {
    if (!storyToDelete) return;

    try {
        await api.delete(`/stories/${encodeURIComponent(storyToDelete)}`);
        setStories(prev => prev.filter(s => s.id !== storyToDelete));
        if (selectedStory?.id === storyToDelete) setSelectedStory(null);
    } catch (err) {
        console.error("Failed to delete story:", err);
        showAlert("Error", "Failed to delete story. Please try again.");
    } finally {
        setDeleteDialogOpen(false);
        setStoryToDelete(null);
    }
  };

  // Filter for my stories vs others
  const currentUserId = currentUser?.profile?.user_id;
  const myStories = stories.filter(s => s.userId === (currentUserId || 'me'));
  const otherStories = stories.filter(s => s.userId !== (currentUserId || 'me'));
  const hasMyStory = myStories.length > 0;

  return (
    <div className="relative w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

      <ul
        ref={scrollContainerRef}
        aria-label="Stories"
        className="hide-scrollbar -mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 py-1.5"
      >
        {/* Your story: view it, or add one */}
        <li className="flex-none">
          <button
            type="button"
            onClick={() => (hasMyStory ? handleStoryClick(myStories[0]) : setIsCreating(true))}
            className="group flex w-[72px] flex-col items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          >
            <span className="relative">
              <span
                className={cn(
                  "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full",
                  hasMyStory ? "ring-2 ring-[#155DFC] ring-offset-2" : "border-2 border-dashed border-[#B9C8E6] bg-white"
                )}
              >
                {hasMyStory && (myStories[0].type === "image" || myStories[0].type === "mixed") ? (
                  <img src={myStories[0].content} alt="" className="h-full w-full object-cover" />
                ) : currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-[#7B869C]" aria-hidden="true" />
                )}
              </span>
              {!hasMyStory && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#155DFC] text-white ring-2 ring-white">
                  <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="w-full truncate text-center text-xs font-medium text-[#0B1B3F]">
              {hasMyStory ? "Your story" : "Add story"}
            </span>
          </button>
        </li>

        {otherStories.map((story) => {
          const isImage = story.type === "image" || story.type === "mixed";
          return (
            <li key={story.id} className="flex-none">
              <button
                type="button"
                onClick={() => handleStoryClick(story)}
                aria-label={`${story.viewed ? "" : "New: "}story from ${story.userName}`}
                className="group flex w-[72px] flex-col items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
              >
                {/* Blue ring = not seen yet; grey = seen. The letter sits behind the photo, so a slow or broken photo never leaves an empty circle. */}
                <span
                  className={cn(
                    "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#155DFC] ring-offset-2",
                    story.viewed ? "ring-2 ring-[#DCE5F5]" : "ring-[2.5px] ring-[#155DFC]"
                  )}
                >
                  <span className="font-heading text-lg font-bold text-white" aria-hidden="true">
                    {story.userName.charAt(0)}
                  </span>
                  {(isImage ? story.content : story.userAvatar) && (
                    <img
                      src={isImage ? story.content : story.userAvatar}
                      alt=""
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className={cn("w-full truncate text-center text-xs", story.viewed ? "text-[#7B869C]" : "font-medium text-[#0B1B3F]")}>
                  {story.userName}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-0 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full sm:max-w-lg sm:h-[90vh] sm:rounded-[3rem] overflow-hidden bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col touch-none"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(e, { offset }) => {
                if (Math.abs(offset.y) > 100) setSelectedStory(null);
              }}
            >
              {/* Progress Indicators */}
              <div className="absolute top-4 left-6 right-6 flex gap-1.5 z-50">
                {stories.map((s) => (
                  <div key={s.id} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: s.id === selectedStory.id ? "100%" : 
                               stories.indexOf(s) < stories.indexOf(selectedStory) ? "100%" : "0%"
                      }}
                      transition={{ duration: s.id === selectedStory.id ? 5 : 0.3, ease: "linear" }}
                      onAnimationComplete={() => {
                        if (s.id === selectedStory.id) handleNextStory();
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header Profile */}
              <div className="absolute top-10 left-6 right-16 z-50 flex items-center gap-4">
                <div className="rounded-2xl border-2 border-white/30 p-0.5 overflow-hidden w-12 h-12 shadow-xl">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={selectedStory.userAvatar} className="object-cover" />
                    <AvatarFallback className="bg-[#155DFC] text-white font-black">{selectedStory.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-white">
                  <p className="font-black text-sm uppercase tracking-widest drop-shadow-md">{selectedStory.userName}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{selectedStory.timestamp}</p>
                </div>
                
                {selectedStory.userId === (currentUser?.profile?.user_id || currentUser?.id || 'me') && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-auto text-white/50 hover:text-rose-500 hover:bg-white/10 rounded-2xl"
                    onClick={(e) => { e.stopPropagation(); promptDeleteStory(selectedStory.id); }}
                  >
                    <Trash2 size={20} />
                  </Button>
                )}
              </div>

              {/* Close Button */}
              <Button 
                variant="ghost" size="icon" 
                className="absolute top-10 right-4 z-50 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all" 
                onClick={() => setSelectedStory(null)}
              >
                <X size={28} strokeWidth={2.5} />
              </Button>

              {/* Main Content Area */}
              <div className="flex-1 relative flex items-center justify-center bg-black w-full overflow-hidden">
                {/* Navigation Zones */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />

                {(selectedStory.type === 'image' || selectedStory.type === 'mixed') ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img src={selectedStory.content} className="w-full h-full object-contain" alt="story" />
                    {selectedStory.caption && (
                      <div className="absolute bottom-40 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20">
                        <p className="text-white text-xl font-black leading-tight drop-shadow-2xl uppercase tracking-tight">{selectedStory.caption}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center p-12 text-center", selectedStory.color || 'bg-[#155DFC]')}>
                    <p className={cn("text-white font-black leading-[1.1] tracking-tighter uppercase drop-shadow-2xl", selectedStory.fontSize || "text-4xl")}>
                      {selectedStory.content}
                    </p>
                  </div>
                )}
                
                {/* Swipe Guidance */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-32 left-0 right-0 flex flex-col items-center text-white/40 pointer-events-none z-40"
                >
                  <ChevronUp size={24} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] mt-2">Swipe to close</span>
                </motion.div>
              </div>

              {/* Footer Actions */}
              <div className="absolute bottom-10 left-8 right-8 z-50 flex gap-4">
                <Button 
                  className="flex-1 bg-white/10 hover:bg-[#155DFC] text-white border border-white/20 rounded-2xl h-16 gap-3 backdrop-blur-xl transition-all shadow-2xl font-black uppercase tracking-widest text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedStory.isAnnouncement) {
                        const announcementId = selectedStory.id.replace('announcement-', '');
                        window.location.href = `/feed/announcements/${announcementId}`;
                    } else {
                        const target = slugifyUsername(selectedStory.userSlug || selectedStory.userId);
                        window.location.href = `/dashboard/student/${target}`; 
                    }
                  }}
                >
                  {selectedStory.isAnnouncement ? <ExternalLink size={18} strokeWidth={3} /> : <User size={18} strokeWidth={3} />}
                  {selectedStory.isAnnouncement ? "Explore Update" : "View Profile"}
                </Button>

                <Button 
                  className="w-16 h-16 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl backdrop-blur-xl transition-all shadow-2xl"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!navigator.share) {
                        navigator.clipboard.writeText(window.location.href);
                        showAlert("Link Copied", "Sharing not supported. Link copied!");
                        return;
                    }
                    try {
                      await navigator.share({
                        title: `Zigex Story - ${selectedStory.userName}`,
                        text: selectedStory.caption || selectedStory.content,
                        url: window.location.href
                      });
                    } catch (err) { console.log(err); }
                  }}
                >
                  <Share2 size={20} strokeWidth={3} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE STORY MODAL */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none p-0 overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(21,93,252,0.3)]">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">New Activity</h2>
          </div>
          
          <div className="h-[450px] relative bg-slate-50 dark:bg-slate-900/50 flex flex-col">
             <div className={cn(
                "flex-1 flex items-center justify-center p-8 transition-all relative",
                !newStoryImage && createType === 'text' ? selectedColor : 'bg-transparent'
             )}>
                {createType === 'text' && !newStoryImage ? (
                  <textarea 
                    autoFocus
                    placeholder="What's on your mind?..."
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                    className={cn(
                      "w-full h-full bg-transparent border-none text-white font-black text-center placeholder:text-white/40 focus:ring-0 resize-none outline-none transition-all uppercase tracking-tight leading-tight",
                      selectedFontSize
                    )}
                    maxLength={150}
                  />
                ) : (
                  <div className="w-full h-full border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4 group/upload hover:border-[#155DFC] hover:text-[#155DFC] transition-all duration-500">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-blue-500/10 transition-all">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Drop Image or Click</p>
                    <Button variant="secondary" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => fileInputRef.current?.click()}>
                      Select Media
                    </Button>
                  </div>
                )}
                
                {newStoryImage && (
                  <div className="absolute inset-0 bg-slate-950">
                     <img src={newStoryImage} alt="preview" className="w-full h-full object-contain" />
                     <Button 
                        variant="destructive" size="icon" 
                        className="absolute top-4 right-4 rounded-2xl w-10 h-10 shadow-2xl"
                        onClick={() => { setNewStoryImage(null); setCreateType('text'); setSelectedFile(null); }}
                      >
                       <X size={18} strokeWidth={3} />
                     </Button>
                     <div className="absolute bottom-6 left-6 right-6">
                       <Input 
                         placeholder="Add a caption..." 
                         value={newStoryText} 
                         onChange={(e) => setNewStoryText(e.target.value)}
                         className="h-14 bg-black/60 border-white/10 text-white placeholder:text-white/50 backdrop-blur-xl rounded-2xl px-6 font-bold"
                       />
                     </div>
                  </div>
                )}
             </div>

             {/* Personalization Controls */}
             {createType === 'text' && !newStoryImage && (
               <div className="px-6 py-4 flex flex-col gap-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center gap-2">
                    {STORY_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-2xl border-4 transition-all duration-500",
                          color,
                          selectedColor === color ? "border-white dark:border-slate-800 scale-110 shadow-xl shadow-blue-500/20" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Style</span>
                     <div className="flex gap-1">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setSelectedFontSize(size.value)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              selectedFontSize === size.value 
                                ? "bg-white dark:bg-slate-800 text-[#155DFC] shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            )}
                          >
                            {size.label[0]}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
             )}

             <div className="p-6 bg-white dark:bg-slate-950 flex items-center gap-4">
                <div className="flex gap-2">
                  <Button 
                    variant={createType === 'text' && !newStoryImage ? "default" : "outline"}
                    className={cn(
                      "h-14 w-14 rounded-2xl transition-all duration-500",
                      createType === 'text' && !newStoryImage ? "bg-[#155DFC] text-white" : "text-slate-400"
                    )}
                    onClick={() => { setCreateType('text'); setNewStoryImage(null); setSelectedFile(null); }}
                  >
                    <Type size={20} strokeWidth={3} />
                  </Button>
                  <Button 
                    variant={createType === 'image' || newStoryImage ? "default" : "outline"} 
                    className={cn(
                      "h-14 w-14 rounded-2xl transition-all duration-500",
                      createType === 'image' || newStoryImage ? "bg-[#155DFC] text-white" : "text-slate-400"
                    )}
                    onClick={() => { setCreateType('image'); }}
                  >
                    <ImageIcon size={20} strokeWidth={3} />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCreatePost} 
                  disabled={(!newStoryText && !newStoryImage) || isPosting} 
                  className="flex-1 h-14 bg-[#155DFC] hover:bg-[#0D47A1] text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-500/25 transition-all active:scale-95"
                >
                  {isPosting ? 'Publishing...' : 'Share Activity'}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Modals */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-widest text-sm">{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-slate-500">{alertConfig.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)} className="bg-[#155DFC] rounded-2xl font-black uppercase tracking-widest text-[10px] px-8">Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-widest text-sm text-rose-500">Remove Activity?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-slate-500">
              This will permanently delete your story. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteStory} className="bg-rose-500 hover:bg-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
