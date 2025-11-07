'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Briefcase, Calendar, Loader2, MapPin, ArrowRight, Clock, Lock, Flame, Star, Zap, Smile } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllFeedData, type Internship, type Event, type Program } from '@/lib/actions/feed/feed.action';
import { isOpportunityOpen } from '@/lib/actions/feed/feed-detail.actions';

interface FeedItem {
  id: string;
  type: 'internship' | 'event' | 'program';
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
  raw: Internship | Event | Program;
  isOpen?: boolean;
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
      const data = await getAllFeedData();
      const transformedItems = await transformAndPersonalizeFeed(
        data.internships,
        data.events,
        data.programs
      );
      setFeedItems(transformedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transformAndPersonalizeFeed = async (
    internships: Internship[],
    events: Event[],
    programs: Program[]
  ): Promise<FeedItem[]> => {
    const items: FeedItem[] = [];

    // Transform internships
    for (const internship of internships) {
      const openStatus = await isOpportunityOpen(internship, 'internships');
      items.push({
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
        isOpen: openStatus.isOpen,
        closedReason: openStatus.reason,
      });
    }

    // Transform events
    for (const event of events) {
      const openStatus = await isOpportunityOpen(event, 'events');
      items.push({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description || 'Join us for an exciting event!',
        image: event.event_picture_url,
        companyName: event.company?.company_name || 'Event Organizer',
        companyLogo: event.company?.logo_url,
        location: event.location,
        date: new Date(event.start_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        raw: event,
        isOpen: openStatus.isOpen,
        closedReason: openStatus.reason,
      });
    }

    // Transform programs
    for (const program of programs) {
      const openStatus = await isOpportunityOpen(program, 'programs');
      const isWeekendOfCode = program.title.toLowerCase().includes('weekend of code');
      
      items.push({
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
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        tags: [program.program_category].filter(Boolean),
        raw: program,
        isOpen: openStatus.isOpen,
        closedReason: openStatus.reason,
        isPinned: isWeekendOfCode,
      });
    }

    // Personalization algorithm
    return personalizeAndSortFeed(items);
  };

  const personalizeAndSortFeed = (items: FeedItem[]): FeedItem[] => {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Separate pinned items (Weekend of Code)
    const pinnedItems = items.filter(item => item.isPinned);
    const regularItems = items.filter(item => !item.isPinned);

    // Score regular items
    const scoredItems = regularItems.map((item) => {
      let score = 0;

      // Recency bonus (newer items get higher scores)
      const itemDate = new Date((item.raw as any).created_at);
      const daysSinceCreated = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      score += Math.max(0, 100 - daysSinceCreated);

      // Open items get priority
      if (item.isOpen) {
        score += 150;
      }

      // Weekend bonus for events
      if (isWeekend && item.type === 'event') {
        score += 50;
      }

      // User skills match bonus
      if (item.tags) {
        const matchingTags = item.tags.filter((tag) =>
          userSkills.some((skill) => skill.toLowerCase().includes(tag.toLowerCase()))
        );
        score += matchingTags.length * 30;
      }

      // University match bonus
      if (university && item.location?.toLowerCase().includes(university.toLowerCase())) {
        score += 40;
      }

      // Type variety bonus
      score += Math.random() * 20;

      return { ...item, score };
    });

    // Sort regular items by score
    const sortedRegular = scoredItems
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...item }) => item);

    // Return pinned items first, then sorted regular items
    return [...pinnedItems, ...sortedRegular];
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleItems((prev) => Math.min(prev + 5, feedItems.length));
      setIsLoadingMore(false);
    }, 600);
  };

  const getIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'internship':
        return <Briefcase size={18} className="text-blue-500" />;
      case 'event':
        return <Calendar size={18} className="text-purple-500" />;
      case 'program':
        return <TrendingUp size={18} className="text-emerald-500" />;
    }
  };

  const getTypeLabel = (type: FeedItem['type']) => {
    switch (type) {
      case 'internship':
        return 'Internship';
      case 'event':
        return 'Event';
      case 'program':
        return 'Program';
    }
  };

  const getTypeBadgeColor = (type: FeedItem['type'], isOpen: boolean) => {
    if (!isOpen) return 'bg-gray-100 text-gray-500';
    
    switch (type) {
      case 'internship':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'event':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'program':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto border-x border-gray-200 bg-white min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Loader2 size={40} className="animate-spin text-blue-600" />
            <div className="absolute inset-0 animate-ping">
              <Sparkles size={40} className="text-blue-400 opacity-20" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Curating your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border-x border-gray-200 bg-white">
      {/* Header - Premium Twitter Style */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Smile size={18} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Here We Go...</h2>
              <p className="text-xs text-gray-500 font-medium">{feedItems.length} opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Items - Premium Design */}
      <div className="divide-y divide-gray-100">
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
              {/* Pinned Indicator */}
              {item.isPinned && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 z-10"></div>
              )}

              <div
                className={`
                  bg-white transition-all duration-300 relative
                  ${item.isOpen ? 'hover:bg-gray-50' : 'bg-gray-50/50'}
                  ${item.isPinned ? 'border-l-4 border-amber-500' : ''}
                `}
                style={{
                  animation: `slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s both`,
                }}
              >
                <div className="flex gap-3 px-4 py-4">
                  {/* Company Avatar - Enhanced */}
                  <div className="flex-shrink-0 relative">
                    <div className={`
                      w-12 h-12 rounded-full overflow-hidden shadow-md
                      ring-2 ring-offset-2 transition-all duration-300
                      ${item.isOpen ? 'ring-blue-100 hover:ring-blue-300 hover:scale-105' : 'ring-gray-200'}
                      ${item.isPinned ? 'ring-amber-300 ring-offset-amber-50' : ''}
                    `}>
                      
                        <Image
                          src={item.companyLogo || '/seedLogo.png'}
                          alt={item.companyName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                     
                    </div>
                    
                    {/* Status indicator */}
                    {item.isPinned && item.isOpen && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Flame size={12} className="text-white" />
                      </div>
                    )}
                    
                    {!item.isOpen && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Lock size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with enhanced badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`font-bold text-sm transition-colors ${item.isOpen ? 'text-gray-900 hover:text-blue-600' : 'text-gray-500'}`}>
                        {item.companyName}
                      </span>
                      
                      {item.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm flex items-center gap-1">
                          <Star size={10} fill="currentColor" />
                          pinned
                        </span>
                      )}
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor(item.type, item.isOpen || false)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                      
                      {!item.isOpen && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                          <Lock size={10} />
                          CLOSED
                        </span>
                      )}
                      
                      {item.category && (
                        <span className={`text-xs font-medium ${item.isOpen ? 'text-gray-500' : 'text-gray-400'}`}>
                          • {item.category}
                        </span>
                      )}
                    </div>

                    {/* Title with gradient on hover for open items */}
                    <h3 className={`
                      font-bold text-[15px] mb-2 leading-snug transition-all duration-300
                      ${item.isOpen 
                        ? 'text-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent' 
                        : 'text-gray-500'
                      }
                    `}>
                      {item.title}
                    </h3>

                    {/* Closed reason banner */}
                    {!item.isOpen && item.closedReason && (
                      <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <Lock size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700 font-medium">{item.closedReason}</p>
                      </div>
                    )}

                    {/* Description */}
                    <p className={`text-sm mb-3 whitespace-pre-wrap leading-relaxed ${item.isOpen ? 'text-gray-700' : 'text-gray-500'}`}>
                      {truncateDescription(item.description)}
                    </p>

                    {/* Image with enhanced effects */}
                    {item.image && (
                      <div
                        className={`
                          relative w-full rounded-2xl overflow-hidden mb-3 group
                          ${item.isOpen 
                            ? 'border-2 border-gray-200 shadow-md hover:shadow-xl' 
                            : 'border border-gray-300 opacity-60'
                          }
                        `}
                        style={{ aspectRatio: '16/9' }}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className={`
                            object-cover transition-all duration-500
                            ${item.isOpen ? 'group-hover:scale-110' : 'grayscale'}
                          `}
                        />
                        {!item.isOpen && (
                          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                              <Lock size={16} className="text-gray-700" />
                              <span className="text-sm font-bold text-gray-700">Closed</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata with icons */}
                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      {item.location && (
                        <div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600' : 'text-gray-400'}`}>
                          <MapPin size={13} />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.date && (
                        <div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600' : 'text-gray-400'}`}>
                          <Calendar size={13} />
                          <span>{item.date}</span>
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 font-medium ${item.isOpen ? 'text-gray-600' : 'text-gray-400'}`}>
                        <Clock size={13} />
                        <span>
                          {new Date((item.raw as any).created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className={`text-sm font-medium transition-colors ${
                              item.isOpen 
                                ? 'text-blue-600 hover:text-blue-700 hover:underline cursor-pointer' 
                                : 'text-gray-400'
                            }`}
                          >
                            #{tag.replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button - Premium Design */}
                    {item.isOpen ? (
                      <button
                        className={`
                          w-full py-3 rounded-xl font-bold text-sm
                          transition-all duration-300 
                          flex items-center justify-center gap-2 group
                          relative overflow-hidden
                          ${item.isPinned 
                            ? 'bg-gradient-to-r from-orange-500 via-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
                          }
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/feed/${item.id}`;
                        }}
                      >
                        {/* Shimmer effect */}
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                        
                        <span className="relative flex items-center gap-2">
                          {item.isPinned && <Zap size={16} fill="currentColor" />}
                          <span>{item.type === 'event' ? 'Register Now' : 'Learn More'}</span>
                          <ArrowRight
                            size={16}
                            className={`transition-transform duration-300 ${
                              hoveredCard === item.id ? 'translate-x-1' : ''
                            }`}
                          />
                        </span>
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-xl font-bold text-sm bg-gray-200 text-gray-500 flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={14} />
                        <span>No Longer Available</span>
                      </div>
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
        <div className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full py-5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Loading more opportunities...</span>
              </>
            ) : (
              <>
                <span>Show more ({feedItems.length - visibleItems} remaining)</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      )}

      {/* End of feed */}
      {visibleItems >= feedItems.length && feedItems.length > 0 && (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
          <div className="relative inline-block">
            <Sparkles size={40} className="text-blue-500 mx-auto mb-3 animate-pulse" />
            <div className="absolute inset-0 blur-xl opacity-50">
              <Sparkles size={40} className="text-blue-400" />
            </div>
          </div>
          <p className="text-gray-800 font-bold text-lg mb-1">You're all caught up!</p>
          <p className="text-sm text-gray-500">Check back soon for fresh opportunities</p>
        </div>
      )}

      {/* Empty state */}
      {feedItems.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white">
          <div className="relative inline-block mb-4">
            <Users size={56} className="text-gray-300" />
            <Sparkles size={24} className="text-blue-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-gray-700 font-bold text-lg mb-2">No opportunities yet</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We're working hard to bring you amazing opportunities. Check back soon!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}