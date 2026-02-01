// lib/store/feedStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TabId = "all" | "live" | "internships" | "programs" | "events" | "announcements";

interface FeedState {
  activeTab: TabId;
  searchQuery: string;
  setActiveTab: (tab: TabId) => void;
  setSearchQuery: (query: string) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      activeTab: "all",
      searchQuery: "",
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "feed-storage",
    }
  )
);