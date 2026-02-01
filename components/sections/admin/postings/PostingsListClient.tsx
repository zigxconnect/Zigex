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
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="space-y-1">
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tighter leading-tight">
            Asset <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-medium leading-relaxed">
            Monitor, deploy, and optimize your company's internship and event opportunities across the Zigex network.
          </p>
        </div>
        <Button asChild className="bg-slate-900 rounded-2xl h-12 px-8 gap-2 hover:bg-black text-white transition-all shadow-xl shadow-slate-200 font-bold active:scale-95 text-[11px] uppercase tracking-wider">
          <Link href="/admin/postings/new">
            <PlusCircle size={18} />
            Create Posting
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {postings.map((posting) => (
          <PostingCard
            key={posting.id}
            posting={posting}
            onDelete={handlePostDeleted}
          />
        ))}
      </div>
    </div>
  );
};

// This can be the same empty state component from your page file
const EmptyStatePostings = () => (
  <div className="text-center bg-white/70 backdrop-blur-xl p-20 rounded-[3rem] border border-indigo-100/50 shadow-2xl shadow-indigo-100/20 mt-12 animate-in fade-in zoom-in duration-1000">
    <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
       <PlusCircle className="h-12 w-12 text-slate-300" />
    </div>
    <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tighter">
      No Assets <span className="text-primary italic">Deployed</span>
    </h3>
    <p className="mt-4 text-sm text-slate-400 max-w-[320px] mx-auto leading-relaxed font-medium">
      Your opportunity portfolio is currently empty. Start by creating a new posting to attract top talent.
    </p>
    <Button asChild className="mt-10 bg-primary rounded-2xl h-14 px-10 gap-2 hover:bg-primary/90 text-white transition-all shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-[0.2em] active:scale-95">
      <Link href="/admin/postings/new">
        <PlusCircle size={20} />
        Initiate First Posting
      </Link>
    </Button>
  </div>
);
