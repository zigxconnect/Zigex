"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DashboardHeaderProps {
  user?: any; // Use your UserProfile type here
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [notificationCount, setNotificationCount] = useState(3);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  // Extract user data with fallbacks
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl ||
    "/default-avatar.png";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm w-full">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Menu size={20} />
          </button>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="group flex items-center shadow-md p-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
          >
            <div className="text-white font-bold text-sm w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-sm flex items-center justify-center shadow-md mr-1 transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:shadow-blue-500/50 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600">
              <span className="transition-transform duration-300 ease-in-out group-hover:scale-125">
                Z
              </span>
            </div>
            <div className="sm:block font-bold text-blue-700 text-lg rounded flex items-center justify-center transition-all duration-300 ease-in-out group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:scale-105">
              IGEX
            </div>
          </Link>
        </div>

        {/* Right Side - Notifications & User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2.5 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-md">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* User Avatar - Desktop Only */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <Image
                src={userAvatar}
                alt={`${userName}'s Avatar`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
