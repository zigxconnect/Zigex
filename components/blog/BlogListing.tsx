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
    <div className="w-full">
      {/* Header / Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <Link
              href="/dashboard/blog"
              className="group flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                Z
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                ZIGEX<span className="text-blue-600">NEWS</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
               {/* Search Bar - Hidden on small mobile */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isAdmin && (
                <Link
                  href="/studio"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                >
                  Studio
                </Link>
              )}
            </div>
          </div>
          
           {/* Mobile Search Bar */}
           <div className="md:hidden mt-4 flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
        </div>

        {/* Categories Scroll */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 overflow-x-auto py-3 no-scrollbar mask-gradient-right">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === "All"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                All Stories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug?.current || cat.title}
                  onClick={() => setSelectedCategory(cat.title)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.title
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
        {filteredPosts.length === 0 ? (
           <div className="text-center py-32">
             <div className="inline-block p-4 rounded-full bg-blue-50 mb-4">
                <Search className="w-8 h-8 text-blue-500"/>
             </div>
             <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
             <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
             <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-blue-600 text-sm font-medium hover:underline">Clear all filters</button>
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
             <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl shadow-blue-900/20 group cursor-pointer aspect-[4/3] md:aspect-[21/9]">
                <Link href={`/dashboard/blog/${featuredPost.slug.current}`} className="block w-full h-full"> 
                    <BlogCard post={featuredPost} isFeatured={true} />
                </Link>
             </div>
          </motion.div>
        )}

        {/* Regular Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {regularPosts.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
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
       <footer className="bg-white mt-20 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6">Z</div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Zigex News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
