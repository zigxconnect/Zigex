"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardSearchProps {
  onSearch: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSearch = ({ 
  onSearch, 
  isOpen, 
  onClose 
}: DashboardSearchProps) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm);
    
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  const suggestions = [
    "Software Engineering",
    "Data Science",
    "UI/UX Design",
    "Marketing",
    "Product Management"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto">
              {/* Search Header */}
              <div className="flex items-center gap-4 p-4 border-b">
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} className="text-gray-600" />
                </button>

                <div className="flex-1 relative">
                  <Search 
                    size={20} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search internships, programs, events..."
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-full text-base outline-none focus:bg-gray-100 transition-colors"
                  />
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Content */}
              <div className="max-h-[70vh] overflow-y-auto">
                {!query && (
                  <div className="p-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Clock size={16} />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearch(search)}
                              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Suggestions */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Popular Searches
                      </h3>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearch(suggestion)}
                            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {query && (
                  <div className="p-4">
                    <p className="text-sm text-gray-600">
                      Searching for <span className="font-semibold text-gray-900">"{query}"</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};