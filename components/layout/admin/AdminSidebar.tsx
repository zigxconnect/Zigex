"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  Users,
  CheckCheck,
  LogOut,
  FilePen,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSidebar } from "./AdminLayoutProvider";
import { cn } from "@/lib/utils";

// Define the type for the company profile, reusable across components
export interface CompanyProfile {
  id: string;
  company_name: string;
  industry?: string;
  description?: string;
}

// Helper function to generate initials from a name
const getInitials = (name: string = ""): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Define the navigation links for the sidebar
const navLinks = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/postings", icon: FileText, label: "Postings" },
  { href: "/admin/applications", icon: Users, label: "Applications" },
  { href: "/admin/profile", icon: FilePen, label: "Edit Profile" },
];

export const AdminSidebar = ({
  companyProfile,
}: {
  companyProfile: CompanyProfile;
}) => {
  const { isOpen, isMobile, toggleSidebar } = useAdminSidebar();
  const pathname = usePathname();
  const router = useRouter();

  // Function to handle user sign-out
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout request failed");
      }
      router.push("/");
      router.refresh(); // Ensure the session state is fully cleared
      toast.success("You have been signed out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile Overlay: Dims the background when the sidebar is open on mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:p-4",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl lg:rounded-2xl overflow-hidden">
          {/* Company Profile Section */}
          <div className="p-6 text-center border-b border-gray-100/50 bg-gradient-to-b from-white/50 to-transparent">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                {getInitials(companyProfile.company_name)}
              </div>
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900 truncate px-2">
              {companyProfile.company_name}
            </h2>
            {companyProfile.industry && (
              <p className="text-sm font-medium text-blue-600/80 mt-1">
                {companyProfile.industry}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin/dashboard" &&
                  pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                    isActive
                      ? "text-blue-700 bg-blue-50 shadow-sm ring-1 ring-blue-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <link.icon
                    size={20}
                    className={cn(
                      "transition-colors duration-300",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <ChevronRight size={16} className="text-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Sign Out Button */}
          <div className="p-4 border-t border-gray-100/50 bg-gray-50/30">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-300 rounded-xl h-11"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
