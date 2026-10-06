'use client';

// SOLVED: Corrected a typo "afrom" to "from"
import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Briefcase, Calendar, Loader2, MapPin, ArrowRight, Clock, Lock, Flame, Star, Zap, Smile } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllFeedData, type Internship, type Event, type Program } from '@/lib/actions/feed/feed.action';
import { normalizeImageSrc } from '@/lib/utils';

// The Program type from the server now includes `isOpen`
type ProgramWithStatus = Program & { isOpen: boolean };

interface FeedItem {
  id: string;
  type: 'internship' | 'event' | 'program' | 'announcement';
  title: string;
  description: string;
  image?: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  date?: string;
  participants?: number;
  tags?: string[];
  category?: string;
  raw: Internship | Event | ProgramWithStatus | any;
  isOpen: boolean;
  closedReason?: string;
  isPinned?: boolean;
}

interface PersonalizedFeedProps {
  userId: string;
  userSkills?: string[];
  university?: string;
}

export default function PersonalizedFeed({ userId, userSkills = [], university }: PersonalizedFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [visibleItems, setVisibleItems] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    setIsLoading(true);
    try {
      const { internships, events, programs, announcements } = await getAllFeedData(undefined, userId);
      
      const transformedItems = transformAndCombineFeed(
        internships,
        events,
        programs as ProgramWithStatus[],
        announcements
      );
      setFeedItems(transformedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transformAndCombineFeed = (
    internships: Internship[],
    events: Event[],
    programs: ProgramWithStatus[],
    announcements: any[] = []
  ): FeedItem[] => {
    let allItems: FeedItem[] = [];

    // Transform Announcements
    for (const ann of announcements) {
      allItems.push({
        id: ann.id,
        type: 'announcement',
        title: ann.title,
        description: ann.content,
        image: ann.image_url,
        companyName: ann.company?.company_name || 'Zigex Admin',
        companyLogo: ann.company?.logo_url || ann.author?.avatar_url,
        tags: ['Announcement'],
        raw: ann,
        isOpen: true,
        isPinned: ann.is_pinned
      });
    }

    // Step 1: Transform all items into a unified FeedItem format
    for (const program of programs) {
      allItems.push({
        id: program.id,
        type: 'program',
        title: program.title,
        description: program.description || 'Transform your career with this program!',
        image: program.program_picture_url,
        companyName: program.company?.company_name || 'Program Provider',
        companyLogo: program.company?.logo_url,
        location: program.location,
        category: program.program_category,
        date: new Date(program.start_date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
        tags: [program.program_category].filter(Boolean),
        raw: program,
        isOpen: program.isOpen, // Correctly uses server-provided status
        closedReason: !program.isOpen ? "This program is now closed." : undefined,
        isPinned: program.title.toLowerCase().includes('weekend of code'),
      });
    }

    for (const internship of internships) {
      allItems.push({
        id: internship.id,
        type: 'internship',
        title: internship.title,
        description: internship.description || 'Exciting internship opportunity awaiting you!',
        image: internship.company_profiles?.cover_image_url,
        companyName: internship.company_profiles?.company_name || 'Company',
        companyLogo: internship.company_profiles?.logo_url,
        location: internship.location,
        category: internship.category,
        tags: [internship.type, internship.category].filter(Boolean),
        raw: internship,
        isOpen: true, 
      });
    }

    for (const event of events) {
      allItems.push({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description || 'Join us for an exciting event!',
        image: event.event_picture_url,
        companyName: event.company?.company_name || 'Event Organizer',
        companyLogo: event.company?.logo_url,
        location: event.location,
        date: new Date(event.start_date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
        raw: event,
        isOpen: true, 
      });
    }

    // Sort: Pinned items first, then by date (created_at)
    allItems.sort((a, b) => {
      // Pinned items take priority
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by date
      const dateA = new Date((a.raw as any).created_at).getTime();
      const dateB = new Date((b.raw as any).created_at).getTime();
      return dateB - dateA;
    });

    return allItems;
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleItems((prev) => Math.min(prev + 5, feedItems.length));
      setIsLoadingMore(false);
    }, 600);
  };

  const getTypeBadgeColor = (type: FeedItem['type'], isOpen: boolean) => {
    if (!isOpen) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    
    switch (type) {
      case 'internship': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'event': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'program': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    }
  };
  
  const getTypeLabel = (type: FeedItem['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    const plainText = stripHtml(text || '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Loader2 size={40} className="animate-spin text-blue-600" />
            <div className="absolute inset-0 animate-ping">
              <Sparkles size={40} className="text-blue-400 opacity-20" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Curating your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-xl border-b border-border sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Smile size={18} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Here We Go...</h2>
                <p className="text-xs text-muted-foreground font-medium">{feedItems.length} opportunities</p>
              </div>
            </div>
        </div>
      </div>

      {/* Feed Items */}
      <div className="divide-y divide-border">
        {feedItems.slice(0, visibleItems).map((item, index) => {
          const CardWrapper = item.isOpen ? Link : 'div';
          const wrapperProps = item.isOpen ? { href: `/feed/${item.id}` } : {};

          return (
            <CardWrapper
              key={item.id}
              {...wrapperProps}
              className={`block relative ${item.isOpen ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onMouseEnter={() => item.isOpen && setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`
                  bg-card transition-all duration-300 relative
                  ${item.isOpen ? 'hover:bg-muted/50' : 'bg-muted/20'}
                  ${item.isPinned ? 'border-l-4 border-primary' : ''}
                `}
                style={{
                  animation: `slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s both`,
                }}
              >
                <div className="flex gap-3 px-4 py-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-offset-2 dark:ring-offset-gray-900 transition-all duration-300 ${item.isOpen ? 'ring-blue-100 dark:ring-blue-900 hover:ring-blue-300 dark:hover:ring-blue-700 hover:scale-105' : 'ring-gray-200 dark:ring-gray-700'} ${item.isPinned ? 'ring-amber-300 dark:ring-amber-600 ring-offset-amber-50 dark:ring-offset-amber-900' : ''}`}>
                      <Image src={normalizeImageSrc(item.companyLogo, 'https://i.ibb.co/xqCftyWn/seedLogo.webp')} alt={item.companyName} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    
                    {item.isPinned && item.isOpen && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                        <Flame size={12} className="text-white" />
                      </div>
                    )}
                    {!item.isOpen && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                        <Lock size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`font-bold text-sm transition-colors ${item.isOpen ? 'text-gray-900 dark:text-white hover:text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>{item.companyName}</span>
                      
                      {item.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm flex items-center gap-1"><Star size={10} fill="currentColor" />PINNED</span>
                      )}
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor(item.type, item.isOpen)}`}>{getTypeLabel(item.type)}</span>
                      
                      {!item.isOpen && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50 flex items-center gap-1"><Lock size={10} />CLOSED</span>
                      )}
                      
                      {item.category && (<span className={`text-xs font-medium ${item.isOpen ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>• {item.category}</span>)}
                    </div>

                    <h3 className={`font-bold text-[15px] mb-2 leading-snug transition-all duration-300 ${item.isOpen ? 'text-foreground hover:text-primary' : 'text-muted-foreground'}`}>{item.title}</h3>
                    
                    {!item.isOpen && item.closedReason && (
                        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800/50">
                            <Lock size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-300 font-medium">{item.closedReason}</p>
                        </div>
                    )}

                    <p className={`text-sm mb-3 whitespace-pre-wrap leading-relaxed ${item.isOpen ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{truncateDescription(item.description)}</p>
                    
                    {item.image && (
                      <div className={`relative w-full rounded-2xl overflow-hidden mb-3 group ${item.isOpen ? 'border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl' : 'border border-gray-300 dark:border-gray-600 opacity-60'}`} style={{ aspectRatio: '16/9' }}>
                        <Image src={normalizeImageSrc(item.image)} alt={item.title} fill className={`object-cover transition-all duration-500 ${item.isOpen ? 'group-hover:scale-110' : 'grayscale'}`} />
                        {!item.isOpen && (
                          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                              <Lock size={16} className="text-gray-700 dark:text-gray-200" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Closed</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      {item.location && (<div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}><MapPin size={13} /><span>{item.location}</span></div>)}
                      {item.date && (<div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}><Calendar size={13} /><span>{item.date}</span></div>)}
                      <div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}><Clock size={13} /><span>{new Date((item.raw as any).created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={`text-sm font-medium transition-colors ${item.isOpen ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer' : 'text-gray-400 dark:text-gray-500'}`}>#{tag.replace(/\s+/g, '')}</span>
                        ))}
                      </div>
                    )}

                    {item.isOpen ? (
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${item.isPinned ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' : 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-[1.02]'}`} onClick={(e) => { e.preventDefault(); window.location.href = `/feed/${item.id}`; }}>
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                        <span className="relative flex items-center gap-2">{item.isPinned && <Zap size={16} fill="currentColor" />}<span>{item.type === 'event' ? 'Register Now' : 'Learn More'}</span><ArrowRight size={16} className={`transition-transform duration-300 ${hoveredCard === item.id ? 'translate-x-1' : ''}`} /></span>
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed"><Lock size={14} /><span>No Longer Available</span></div>
                    )}
                  </div>
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleItems < feedItems.length && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50">
            <button onClick={handleLoadMore} disabled={isLoadingMore} className="w-full py-5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
                {isLoadingMore ? (<><Loader2 size={18} className="animate-spin" /><span>Loading more...</span></>) : (<><span>Show more ({feedItems.length - visibleItems} remaining)</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>)}
            </button>
        </div>
      )}

      {/* End of feed */}
      {visibleItems >= feedItems.length && feedItems.length > 0 && (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 border-t border-gray-100 dark:border-gray-800">
            {/* <div className="relative inline-block"><Sparkles size={40} className="text-blue-500 mx-auto mb-3 animate-pulse" /><div className="absolute inset-0 blur-xl opacity-50"><Sparkles size={40} className="text-blue-400" /></div></div> */}
            <p className="text-gray-800 dark:text-white font-bold text-lg mb-1">You're all caught up!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check back soon for fresh opportunities</p>
        </div>
      )}

      {/* Empty state */}
      {feedItems.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white dark:bg-gray-900">
          <div className="relative inline-block mb-4"><Users size={56} className="text-gray-300 dark:text-gray-600" /><Sparkles size={24} className="text-blue-400 absolute -top-2 -right-2 animate-pulse" /></div>
          <p className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-2">No opportunities yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">We're working hard to bring you amazing opportunities. Check back soon!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}