"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const [notificationCount, setNotificationCount] = useState(3);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm h-16 sticky top-0 z-30 border-b border-gray-200">
      <button
        onClick={onMenuClick}
        className=" w-10 h-10 rounded-full overflow-hidden bg-blue-900 border-2 border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Toggle sidebar"
      >
        <Image
          src="/gita.png"
          alt="User Avatar"
          width={40}
          height={40}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/20 hover:bg-blue-900/10 transition-colors duration-200"></div>
      </button>

      <div className="hidden lg:flex flex-1"></div>

      <button
        onClick={handleNotificationClick}
        className="lg:hidden relative p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="View notifications"
      >
        <Bell size={22} />

        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>

      {/* Desktop notification and other header elements */}
      <div className="hidden lg:flex items-center gap-4">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="View notifications"
        >
          <Bell size={22} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
