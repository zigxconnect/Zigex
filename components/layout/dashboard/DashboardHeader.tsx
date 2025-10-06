"use client";

import { Menu, Search, Bell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
  onSearchOpen: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
  onSearchOpen,
}: DashboardHeaderProps) => {
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl ||
    "/default-avatar.png";

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">IGEX</h1>
            </div>
          </div>
        </div>

        {/* Right Side - Search, Notifications & User */}
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <button
            onClick={onSearchOpen}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Open search"
          >
            <Search size={20} className="text-gray-600" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Avatar - Desktop Only */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};