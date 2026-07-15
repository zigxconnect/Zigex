// components/feed/FeedBlogCarousel.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, ArrowRight, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt: string;
  authorName: string;
  authorImage?: string;
  categories: string[];
}

interface FeedBlogCarouselProps {
  posts: BlogPost[];
}

function BlogImage({ post }: { post: BlogPost }) {
  const [error, setError] = useState(false);

  if (!post.imageUrl || error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
        <BookOpen size={32} className="text-slate-300 dark:text-slate-700" />
      </div>
    );
  }

  return (
    <Image
      src={post.imageUrl}
      alt={post.title}
      fill
      unoptimized={true}
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
}

function BlogAuthorImage({ post }: { post: BlogPost }) {
  const [error, setError] = useState(false);

  if (!post.authorImage || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
        {post.authorName ? post.authorName.charAt(0) : "U"}
      </div>
    );
  }

  return (
    <Image
      src={post.authorImage}
      alt={post.authorName}
      fill
      unoptimized={true}
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

export function FeedBlogCarousel({ posts }: FeedBlogCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!posts || posts.length === 0) return null;

  const totalSlides = Math.max(1, Math.ceil(posts.length / 3));

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.offsetWidth;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setActiveSlide((prev) => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setActiveSlide((prev) => Math.min(totalSlides - 1, prev + 1));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const estimateReadTime = (excerpt?: string) => {
    if (!excerpt) return "3 min read";
    const words = excerpt.split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 50)); // rough estimate
    return `${minutes} min read`;
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              From the Blog
            </h2>
          </div>
          <p className="text-[12px] text-slate-400 font-medium pl-9">
            Insights, guides, and stories from our community
          </p>
        </div>
        <Link
          href="/dashboard/blog"
          className="text-[#155DFC] text-[12px] font-semibold hover:underline underline-offset-4 shrink-0 ml-4 hidden sm:inline-flex items-center gap-1"
        >
          See all posts
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative group/blog-carousel">
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/blog-carousel:opacity-100 transition-all hover:scale-110 hidden lg:flex"
        >
          <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/blog-carousel:opacity-100 transition-all hover:scale-110 hidden lg:flex"
        >
          <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
        </button>

        {/* Cards Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth pb-2"
        >
          {posts.map((post, index) => (
            <Link
              key={post._id}
              href={`/dashboard/blog/${post.slug}`}
              className="flex-none w-[82%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start group"
            >
              <article className="flex flex-col h-full bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-40 sm:h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                  <BlogImage post={post} />

                  {/* Category Badge */}
                  {post.categories.length > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm text-slate-900 dark:text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                        {post.categories[0]}
                      </span>
                    </div>
                  )}

                  {/* Read Time Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold rounded-lg">
                      <Clock size={9} />
                      {estimateReadTime(post.excerpt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-[#155DFC] dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-slate-500 dark:text-slate-400 text-[12px] font-medium leading-relaxed line-clamp-2">
                        {post.excerpt.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>

                  {/* Footer: Author + Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <BlogAuthorImage post={post} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                        {post.authorName}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination Dots */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollTo({
                    left: scrollRef.current.offsetWidth * i,
                    behavior: "smooth",
                  });
                  setActiveSlide(i);
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  activeSlide === i
                    ? "w-5 h-1.5 bg-orange-500"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile: See all link */}
      <div className="sm:hidden text-center pt-1">
        <Link
          href="/dashboard/blog"
          className="text-[#155DFC] text-[12px] font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1"
        >
          See all posts
          <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
