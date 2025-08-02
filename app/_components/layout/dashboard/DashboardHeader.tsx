"use client";

import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  return (
    <header className="flex items-center p-4 bg-white/50 backdrop-blur-sm h-16 sticky top-0 z-30 border-b border-gray-200">
      {/* This button is always visible and is the only way to toggle the sidebar. */}
      <button
        onClick={onMenuClick}
        className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Other header elements like a search bar or user menu could be added here later */}
    </header>
  );
};
