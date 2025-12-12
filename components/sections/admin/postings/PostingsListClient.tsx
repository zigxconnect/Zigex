"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from "lucide-react";
import { PostingCard, FormattedPosting } from "./PostingCard";
import { Input } from "@/components/ui/input";

interface PostingsListClientProps {
  initialPostings: FormattedPosting[];
}

export const PostingsListClient = ({
  initialPostings,
}: PostingsListClientProps) => {
  const [postings, setPostings] = useState<FormattedPosting[]>(initialPostings);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePostDeleted = (deletedId: string) => {
    setPostings((currentPostings) =>
      currentPostings.filter((posting) => posting.id !== deletedId)
    );
  };

  const filteredPostings = postings.filter((posting) =>
    posting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (postings.length === 0) {
    return <EmptyStatePostings />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Postings</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your active job listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button asChild className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20">
            <Link href="/admin/postings/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Posting
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search postings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPostings.map((posting) => (
          <PostingCard
            key={posting.id}
            posting={posting}
            onDelete={handlePostDeleted}
          />
        ))}
      </div>
      
      {filteredPostings.length === 0 && (
        <div className="text-center py-20">
            <p className="text-gray-500">No postings found matching your search.</p>
        </div>
      )}
    </div>
  );
};

const EmptyStatePostings = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <PlusCircle className="h-10 w-10 text-gray-300" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      No Postings Yet
    </h3>
    <p className="text-gray-500 max-w-md mb-8">
      You haven't created any job postings yet. Start by creating your first opportunity to attract talent.
    </p>
    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-full px-8">
      <Link href="/admin/postings/new">
        <PlusCircle className="mr-2 h-5 w-5" />
        Create First Posting
      </Link>
    </Button>
  </div>
);
