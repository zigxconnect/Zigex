"use client";

import { useState } from "react";
// import { InternshipListings } from "./InternshipListings";
import { DashboardSearch } from "./DashboardSearch";
import { InternshipListings } from "./InternshipListings";

export const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <DashboardSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpen={() => setIsSearchOpen(true)}
        onSearch={setSearchQuery}
      />
      <InternshipListings
        searchQuery={searchQuery}
        isSearchOpen={isSearchOpen}
        onSearchOpen={() => setIsSearchOpen(true)}
        onSearch={setSearchQuery}
      />
    </>
  );
};