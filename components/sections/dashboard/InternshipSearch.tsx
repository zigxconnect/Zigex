"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface DashboardSearchProps {
  onSearch: (query: string) => void;
}

export const DashboardSearch = ({ onSearch }: DashboardSearchProps) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Real-time search with minimal delay
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-[500px] mb-8">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search internships by title, company, or location..."
          className="w-full pl-12 pr-12 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl bg-white shadow-sm"
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};