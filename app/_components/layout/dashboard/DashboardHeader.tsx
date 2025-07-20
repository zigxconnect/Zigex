"use client";

import { Button } from "@/app/_components/ui/Button";
import { AIChatButton } from "../../ui/AIChatButton";
import { Menu, Search, Bell, User, Bot } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export const DashboardHeader = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="flex items-center justify-between p-6 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Internships
          </h1>
          <div className="hidden md:flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            2,341 Active
          </div>
        </div>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        {/* <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search internships, companies, skills..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
          />
        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {hasNotifications && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          )}
        </button>

        {/* Profile */}
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Sarah Chen</div>
            <div className="text-xs text-gray-500">Recruiter</div>
          </div>
          <button className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:shadow-lg transition-shadow">
            SC
          </button>
        </div>

        {/* Mobile Profile */}
        <Link href="/fupro-ai">
          <button className="sm:hidden text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100">
            <User size={20} />
          </button>
        </Link>

        {/* AI Chat Button (Desktop Only) */}
        <Link href="/fupro-ai">
          <div className="hidden sm:flex">
            <AIChatButton />
          </div>
        </Link>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg p-4 lg:hidden z-50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search internships, companies, skills..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};
