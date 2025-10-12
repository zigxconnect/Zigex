"use client";

import { Menu, Search, Bell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import Link from "next/link";

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-full mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          {/* Logo/Brand */}
          <Link href="/" className="flex items-center group flex-shrink-0 p-1 bg-[#cfc7c7] shadow-2xl rounded-full">
            <div className=" relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 transition-transform group-hover:scale-105">
              <Image
                src="/z3.png"
                alt="Zigex Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right Side - Search, Notifications & User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search Icon */}
          <button
            onClick={onSearchOpen}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 flex-shrink-0"
            aria-label="Open search"
          >
            <Search size={20} className="text-gray-600" />
          </button>

          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Avatar & Info */}
          <div className="hidden md:flex items-center gap-3 ml-2 lg:ml-3 flex-shrink-0">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all duration-200">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};