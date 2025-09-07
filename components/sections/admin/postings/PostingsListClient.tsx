"use client";

import { useState } from "react";
import { PostingCard, FormattedPosting } from "./PostingCard";
import { List } from "lucide-react";

type FilterType = "All" | "Internship" | "Event" | "Program";

export const PostingsListClient = ({
  initialPostings,
}: {
  initialPostings: FormattedPosting[];
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filteredPostings = initialPostings.filter((posting) => {
    if (activeFilter === "All") return true;
    return posting.type === activeFilter;
  });

  const FilterButton = ({ label }: { label: FilterType }) => (
    <button
      onClick={() => setActiveFilter(label)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
        activeFilter === label
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border">
        <FilterButton label="All" />
        <FilterButton label="Internship" />
        <FilterButton label="Event" />
        <FilterButton label="Program" />
      </div>

      {filteredPostings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPostings.map((posting) => (
            <PostingCard key={posting.id} posting={posting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <List size={40} className="mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            No Postings Found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no postings matching the filter &quot;{activeFilter}
            &quot;.
          </p>
        </div>
      )}
    </div>
  );
};
