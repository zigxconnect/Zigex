"use client";

import { Menu, Bell } from "lucide-react";

interface DashboardHeaderProps {
  user: { name: string; initials: string };
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm h-16 sticky top-0 z-30 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Right Section with User Info */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          {/* Example notification dot */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-800">
              {user.name}
            </div>
            <div className="text-xs text-gray-500">Student</div>
          </div>
          <div className="w-9 h-9 bg-[#193CB8] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
};
