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
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user:any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void; // Add toggle function prop
}

// Updated navigation items with Profile instead of Dashboard
const navItems = [
  { href: "/dashboard", icon: null, label: "Profile", isProfile: true },
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

// Professional FP Logo Component
const FPLogo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
      <span className="text-blue-600 font-bold text-lg">FP</span>
    </div>
    <span className="text-white font-semibold text-lg">Future Prospect</span>
  </div>
);

// User Profile Component
const UserProfile: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className="flex items-center gap-3 w-full">
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
      <Image
        src="/gita.png" // Replace with actual user avatar path
        alt="User Avatar"
        width={40}
        height={40}
        className="object-cover"
        priority
      />
    </div>
    <div className="flex flex-col min-w-0">
      <span className={`font-medium truncate ${
        isActive ? "text-white" : "text-blue-100"
      }`}>
        John Doe {/* Replace with actual user name */}
      </span>
      <span className="text-blue-200 text-sm">Student</span>
    </div>
  </div>
);

// Mobile Avatar Toggle Button Component
const MobileAvatarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed top-4 left-4 z-60 w-12 h-12 rounded-full overflow-hidden bg-blue-900 border-2 border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    aria-label="Toggle sidebar"
  >
    <Image
      src="/gita.png" // Replace with actual user avatar path
      alt="User Avatar"
      width={48}
      height={48}
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-blue-900/20 hover:bg-blue-900/10 transition-colors duration-200"></div>
  </button>
);

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

  // Function to check if a route is active
  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      // For dashboard/profile, match exact path or just "/dashboard"
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Avatar Toggle Button */}
      {onToggle && <MobileAvatarToggle onClick={onToggle} />}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 flex-col bg-blue-900 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out flex shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-blue-800">
          <FPLogo />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors duration-200 lg:hidden"
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
              const isActive = isRouteActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  // Removed onClick={onClose} so sidebar stays open when links are clicked
                  className={`text-sm group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-800 text-white border border-blue-700 shadow-lg"
                      : "text-blue-100 hover:text-white hover:bg-blue-800 border border-transparent hover:border-blue-700"
                  }`}
                >
                  {item.isProfile ? (
                    <UserProfile isActive={isActive} />
                  ) : (
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <Icon
                          size={20}
                          className={`transition-colors duration-200 ${
                            isActive
                              ? "text-blue-200"
                              : "text-blue-300 group-hover:text-blue-100"
                          }`}
                        />
                      )}
                      <span className={`font-medium ${
                        isActive ? "text-white" : "text-blue-100 group-hover:text-white"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  )}
                  {item.badge && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-700 text-blue-100"
                          : "bg-blue-800 text-blue-200 group-hover:bg-blue-700 group-hover:text-blue-100"
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
        <div className="mt-auto p-4 border-t border-blue-800">
          <Button
            variant="secondary-outline"
            className="w-full justify-start gap-3 text-white hover:text-red-200 hover:bg-blue-600/20 hover:border-blue-700 transition-all duration-200 border-blue-700 bg-blue-800"
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