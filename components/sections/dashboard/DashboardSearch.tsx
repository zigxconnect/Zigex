"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardSearchProps {
  onSearch: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export const DashboardSearch = ({
  onSearch,
  isOpen,
  onClose,
}: DashboardSearchProps) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches");
      }
    }
  }, []);

  // Keyboard shortcut (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open from parent if provided
          onOpen && onOpen();
        }
      }
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm);

    // Save to recent searches
    if (searchTerm.trim()) {
      const updated = [
        searchTerm,
        ...recentSearches.filter((s) => s !== searchTerm),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }

    // Close modal after search
    onClose();
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
    "Marketing Internship",
    "Product Management",
    "Cybersecurity",
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Search Header */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <Search size={20} className="text-gray-400 flex-shrink-0" />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                      handleSearch(query);
                    }
                  }}
                  placeholder="Search internships, programs, events..."
                  className="flex-1 text-base outline-none placeholder:text-gray-400"
                />

                {query && (
                  <button
                    onClick={clearSearch}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Close search"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Search Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query && (
                  <div className="p-4 space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Clock size={16} className="text-gray-500" />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearch(search)}
                              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm flex items-center gap-3 group"
                            >
                              <Clock
                                size={14}
                                className="text-gray-400 group-hover:text-gray-600"
                              />
                              <span className="flex-1">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Suggestions */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-gray-500" />
                        Popular Searches
                      </h3>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearch(suggestion)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm flex items-center gap-3 group"
                          >
                            <Sparkles
                              size={14}
                              className="text-gray-400 group-hover:text-blue-600"
                            />
                            <span className="flex-1">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-200">
                            ↵
                          </kbd>
                          <span>to search</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-200">
                            ESC
                          </kbd>
                          <span>to close</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {query && (
                  <div className="p-4">
                    <div className="flex items-center gap-3 px-3 py-6 text-center justify-center">
                      <Search size={18} className="text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">Enter</kbd> to search for
                        <span className="font-semibold text-gray-900 ml-1">
                          "{query}"
                        </span>
                      </p>
                    </div>
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