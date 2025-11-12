"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostingCard, FormattedPosting } from "./PostingCard";

interface PostingsListClientProps {
  initialPostings: FormattedPosting[];
}

export const PostingsListClient = ({
  initialPostings,
}: PostingsListClientProps) => {
  // 1. Store the initial data from the server in a client-side state
  const [postings, setPostings] = useState<FormattedPosting[]>(initialPostings);

  // 2. Define the function that will handle the deletion
  // This function updates the state, which automatically re-renders the component
  const handlePostDeleted = (deletedId: string) => {
    setPostings((currentPostings) =>
      currentPostings.filter((posting) => posting.id !== deletedId)
    );
  };

  // 3. Render the empty state if the list becomes empty after deletions
  if (postings.length === 0) {
    return <EmptyStatePostings />;
  }

  // 4. Render the list of cards, passing the onDelete handler to each one
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Postings</h1>
          <p className="text-gray-500 mt-1">
            Manage all your company's postings here.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/postings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Posting
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postings.map((posting) => (
          <PostingCard
            key={posting.id}
            posting={posting}
            onDelete={handlePostDeleted} // <-- This is the crucial prop!
          />
        ))}
      </div>
    </div>
  );
};

// This can be the same empty state component from your page file
const EmptyStatePostings = () => (
  <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 mt-6">
    <h3 className="text-xl font-semibold text-gray-800">
      All Postings Handled!
    </h3>
    <p className="mt-2 text-gray-500">
      You've cleared the list. Ready to create something new?
    </p>
    <Button asChild className="mt-6">
      <Link href="/admin/postings/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Posting
      </Link>
    </Button>
  </div>
);
