"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/app/_components/ui/Logo";
import { Button } from "@/app/_components/ui/Button";
import {
  User,
  Upload,
  Briefcase,
  LogOut,
  X,
  Users,
  TrendingUp,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Updated navigation items
const navItems = [
  { href: "/dashboard", icon: User, label: "Dashboard" },
  { href: "/upload-resume", icon: Upload, label: "Upload Resume" },
  {
    href: "/applied-internships",
    icon: Briefcase,
    label: "Applied Internships",
    badge: 5,
  },
  {
    href: "/dashboard/student-directory",
    icon: Users,
    label: "Student Directory",
  },
  { href: "/track-progress", icon: TrendingUp, label: "Track Progress" },
  { href: "/chat", icon: AiOutlineWechat, label: "Chat with Fupro Ai" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname(); // Get the current URL path

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Use window.location.href for a robust, full-page reload to the homepage
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* 
        THE Z-INDEX FIX - PART 1:
        The overlay now has a high z-index (z-40) to appear above other content but below the sidebar.
      */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* 
        THE Z-INDEX FIX - PART 2:
        The sidebar itself has the highest z-index (z-50) to ensure it is always on top.
      */}
      <aside
        className={`w-64 flex-col bg-white fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out flex shadow-lg
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
          <Logo />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Active state is now determined by the current URL `pathname`
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-orange-700 bg-orange-50 font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={isActive ? "text-orange-600" : "text-gray-500"}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      } px-2 py-0.5 rounded-full`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto p-6">
          <Button
            variant="secondary-outline"
            className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
