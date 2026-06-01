"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Type, ChevronLeft, ChevronRight, Share2, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn, slugifyUsername } from '@/lib/utils';
import { Input } from '@/components/ui/input';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/app/types/supabase';
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // New Creation Customization States
  const [selectedColor, setSelectedColor] = useState(STORY_COLORS[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(FONT_SIZES[1].value); // Default Medium (text-2xl)

  useEffect(() => {
    fetchStories();
  }, [currentUser]);

  const fetchStories = async () => {
    try {
      setLoading(true);

      // 1. Fetch active user stories
      const storiesPromise = supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      // 2. Fetch recent announcements (last 5, acting as stories)
      const announcementsPromise = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const [storiesRes, announcementsRes] = await Promise.all([storiesPromise, announcementsPromise]);

      if (storiesRes.error) throw storiesRes.error;
      const storiesData = storiesRes.data || [];
      const announcementsData = announcementsRes.data || [];

      // 3. Prepare IDs for profile fetching
      const userIds = Array.from(new Set(storiesData.map(s => s.user_id)));
      const companyIds = Array.from(new Set(announcementsData.map(a => a.company_id).filter(Boolean))) as string[];

      // 4. Fetch Profiles
      const [profilesRes, companiesRes] = await Promise.all([
        userIds.length > 0 
          ? supabase.from('student_profiles').select('user_id, full_name, avatar_url, username').in('user_id', userIds) 
          : { data: [] },
        companyIds.length > 0 
          ? supabase.from('company_profiles').select('id, company_name, logo_url').in('id', companyIds) 
          : { data: [] }
      ]);

      const profilesMap: Record<string, any> = {};
      profilesRes.data?.forEach((p: any) => { profilesMap[p.user_id] = p; });

      const companiesMap: Record<string, any> = {};
      companiesRes.data?.forEach((c: any) => { companiesMap[c.id] = c; });

      // 5. Map User Stories
      const formattedUserStories: Story[] = storiesData.map((s: any) => {
        const isMe = s.user_id === currentUser?.profile?.user_id;
        const profile = profilesMap[s.user_id];
        
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
        const company = a.company_id ? companiesMap[a.company_id] : null;
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

      // 1. Upload Image if selected
      if (selectedFile && newStoryImage) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('stories')
          .upload(fileName, selectedFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('stories')
          .getPublicUrl(fileName);
          
        content = publicUrl;
      }

      // 2. Insert Story
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          content: content,
          type: finalType,
          caption: newStoryImage ? newStoryText : null, // Use newStoryText as caption if image exists
          color: !newStoryImage ? selectedColor : null,
          font_size: !newStoryImage ? selectedFontSize : null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          showAlert("Limit Reached", "You can only post one story per day.");
        } else {
          console.error("Supabase insert error:", error);
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
        const { error } = await supabase.from('stories').delete().eq('id', storyToDelete);
        if (error) throw error;
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
    <div className="relative w-full py-2 overflow-hidden group/tray">
      {/* Scroll Controls (Desktop) */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none hidden md:block" />
      <Button
        variant="outline" size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl opacity-0 group-hover/tray:opacity-100 transition-all duration-500 hidden md:flex border-slate-100 dark:border-slate-800 hover:scale-110 hover:bg-[#155DFC] hover:text-white group/btn"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-0.5" />
      </Button>

      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none hidden md:block" />
      <Button
        variant="outline" size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl opacity-0 group-hover/tray:opacity-100 transition-all duration-500 hidden md:flex border-slate-100 dark:border-slate-800 hover:scale-110 hover:bg-[#155DFC] hover:text-white group/btn"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5" />
      </Button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      <div 
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-6 px-4 sm:px-2 snap-x hide-scrollbar scroll-smooth"
      >
        {/* CREATE/YOUR STORY SLOT */}
        <motion.div 
          className="relative flex-none w-20 h-32 sm:w-[100px] sm:h-[160px] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 bg-card border border-slate-100 dark:border-slate-850"
          onClick={() => hasMyStory ? handleStoryClick(myStories[0]) : setIsCreating(true)}
          whileHover={{ y: -4 }}
        >
          {hasMyStory ? (
            <div className="absolute inset-0">
              {(myStories[0].type === 'image' || myStories[0].type === 'mixed') ? (
                <img src={myStories[0].content} alt="Your story" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center p-4 text-center", myStories[0].color || 'bg-[#155DFC]')}>
                  <p className="text-white text-[10px] font-black leading-tight line-clamp-4 uppercase tracking-wider">{myStories[0].content}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col">
              {/* Top part with image/avatar */}
              <div className="h-3/4 w-full bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="You" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 dark:to-slate-900/10" />
              </div>
              
              {/* Bottom white/dark section */}
              <div className="flex-1 bg-card flex flex-col items-center justify-center pb-3">
                <span className="text-[10px] font-black text-[#155DFC] dark:text-blue-400 uppercase tracking-[0.2em]">Create</span>
              </div>

              {/* Centered Plus Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-[#155DFC] rounded-full p-3 text-white shadow-[0_10px_30px_rgba(21,93,252,0.5)] ring-8 ring-white dark:ring-card transition-transform duration-500 group-hover:scale-110 group-hover:rotate-90">
                  <Plus className="w-6 h-6" strokeWidth={4} />
                </div>
              </div>
            </div>
          )}

          {hasMyStory && (
            <div className="absolute bottom-5 left-0 right-0 z-20 text-center">
              <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Your Story</p>
            </div>
          )}
        </motion.div>

        {/* OTHER STORIES */}
        {otherStories.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.05 }}
            className={cn(
              "relative flex-none w-20 h-32 sm:w-[100px] sm:h-[160px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-700 group",
              !story.viewed && (story as any).isAnnouncement 
                ? "ring-2 ring-[#155DFC] ring-offset-4 ring-offset-white dark:ring-offset-slate-950" 
                : !story.viewed 
                  ? "ring-2 ring-slate-200 dark:ring-slate-800 ring-offset-4 ring-offset-white dark:ring-offset-slate-950"
                  : "border border-slate-100 dark:border-slate-800"
            )}
            onClick={() => handleStoryClick(story)}
            whileHover={{ y: -6 }}
          >
            <div className="absolute inset-0 bg-slate-900">
               {(story.type === 'image' || story.type === 'mixed') && (
                 <img src={story.content} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               )}
               {story.type === 'text' && (
                 <div className={cn("w-full h-full flex items-center justify-center p-6 text-center", story.color || "bg-slate-800")}>
                    <p className={cn("text-white font-black leading-tight tracking-tight drop-shadow-2xl uppercase", story.fontSize || "text-xs")}>{story.content}</p>
                 </div>
               )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Profile Icon Top Left */}
            <div className="absolute top-4 left-4 z-20">
              <div className={cn(
                "rounded-full border-2 overflow-hidden w-8 h-8 shadow-2xl transition-all duration-500 group-hover:scale-110 flex items-center justify-center bg-blue-600 border-white/40",
                (story as any).isAnnouncement ? "bg-[#155DFC]" : "bg-slate-800"
              )}>
                {(story as any).isAnnouncement ? (
                  <span className="text-white font-black text-sm">Z</span>
                ) : (
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.userAvatar} className="object-cover" />
                    <AvatarFallback className="bg-slate-800 text-white font-black text-[10px]">{story.userName[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col items-center">
              <div className="space-y-1.5 w-full text-center">

                <p className="text-white text-[11px] font-black truncate uppercase tracking-[0.15em] drop-shadow-md group-hover:translate-y-[-2px] transition-transform">
                  {story.userName}
                </p>
              </div>
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
