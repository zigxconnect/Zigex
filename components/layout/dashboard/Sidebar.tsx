"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
  Upload,
  Briefcase,
  LogOut,
  X,
  Users,
  TrendingUp,
  User,
  Menu,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

// Updated navigation items
const navItems = [
  { href: "/dashboard", icon: User, label: "Profile" },
  { href: "/dashboard/upload-resume", icon: Upload, label: "Upload Resume" },
  {
    href: "/dashboard/applied-internships",
    icon: Briefcase,
    label: "Applied Internships",
    badge: 5,
  },
  {
    href: "/dashboard/student-directory",
    icon: Users,
    label: "Student Directory",
  },
  { href: "/dashboard/track-progress", icon: TrendingUp, label: "Track Progress" },
  { href: "/dashboard/fupro-ai", icon: AiOutlineWechat, label: "Chat with FP AI" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onToggle,
  user
}) => {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg z-50 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header with User Profile */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src="/gita.png"
                alt="User Avatar"
                width={56}
                height={56}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">John Doe</h3>
              <p className="text-sm text-gray-600">Student</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 group-hover:bg-blue-50"
                    }
                  `}>
                    <Icon
                      size={18}
                      className={`
                        ${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}
                      `}
                    />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Stats Card */}
          {/* <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Applications</span>
                <span className="font-semibold text-blue-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Profile Views</span>
                <span className="font-semibold text-blue-900">48</span>
              </div>
            </div>
          </div> */}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full justify-start bg-gray-200 gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-gray-200 transition-all duration-200"
            onClick={handleSignOut}
          >
            <div className="p-1 rounded-lg bg-gray-100 hover:bg-red-100">
              <LogOut size={16} />
            </div>
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};