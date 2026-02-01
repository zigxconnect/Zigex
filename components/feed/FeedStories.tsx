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
          content: a.image_url || a.content,
          caption: a.image_url ? a.content : undefined,
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
    console.log("HandleCreatePost - CurrentUser:", currentUser);

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
    <div className="relative w-full max-w-full py-4 overflow-hidden group/tray">
      {/* Scroll Controls (Desktop) */}
      <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block" />
      <Button
        variant="outline" size="icon"
        className="absolute left-4 top-[45%] -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md shadow-xl rounded-full opacity-0 group-hover/tray:opacity-100 transition-all duration-300 hidden md:flex border-border/50 hover:bg-background hover:scale-110"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-5 h-5 text-foreground/80" />
      </Button>

      <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden md:block" />
      <Button
        variant="outline" size="icon"
        className="absolute right-4 top-[45%] -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md shadow-xl rounded-full opacity-0 group-hover/tray:opacity-100 transition-all duration-300 hidden md:flex border-border/50 hover:bg-background hover:scale-110"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-5 h-5 text-foreground/80" />
      </Button>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 snap-x hide-scrollbar scroll-smooth"
      >
        {/* ... existing items ... */}
        
        {/* YOUR STORY SLOT */}
        {hasMyStory ? (
           /* ... existing my story card ... */
           <motion.div 
             className="relative flex-none w-[140px] h-[220px] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow border border-border"
             onClick={() => handleStoryClick(myStories[0])}
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
           >
             {/* ... content ... */}
             <div className="absolute inset-0 z-0">
               {(myStories[0].type === 'image' || myStories[0].type === 'mixed') ? (
                 <img src={myStories[0].content} alt="Your story" className="w-full h-full object-cover" />
               ) : (
                 <div className={cn("w-full h-full flex items-center justify-center p-2 text-center", myStories[0].color || 'bg-blue-600')}>
                    <p className="text-white text-[10px] leading-tight line-clamp-4">{myStories[0].content}</p>
                 </div>
               )}
             </div>
             
             {/* ... overlays ... */}
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

             <div 
               className="absolute bottom-2 right-2 p-1 bg-card rounded-full z-20 shadow-md transform translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
               onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
             >
                <div className="bg-primary rounded-full p-1 text-white">
                  <Plus size={12} strokeWidth={3} />
                </div>
             </div>

             <div className="absolute top-2 left-2 z-20 rounded-full border-2 border-primary overflow-hidden w-8 h-8">
               <Avatar className="w-full h-full">
                 <AvatarImage src={currentUser?.image || currentUser?.userAvatar} />
                 <AvatarFallback>Me</AvatarFallback>
               </Avatar>
             </div>
             
             <div className="absolute bottom-3 left-2 z-20">
               <p className="text-white text-xs font-bold shadow-black drop-shadow-md">Your Story</p>
             </div>
           </motion.div>
        ) : (
          /* ... existing create story card ... */
          <motion.div 
            className="relative flex-none w-[140px] h-[220px] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow bg-card border border-border"
            onClick={() => setIsCreating(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* ... card content ... */}
            <div className="h-2/3 w-full bg-muted/50 relative">
               {currentUser?.image ? (
                 <img src={currentUser.image} alt="You" className="w-full h-full object-cover opacity-80" />
               ) : (
                 <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                   <ImageIcon className="w-8 h-8 text-slate-400" />
                 </div>
               )}
            </div>
            <div className="absolute bottom-0 w-full h-1/3 bg-card flex flex-col items-center justify-end pb-3 z-10">
              <span className="text-xs font-bold text-foreground/90">Create Story</span>
            </div>
            <div className="absolute top-[66.6%] left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-card rounded-full z-20 shadow-md">
              <div className="bg-primary rounded-full p-2 text-white shadow-lg ring-4 ring-card">
                <Plus size={20} strokeWidth={3} />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
          </motion.div>
        )}

        {/* ... other stories ... */}
        {otherStories.map((story) => (
          <motion.div
            key={story.id}
            /* ... existing classes ... */
            className={cn(
              "relative flex-none w-[140px] h-[220px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 group",
              story.viewed 
                ? "ring-1 ring-border" 
                : (story as any).isAnnouncement 
                  ? "ring-2 ring-offset-2 ring-offset-background ring-transparent bg-gradient-to-tr from-blue-700 to-sky-400 p-[2px]" // Blue for Official
                  : "ring-2 ring-offset-2 ring-offset-background ring-transparent bg-gradient-to-tr from-orange-500 to-pink-500 p-[2px]" // Gradient for Users
            )}
            onClick={() => handleStoryClick(story)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* ... story card content ... */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-card h-full w-full">
                <div className={cn("absolute inset-0 z-0 h-full w-full", story.color || "bg-slate-900")}>
                   {(story.type === 'image' || story.type === 'mixed') && (
                     <img src={story.content} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   )}
                   {story.type === 'text' && (
                     <div className="w-full h-full flex items-center justify-center p-4 text-center">
                        <p className={cn("text-white font-semibold leading-snug line-clamp-6 drop-shadow-md", story.fontSize || "text-sm")}>{story.content}</p>
                     </div>
                   )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className={cn(
                   "absolute top-3 left-3 z-20 rounded-full border-2 bg-background/10 backdrop-blur-sm overflow-hidden w-10 h-10 shadow-lg group-hover:scale-110 transition-transform",
                   (story as any).isAnnouncement ? "border-blue-500" : "border-primary/20"
                )}>
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.userAvatar} />
                    <AvatarFallback>{story.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <p className="text-white text-sm font-bold truncate drop-shadow-lg group-hover:translate-x-1 transition-transform">
                      {story.userName}
                      {(story as any).isAnnouncement && (
                         <span className="block text-[10px] text-blue-300 font-medium uppercase tracking-wider mt-0.5">Official Update</span>
                      )}
                  </p>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ... existing modal ... */}
      <AnimatePresence>
         {/* ... modal content ... */}
         {selectedStory && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black backdrop-blur-md p-0 sm:p-4"
           >
              {/* ... viewer ... */}
              <motion.div 
                className="relative w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col touch-none"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 50;
                  if (offset.y < -swipeThreshold) {
                    // Swipe UP -> Next Story
                    handleNextStory();
                  } else if (offset.y > swipeThreshold) {
                    // Swipe DOWN -> Close or Prev? Let's Close
                    setSelectedStory(null);
                  }
                }}
              >
                 {/* ... viewer content ... */}
                 
                 {/* Progress Bar */}
                 <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                   {stories.map((s, idx) => (
                      <div key={s.id} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                        <div 
                          className={cn("h-full bg-white transition-all duration-300", 
                            s.id === selectedStory.id ? "w-full opacity-100" : 
                            stories.indexOf(s) < stories.indexOf(selectedStory) ? "w-full opacity-100" : "w-0"
                          )}
                        />
                      </div>
                   ))}
                 </div>

                 {/* Header */}
                 <div className="absolute top-6 left-4 right-12 z-50 flex items-center gap-3">
                    {/* ... */}
                   <Avatar className="w-10 h-10 border-2 border-white/20">
                      <AvatarImage src={selectedStory.userAvatar} />
                      <AvatarFallback>{selectedStory.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-white drop-shadow-md">
                      <p className="font-semibold text-sm">{selectedStory.userName}</p>
                      <p className="text-xs opacity-80">{selectedStory.timestamp}</p>
                    </div>
                    
                    {/* Delete Button */}
                    {selectedStory.userId === (currentUser?.profile?.user_id || currentUser?.id || 'me') && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="ml-auto text-white/70 hover:text-red-500 hover:bg-white/10 rounded-full"
                         onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteStory(selectedStory.id);
                         }}
                       >
                         <Trash2 size={20} />
                       </Button>
                    )}
                 </div>

                 {/* Close Button */}
                 <Button variant="ghost" size="icon" className="absolute top-4 right-2 z-50 text-white hover:bg-white/20 rounded-full" onClick={() => setSelectedStory(null)}>
                   <X size={24} />
                 </Button>

                 {/* ... content viewer ... */}
                 <div className="flex-1 relative flex items-center justify-center bg-neutral-900 w-full overflow-hidden">
                    {/* Tap Zones for Navigation */}
                    <div className="absolute inset-y-0 left-0 w-1/3 z-30 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
                    <div className="absolute inset-y-0 right-0 w-1/3 z-30 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />

                    {(selectedStory.type === 'image' || selectedStory.type === 'mixed') ? (
                      <div className="relative w-full h-full flex flex-col">
                        <img src={selectedStory.content} className="w-full h-full object-contain bg-black" alt="story" />
                        {selectedStory.caption && (
                           <div className="absolute bottom-36 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                              <p className="text-white text-lg font-medium drop-shadow-md leading-relaxed">{selectedStory.caption}</p>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className={cn("w-full h-full flex items-center justify-center p-8 text-center", selectedStory.color || 'bg-blue-600')}>
                        <p className={cn("text-white font-bold leading-relaxed max-w-lg", selectedStory.fontSize || "text-2xl")}>{selectedStory.content}</p>
                      </div>
                    )}
                    
                    {/* Swipe Up Indicator */}
                    <motion.div 
                      initial={{ opacity: 0.5, y: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5], y: [-5, 0, -5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-28 left-0 right-0 flex flex-col items-center justify-center text-white/60 pointer-events-none z-40"
                    >
                      <ChevronUp size={24} />
                      <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Swipe Up for Next</span>
                    </motion.div>
                 </div>

                 {/* ... rest of viewer (messages etc) ... */}
                 <div className="absolute bottom-20 sm:bottom-10 left-6 right-6 z-50 flex gap-4 justify-between items-center">
                    {/* Profile / Details Button */}
                    <Button 
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full h-12 gap-2 backdrop-blur-md transition-all shadow-lg text-sm sm:text-base font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate using username if available, else fallback to userId
                        if (selectedStory.isAnnouncement) {
                            // Extract ID from "announcement-{id}"
                            const announcementId = selectedStory.id.replace('announcement-', '');
                            window.location.href = `/feed/announcements/${announcementId}`;
                        } else {
                            const target = slugifyUsername(selectedStory.userSlug || selectedStory.userId);
                            window.location.href = `/dashboard/student/${target}`; 
                        }
                      }}
                    >
                      {/* Change Icon based on type */}
                      {selectedStory.isAnnouncement ? <ExternalLink size={18} /> : <User size={18} />}
                      
                      {/* Change Text based on type */}
                      {selectedStory.isAnnouncement ? "View Details" : "View Profile"}
                    </Button>

                    <Button 
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full h-12 gap-2 backdrop-blur-md transition-all shadow-lg text-sm sm:text-base font-medium"
                      disabled={isPosting}
                      onClick={async (e) => {
                         e.stopPropagation();
                         if (!navigator.share) {
                            navigator.clipboard.writeText(window.location.href);
                            showAlert("Link Copied", "Sharing not supported on this browser. Link copied to clipboard!");
                            return;
                         }

                         try {
                           const shareData: any = {
                             title: `Zigex Story - ${selectedStory.userName}`,
                             text: selectedStory.type === 'text' ? selectedStory.content : (selectedStory.caption || 'Check out my story on Zigex!'),
                           };

                           // Handle Image Sharing
                           if (selectedStory.type === 'image') {
                              try {
                                const response = await fetch(selectedStory.content);
                                const blob = await response.blob();
                                const file = new File([blob], 'story.jpg', { type: blob.type });
                                
                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                  shareData.files = [file];
                                  // For file sharing, text is often treated as the caption
                                }
                              } catch (fileErr) {
                                console.error("Could not prepare image file for sharing:", fileErr);
                              }
                           } else {
                             // For text stories, we also include the URL so people can visit the app
                             shareData.url = window.location.href;
                           }

                           await navigator.share(shareData);
                         } catch (err) {
                           console.log("Share cancelled or failed:", err);
                         }
                      }}
                    >
                      <Share2 size={18} />
                      Share
                    </Button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* CREATE STORY MODAL */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden gap-0">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 className="text-lg font-semibold">Create Story</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}><X size={20}/></Button>
          </div>
          
          <div className="h-[400px] relative bg-muted/20 flex flex-col">
             <div className={cn(
                "flex-1 flex items-center justify-center p-6 transition-all relative",
                !newStoryImage && createType === 'text' ? selectedColor : 'bg-transparent'
             )}>
                {createType === 'text' && !newStoryImage ? (
                  <textarea 
                    autoFocus
                    placeholder="Type something..."
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                    className={cn(
                      "w-full h-full bg-transparent border-none text-white font-bold text-center placeholder:text-white/50 focus:ring-0 resize-none outline-none transition-all",
                      selectedFontSize
                    )}
                    maxLength={150}
                  />
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <p className="text-sm">Upload Photo</p>
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Select Image
                    </Button>
                  </div>
                )}
                
                {newStoryImage && (
                  <div className="absolute inset-0 bg-black">
                     <img src={newStoryImage} alt="preview" className="w-full h-full object-contain" />
                     <Button 
                        variant="destructive" size="icon" 
                        className="absolute top-2 right-2 rounded-full w-8 h-8"
                        onClick={() => { setNewStoryImage(null); setCreateType('text'); setSelectedFile(null); }}
                      >
                       <X size={14} />
                     </Button>
                     <div className="absolute bottom-4 left-4 right-4">
                       <Input 
                         placeholder="Add caption..." 
                         value={newStoryText} 
                         onChange={(e) => setNewStoryText(e.target.value)}
                         className="bg-black/50 border-white/20 text-white placeholder:text-white/70 backdrop-blur-sm"
                       />
                     </div>
                  </div>
                )}
             </div>

             {/* Customization Controls (Colors & Font Size) */}
             {createType === 'text' && !newStoryImage && (
               <div className="absolute bottom-20 left-0 right-0 p-4 flex flex-col gap-4 bg-black/20 backdrop-blur-sm">
                  {/* Colors */}
                  <div className="flex justify-center gap-3">
                    {STORY_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          color,
                          selectedColor === color ? "border-white scale-125 shadow-lg" : "border-transparent hover:scale-110"
                        )}
                      />
                    ))}
                  </div>
                  
                  {/* Font Size Selector */}
                  <div className="flex justify-center items-center gap-4">
                     <span className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Font Size</span>
                     <div className="flex bg-white/10 rounded-full p-1 border border-white/20">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setSelectedFontSize(size.value)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs transition-all",
                              selectedFontSize === size.value 
                                ? "bg-white text-black font-bold" 
                                : "text-white hover:bg-white/10"
                            )}
                          >
                            {size.label[0]}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
             )}

             <div className="p-4 bg-card border-t border-border flex items-center gap-2 justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant={createType === 'text' && !newStoryImage ? "primary" : "outline"}
                    className="h-10 w-10 p-0 rounded-full"
                    onClick={() => { setCreateType('text'); setNewStoryImage(null); setSelectedFile(null); }}
                  >
                    <Type size={18} />
                  </Button>
                  <Button 
                    variant={createType === 'image' || newStoryImage ? "primary" : "outline"} 
                    className="h-10 w-10 p-0 rounded-full"
                    onClick={() => { setCreateType('image'); }}
                  >
                    <ImageIcon size={18} />
                  </Button>
                </div>
                
                <Button onClick={handleCreatePost} disabled={(!newStoryText && !newStoryImage) || isPosting} className="rounded-full px-6">
                  {isPosting ? 'Sharing...' : 'Share to Story'}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove your story from the feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteStory} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
