"use client";

import { Bell, Menu } from "lucide-react";
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
          <div className="flex items-center  shadow-md p-2 rounded-lg">
            {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="">Z</span>
            </div> */}
            <div className="text-white font-bold text-sm w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center shadow-md mr-1">Z</div>

            <div className=" hidden sm:block font-bold text-blue-700 text-lg rounded flex items-center justify-center">IGEX</div>

          </div>
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
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <Image
                src="/gita.png"
                alt="User Avatar"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-gray-900">Fonyuy Gita</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};