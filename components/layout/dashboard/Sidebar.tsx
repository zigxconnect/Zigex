"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/uiComponenet/Logo";

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
  { href: "/dashboard/fupro-ai", icon: AiOutlineWechat, label: "Chat with Fupro Ai" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 flex-col bg-white fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out flex shadow-lg border-r border-gray-100
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100">
          <Logo />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-blue-500"
                      }`}
                    />
                    <span className={`font-medium ${
                      isActive ? "text-blue-700" : "text-gray-700 group-hover:text-blue-600"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="mt-auto p-4 border-t border-gray-100">
          <Button
            variant="secondary-outline"
            className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
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