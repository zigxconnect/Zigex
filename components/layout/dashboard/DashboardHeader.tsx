"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl ||
    "/default-avatar.png";

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) throw new Error("Logout failed");

      toast.success("Logged out successfully");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <Link
            href="/"
            className="flex items-center group flex-shrink-0 p-1.2"
          >
            <div className="relative w-14 h-14 sm:w-11 sm:h-11 lg:w-12 lg:h-12 transition-transform group-hover:scale-105">
              <Image
                src="https://i.ibb.co/xKpXs0p3/z3.jpg"
                alt="Zigex Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right Side - Logout, Notifications & User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`
              relative overflow-hidden flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm 
              transition-all duration-300 shrink-0 transform
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105
              ${isLoading ? "opacity-70 cursor-not-allowed scale-95" : "cursor-pointer"}
              active:scale-95
            `}
            aria-label="Logout"
          >
            {/* Icon - visible on mobile and desktop */}
            <LogOut
              size={18}
              className="shrink-0"
            />
            <span className="hidden lg:inline font-bold">
              {isLoading ? "Logging out..." : "Logout"}
            </span>
          </button>
  <Link  href={`/dashboard/student/${user.profile.id}`} className="flex items-center gap-3 ml-2 lg:ml-3 flex-shrink-0">
            <div className=" relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all duration-200">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden md:flex">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{userRole}</p>
            </div>
          </Link>
          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Avatar & Info */}
          {/* <Link  href={`/dashboard/student/${user.profile.id}`} className="flex items-center gap-3 ml-2 lg:ml-3 flex-shrink-0">
            <div className=" relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all duration-200">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden md:flex">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{userRole}</p>
            </div>
          </Link> */}
        </div>
      </div>
    </header>
  );
};