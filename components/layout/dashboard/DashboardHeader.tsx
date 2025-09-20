// components/DashboardHeader.tsx
"use client";

import { Menu } from "lucide-react"; // Bell is now in NotificationDropdown
import Image from "next/image";
import Link from "next/link"
// import { useState } from "react"; // No longer needed for notification state

import { NotificationDropdown } from "./NotificationDropdown"; // Import the new component

interface DashboardHeaderProps {
  user?: any; // Consider defining a proper type for user
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  // const [notificationCount, setNotificationCount] = useState(3); // No longer needed here

  // The handleNotificationClick logic is now inside NotificationDropdown
  // const handleNotificationClick = () => {
  //   console.log("Notifications clicked");
  // };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm w-full">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="hidden sm:block font-bold text-gray-900 text-lg">ZIGEX</span>
          </div>
        </div>

        {/* Right Side - Notifications & User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationDropdown /> {/* Use the new component here */}

          {/* User Avatar - Desktop Only */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-gray-200">
            <Link href="/dashboard/edit-profile">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <Image
                src="/gita.png" // Make sure this path is correct or dynamic
                alt="User Avatar"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            </Link>

            <Link href="/dashboard/edit-profile">
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-gray-900">Fonyuy Gita</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};