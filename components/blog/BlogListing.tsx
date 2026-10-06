"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BlogCard from "./BlogCard";
import { Search, Bell, Pin, Award, Building2, Sparkles, Compass, BookOpen, TrendingUp, X, Filter } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

interface Category {
  title: string;
  slug: { current: string };
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: any;
  publishedAt?: string;
  author?: {
    name: string;
    image?: any;
  };
  categories?: Category[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  is_pinned?: boolean;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  company?: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  tagged_student?: {
    full_name: string;
  };
}

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

interface BlogListingProps {
  initialPosts: Post[];
  initialAnnouncements?: Announcement[];
  categories: Category[];
  isAdmin: boolean;
}

export default function BlogListing({
  initialPosts,
  initialAnnouncements = [],
  categories,
  isAdmin,
}: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Map and unify both sources of data
  const unifiedItems = useMemo(() => {
    const postsMapped: UnifiedItem[] = (initialPosts || []).map((post) => ({
      id: post._id,
      title: post.title,
      slug: post.slug?.current || '',
      excerpt: post.excerpt || '',
      imageUrl: post.mainImage ? urlFor(post.mainImage).width(600).height(400).url() : undefined,
      date: post.publishedAt || new Date().toISOString(),
      authorName: post.author?.name || 'Zigex Team',
      authorImage: post.author?.image ? urlFor(post.author.image).width(40).height(40).url() : undefined,
      categories: post.categories?.map((c) => c.title) || [],
      type: 'post',
      isPinned: false,
      rawItem: post,
    }));

    const announcementsMapped: UnifiedItem[] = (initialAnnouncements || []).map((ann) => {
      const isCompany = !!ann.company;
      return {
        id: ann.id,
        title: ann.title,
        slug: ann.id,
        excerpt: ann.content || '',
        imageUrl: ann.image_url || undefined,
        date: ann.created_at || new Date().toISOString(),
        authorName: isCompany ? ann.company!.company_name : (ann.author?.full_name || 'Zigex Admin'),
        authorImage: isCompany ? ann.company!.logo_url : (ann.author?.avatar_url || undefined),
        categories: ['Company Updates'],
        type: 'announcement',
        isPinned: ann.is_pinned || false,
        rawItem: ann,
      };
    });

    // Combine and sort: Pinned first, then newest first
    return [...postsMapped, ...announcementsMapped].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [initialPosts, initialAnnouncements]);

  // Extract unique partner companies for the sidebar widget
  const partnerCompanies = useMemo(() => {
    const map = new Map();
    (initialAnnouncements || []).forEach((ann) => {
      if (ann.company && ann.company.id) {
        map.set(ann.company.id, ann.company);
      }
    });
    return Array.from(map.values()).slice(0, 5);
  }, [initialAnnouncements]);

  // Get pinned posts/updates for sidebar widget
  const pinnedUpdates = useMemo(() => {
    return unifiedItems.filter(item => item.isPinned).slice(0, 3);
  }, [unifiedItems]);

  // Filter based on search query & selected category
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "Company Updates" && item.type === "announcement") ||
        item.categories.includes(selectedCategory);

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [unifiedItems, selectedCategory, searchQuery]);

  const featuredItem = filteredItems[0];
  const regularItems = filteredItems.slice(1);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-6">
            <Link href="/dashboard/blog" className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#155DFC] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                  ZIGEX<span className="text-[#155DFC]">NEWS</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                  Community Hub & Insights
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl px-4 py-2.5 w-72 focus-within:ring-2 focus-within:ring-[#155DFC] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-300">
                <Search className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  placeholder="Search updates & news..."
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {isAdmin && (
                <Link
                  href="/studio"
                  className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black dark:hover:bg-slate-700 transition-all shadow-md hover:scale-102"
                >
                  CMS Studio
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden mt-4 flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl px-4 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search updates & news..."
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Categories Menu */}
        <div className="border-t border-slate-100 dark:border-slate-900/60 bg-white/40 dark:bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                  selectedCategory === "All"
                    ? "bg-[#155DFC] text-white border-[#155DFC] shadow-lg shadow-blue-500/10 scale-102"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/80"
                }`}
              >
                All Updates
              </button>

              <button
                onClick={() => setSelectedCategory("Company Updates")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border flex items-center gap-1.5 ${
                  selectedCategory === "Company Updates"
                    ? "bg-[#155DFC] text-white border-[#155DFC] shadow-lg shadow-blue-500/10 scale-102"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/80"
                }`}
              >
                <Bell size={12} />
                Company Announcements
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.slug?.current || cat.title}
                  onClick={() => setSelectedCategory(cat.title)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                    selectedCategory === cat.title
                      ? "bg-[#155DFC] text-white border-[#155DFC] shadow-lg shadow-blue-500/10 scale-102"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/80"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-8">
            {filteredItems.length === 0 ? (
              <div className="text-center py-32 bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-8 shadow-sm">
                <div className="inline-flex p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 mb-5">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  No Updates Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  We couldn't find any articles, posts, or company announcements matching your criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-6 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Spotlight / Hero Featured Post */}
                {featuredItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <BlogCard item={featuredItem} isFeatured={true} />
                  </motion.div>
                )}

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {regularItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                      >
                        <BlogCard item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-40">
            {/* Spotlight Banner Widget */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <Sparkles size={20} className="text-blue-200" />
                <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                  Highlights
                </span>
              </div>
              <h3 className="text-lg font-black leading-snug mb-2">
                Zila AI Assistant
              </h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-5">
                Explore personalized guides, automated updates, and workspace resources created for developers.
              </p>
              <Link
                href="/dashboard/zigagent-ai/docs"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#155DFC] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-md"
              >
                <Compass size={14} />
                Access Zila Docs
              </Link>
            </div>

            {/* Pinned Updates Widget */}
            {pinnedUpdates.length > 0 && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-4">
                  <Pin size={16} className="text-amber-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Pinned Updates
                  </h4>
                </div>
                <div className="space-y-4">
                  {pinnedUpdates.map((item) => (
                    <Link
                      key={item.id}
                      href={item.type === 'announcement' ? `/feed/announcements/${item.slug}` : `/dashboard/blog/${item.slug}`}
                      className="group block"
                    >
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-1 uppercase">
                        {item.authorName}
                      </p>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </h5>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Contributors Widget */}
            {partnerCompanies.length > 0 && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={16} className="text-slate-400 dark:text-slate-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Official Contributors
                  </h4>
                </div>
                <div className="space-y-3.5">
                  {partnerCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/feed/companies/${company.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800">
                        {company.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.company_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-xs">
                            {company.company_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#155DFC] dark:group-hover:text-blue-400 transition-colors">
                          {company.company_name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          Active Partner
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-white dark:bg-[#161b22] border-t border-slate-100 dark:border-slate-900 py-12 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#155DFC] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
            Z
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">
            Zigex Community News
          </h4>
          <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm">
            Updates, tech insights, and job announcements connecting African builders with global opportunities.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-4">
            © {new Date().getFullYear()} ZIGEX INC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
