"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Logo } from "@/components/layout/Logo";
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-full mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="hidden lg:flex items-center gap-2 group flex-shrink-0"
          >
            <div className="relative w-14 h-14 sm:w-11 sm:h-11 lg:w-12 lg:h-12 transition-transform group-hover:scale-105">
              <Logo className="w-full h-full" />
            </div>
          </Link>
        </div>

        {/* Right Side - Notifications, User & Logout */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Profile */}
          <Link  
            href={`/profile/${user?.profile?.username || ""}`} 
            className="flex items-center gap-3 pl-2 lg:pl-3 border-l-2 border-slate-100 flex-shrink-0 group"
          >
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-white ring-2 ring-blue-50 group-hover:ring-blue-200 shadow-sm overflow-hidden transition-all duration-300">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden md:flex flex-col">
              <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
                {userName}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide leading-tight">{userRole}</p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`
              relative overflow-hidden flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl font-bold text-sm 
              transition-all duration-300 shrink-0 transform
              bg-white border-2 border-blue-50 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50
              shadow-sm hover:shadow-md
              ${isLoading ? "opacity-70 cursor-not-allowed scale-95" : "cursor-pointer"}
              active:scale-95
            `}
            aria-label="Logout"
            title="Sign Out"
          >
            <LogOut
              size={18}
              className="shrink-0"
            />
            <span className="hidden lg:inline">
              {isLoading ? "..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};