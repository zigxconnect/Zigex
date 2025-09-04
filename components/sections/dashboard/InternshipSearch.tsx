"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DashboardSearchProps {
  onSearch: (query: string) => void;
}

export const DashboardSearch = ({ onSearch }: DashboardSearchProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="relative px-6 md:px-0">
      <Search
        className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
      <Input
        type="text"
        placeholder="Search by title, company, or skill..."
        className="w-full pl-12 pr-32 h-14 text-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        variant="primary"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 px-6"
      >
        Search
      </Button>
    </form>
  );
};
