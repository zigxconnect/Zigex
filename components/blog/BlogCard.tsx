"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight, Bell, Pin, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface UnifiedItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  date: string;
  authorName: string;
  authorImage?: string;
  categories: string[];
  type: 'post' | 'announcement';
  isPinned?: boolean;
  rawItem: any;
}

interface BlogCardProps {
  item: UnifiedItem;
  isFeatured?: boolean;
}

export default function BlogCard({ item, isFeatured = false }: BlogCardProps) {
  const isAnnouncement = item.type === 'announcement';
  const detailLink = isAnnouncement 
    ? `/feed/announcements/${item.slug}` 
    : `/dashboard/blog/${item.slug}`;

  // Featured Hero Layout
  if (isFeatured) {
    return (
      <div className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all duration-500 hover:shadow-2xl">
        <Link href={detailLink} className="block w-full h-full">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 w-full h-full">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover opacity-45 group-hover:scale-105 transition-transform duration-1000"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          </div>

          {/* Card Content Overlay */}
          <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col justify-end min-h-[380px] md:min-h-[460px] h-full space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-lg uppercase tracking-widest border border-amber-500/30">
                  <Pin size={10} className="fill-current" />
                  Pinned
                </span>
              )}
              {isAnnouncement ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#155DFC]/20 text-[#4285f4] text-[10px] font-black rounded-lg uppercase tracking-widest border border-[#155DFC]/30">
                  <Bell size={10} />
                  Official Announcement
                </span>
              ) : (
                item.categories.map((cat, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-600/30 text-blue-200 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-500/30">
                    {cat}
                  </span>
                ))
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter group-hover:text-blue-300 transition-colors duration-300">
              {item.title}
            </h2>

            {item.excerpt && (
              <div className="text-slate-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-3">
                {isAnnouncement ? (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 [&_p]:text-slate-300 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-slate-200 [&_em]:text-slate-300 [&_a]:text-blue-300 [&_code]:bg-slate-900/50 [&_code]:text-slate-200 [&_ul]:text-slate-300 [&_ol]:text-slate-300 [&_li]:text-slate-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.excerpt}
                    </ReactMarkdown>
                  </div>
                ) : (
                  item.excerpt.replace(/<[^>]*>/g, '')
                )}
              </div>
            )}

            <div className="flex items-center flex-wrap gap-4 pt-4 border-t border-white/10 text-slate-300 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-white/20">
                  {item.authorImage ? (
                    <Image
                      src={item.authorImage}
                      alt={item.authorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-900/40 text-blue-200 text-xs font-bold">
                      {item.authorName.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="font-bold text-white">{item.authorName}</span>
              </div>

              <span className="text-slate-500 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <Calendar size={12} />
                <time dateTime={item.date}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Regular Grid Card Layout
  return (
    <article className="group flex flex-col h-full bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <Link href={detailLink} className="flex flex-col h-full">
        {/* Card Header image or placeholder */}
        {(!isAnnouncement || item.imageUrl) && (
          <div className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
            )}
            
            {/* Top categories overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {isAnnouncement ? (
                <span className="px-3 py-1.5 bg-[#155DFC] text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                  Announcement
                </span>
              ) : (
                item.categories.slice(0, 1).map((cat, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                    {cat}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="flex-1 p-6 md:p-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Meta row */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {item.isPinned && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Pin size={10} className="fill-current" />
                  Pinned
                </span>
              )}
              {item.isPinned && <span>•</span>}
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {isAnnouncement ? 'Update' : 'Read'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
              {item.title}
            </h3>

            {/* Excerpt */}
            {item.excerpt && (
              isAnnouncement ? (
                <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-400 [&_p]:text-slate-600 dark:[&_p]:text-slate-400 [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300 [&_em]:text-slate-600 dark:[&_em]:text-slate-400 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_code]:bg-slate-100 dark:[&_code]:bg-slate-900/50 [&_code]:text-slate-700 dark:[&_code]:text-slate-200 [&_ul]:text-slate-600 dark:[&_ul]:text-slate-400 [&_ol]:text-slate-600 dark:[&_ol]:text-slate-400 [&_li]:text-slate-600 dark:[&_li]:text-slate-400 line-clamp-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.excerpt}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3">
                  {item.excerpt.replace(/<[^>]*>/g, '')}
                </p>
              )
            )}

            {/* Spotlight tagged student indicator */}
            {isAnnouncement && item.rawItem.tagged_student && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold border border-amber-100 dark:border-amber-950/30">
                <Award size={10} />
                Spotlight: {item.rawItem.tagged_student.full_name}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                {item.authorImage ? (
                  <Image
                    src={item.authorImage}
                    alt={item.authorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    {item.authorName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                {item.authorName}
              </span>
            </div>

            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}