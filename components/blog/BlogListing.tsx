"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BlogCard from "./BlogCard";
import { Search } from "lucide-react";

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

interface BlogListingProps {
  initialPosts: Post[];
  categories: Category[];
  isAdmin: boolean;
}

export default function BlogListing({
  initialPosts,
  categories,
  isAdmin,
}: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      post.categories?.some((c) => c.title === selectedCategory);
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">
      {/* Header / Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-100 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center gap-6">
            <Link
              href="/dashboard/blog"
              className="group flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 tracking-tight leading-none">
                  ZIGEX<span className="text-blue-600">NEWS</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Updates & Insights</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
               {/* Search Bar - Hidden on small mobile */}
              <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-5 py-2.5 w-72 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all duration-300">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 w-full placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isAdmin && (
                <Link
                  href="/studio"
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 hover:scale-105"
                >
                  Studio
                </Link>
              )}
            </div>
          </div>
          
           {/* Mobile Search Bar */}
           <div className="md:hidden mt-4 flex items-center bg-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all duration-300">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 w-full placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
        </div>

        {/* Categories Scroll */}
        <div className="border-t border-slate-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto py-4 no-scrollbar mask-gradient-right">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === "All"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                    : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
                }`}
              >
                All Stories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug?.current || cat.title}
                  onClick={() => setSelectedCategory(cat.title)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat.title
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-16">
        {filteredPosts.length === 0 ? (
           <div className="text-center py-40">
             <div className="inline-flex p-6 rounded-[2rem] bg-slate-100 mb-6">
                <Search className="w-10 h-10 text-slate-400"/>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No articles found</h3>
             <p className="text-slate-500 font-medium">We couldn't find any articles matching your search.</p>
             <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
               Clear filters
             </button>
           </div>
        ) : (
            <>
        {/* Featured Post (Hero) */}
        {featuredPost && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full"
          >
             {/* Slightly different layout for the featured post */}
             <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl shadow-blue-900/20 group cursor-pointer aspect-[4/3] md:aspect-[21/9] ring-1 ring-slate-900/5">
                <Link href={`/dashboard/blog/${featuredPost.slug.current}`} className="block w-full h-full"> 
                    <BlogCard post={featuredPost} isFeatured={true} />
                </Link>
             </div>
          </motion.div>
        )}

        {/* Regular Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <AnimatePresence mode="popLayout">
            {regularPosts.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        </>
        )}
      </main>

       {/* Footer */}
       <footer className="bg-white mt-32 py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-6">Z</div>
            <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Zigex News</h4>
            <p className="text-slate-500 text-sm font-medium mb-8 max-w-md">Illuminating the path for Africa's next generation of tech leaders through stories, insights, and opportunities.</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} Zigex Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
