"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Upload,
  Briefcase,
  LogOut,
  X,
  Users,
  TrendingUp,
  User,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: User;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  stats?: {
    applications?: number;
    profileViews?: number;
  };
  applicationsCount?: number;
  profileViews?: number;
  // Add other fields as needed
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
  {
    href: "/dashboard/track-progress",
    icon: TrendingUp,
    label: "Track Progress",
  },
  {
    href: "/dashboard/fupro-ai",
    icon: AiOutlineWechat,
    label: "Chat with Agent ZAi",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  user,
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

  // Handle nav item click on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #dbeafe;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
          border: 2px solid #dbeafe;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #1e40af;
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Header with User Profile - Fixed at top */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
              <Image
                src={user?.avatar || "/default-avatar.png"}
                alt="User Avatar"
                width={56}
                height={56}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-sm lg:text-base">
                {user?.name || "Guest User"}
              </h3>
              +{" "}
              <p className="text-xs lg:text-sm text-gray-600">
                {user?.role || "Student"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user?.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ${
                    user?.isOnline ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {user?.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-1 lg:space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isRouteActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`
                      group hover:bg-blue-600 flex items-center gap-3 px-3 lg:px-3 py-2 lg:py-2 rounded-xl text-sm font-medium transition-all shadow-lg duration-200 
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }
                    `}
                  >
                    <div
                      className={`
                      p-1.5 lg:p-2 rounded-lg transition-colors flex-shrink-0
                      ${
                        isActive
                          ? "bg-blue-700"
                          : "bg-gray-100 group-hover:bg-blue-50"
                      }
                    `}
                    >
                      <Icon
                        size={16}
                        className={`lg:w-[18px] lg:h-[18px]
                          ${
                            isActive
                              ? "text-white"
                              : "text-gray-600 group-hover:text-blue-600"
                          }
                        `}
                      />
                    </div>
                    <span className="flex-1 truncate text-xs lg:text-sm">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`
                        px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                        }
                      `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats Card - Hidden on small screens - Inside scrollable area */}
            <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hidden lg:block">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                Quick Stats
              </h4>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Applications</span>
                  <span className="font-semibold text-blue-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Profile Views</span>
                  <span className="font-semibold text-blue-900">48</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Sign Out Button - Fixed at bottom */}
        <div className="flex-shrink-0 p-3 lg:p-4 border-t border-gray-100">
          <Button
            variant="secondary"
            className="w-full justify-start bg-blue-600 gap-2 lg:gap-3 text-gray-100 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-gray-200 transition-all duration-200 text-xs lg:text-sm"
            onClick={handleSignOut}
          >
            <div className="p-1 rounded-lg bg-gray-100 hover:bg-red-100 flex-shrink-0">
              <LogOut size={14} className="lg:w-4 lg:h-4" />
            </div>
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
