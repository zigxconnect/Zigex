"use client";

// TypeScript interface for company profile
export interface CompanyProfile {
  id: string;
  company_name: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

import React, { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  FileText,
  Users,
  FileEdit,
  CheckCheck,
  LogOut,
  FilePen,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/uiComponent/Logo";
import { toast } from "sonner";

// Helper function to get initials from a company name
const getInitials = (name: string = "") => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const navLinks = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/postings", icon: FileText, label: "Internship Postings" },
  { href: "/admin/applicants", icon: Users, label: "Applicants" },
  { href: "/admin/profile", icon: FilePen, label: "Edit Profile" },
  { href: "/admin/accepted", icon: CheckCheck, label: "Accepted Interns" },
];

// Create context for sidebar state
const SidebarContext = createContext({
  isOpen: true,
  setIsOpen: (open: boolean) => {},
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// ========================================================================
// 1. NEW COMPONENT TO HANDLE "READ MORE" FUNCTIONALITY
// ========================================================================
const ReadMore = ({
  text,
  maxLength = 50,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Return a placeholder if no text is provided from the backend
  if (!text) {
    return (
      <p className="mt-3 text-xs text-gray-600 leading-relaxed max-w-xs">
        No description provided.
      </p>
    );
  }

  // If the text is shorter than the max length, just display it without a toggle
  if (text.length <= maxLength) {
    return (
      <p className="mt-3 text-xs text-gray-600 leading-relaxed max-w-xs">
        {text}
      </p>
    );
  }

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <p className="mt-3 text-xs text-gray-600 leading-relaxed max-w-xs">
      {isExpanded ? text : `${text.substring(0, maxLength)}... `}
      <button
        onClick={toggleText}
        className="text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        style={{ whiteSpace: "nowrap" }}
        type="button"
        aria-expanded={isExpanded}
        aria-label={
          isExpanded ? "Show less description" : "Show full description"
        }
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </p>
  );
};

// Main Provider Component that manages all state
export const AdminSidebarProvider = ({
  children,
  companyProfile,
}: {
  children: React.ReactNode;
  companyProfile: CompanyProfile;
}) => {
  // Initialize based on screen size
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, start closed; on desktop, ALWAYS OPEN (static)
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true); // Force open on desktop
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Modified toggle - only works on mobile
  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
    // Do nothing on desktop - sidebar stays static
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          // Include CSRF token if your framework provides one
          // 'X-CSRF-Token': getCsrfToken(),
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!companyProfile) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Hamburger Button - Only show on mobile when sidebar is closed */}
        {!isOpen && isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        )}

        {/* Mobile Overlay - Only on mobile */}
        {isOpen && isMobile && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl border-r border-gray-200 z-40 flex flex-col transition-all duration-300 ease-in-out
            ${
              isMobile
                ? isOpen
                  ? "translate-x-0"
                  : "-translate-x-full" // Mobile: can hide/show
                : "translate-x-0" // Desktop: always visible
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Logo />
            {/* Close button - Only show on mobile */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Company Profile Section */}
          <div className="flex flex-col items-center p-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-800 text-2xl font-bold shadow-sm ring-4 ring-white">
                {getInitials(companyProfile.company_name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {companyProfile.company_name || "Company Name"}
            </h2>
            <p className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full mt-1">
              {companyProfile.industry || "Industry"}
            </p>

            {/* ======================================================================== */}
            {/* 2. OLD DESCRIPTION PARAGRAPH REPLACED WITH THE NEW COMPONENT */}
            {/* ======================================================================== */}
            <ReadMore text={companyProfile.description} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  // Only close on mobile
                  if (isMobile) {
                    setIsOpen(false);
                  }
                }}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <link.icon
                  size={20}
                  className="text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            {/* TODO: Add FuPro AI link when ready */}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Main Content Area - On desktop, always ml-80 since sidebar is static */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isMobile ? "ml-0" : "ml-80" // Desktop always has left margin, mobile never does
          }`}
        >
          {/* Content wrapper with mobile spacing */}
          <div className="pt-16 lg:pt-0">{children}</div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

// Simplified AdminSidebar component (now just exports the provider)
export const AdminSidebar = AdminSidebarProvider;

// Enhanced AdminHeader that responds to sidebar state
export const EnhancedAdminHeader = ({
  stats,
  title = "Your Internship Postings",
  className = "",
}: {
  stats: {
    total: number;
    active: number;
    applications: number;
  };
  title?: string;
  className?: string;
}) => {
  return (
    <header
      className={`bg-white/60 backdrop-blur-sm border-b border-gray-200 p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {/* Mobile: Stack stats vertically */}
          <div className="mt-2 sm:hidden">
            <div className="flex flex-col gap-1 text-sm text-gray-500">
              <div>
                Total Postings:{" "}
                <span className="font-semibold text-gray-700">
                  {stats.total}
                </span>
              </div>
              <div>
                Active:{" "}
                <span className="font-semibold text-green-600">
                  {stats.active}
                </span>
              </div>
              <div>
                Total Applications:{" "}
                <span className="font-semibold text-gray-700">
                  {stats.applications}
                </span>
              </div>
            </div>
          </div>
          {/* Desktop: Inline stats */}
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Total Postings:{" "}
            <span className="font-semibold text-gray-700">{stats.total}</span> ·
            Active:{" "}
            <span className="font-semibold text-green-600">{stats.active}</span>{" "}
            · Total Applications:{" "}
            <span className="font-semibold text-gray-700">
              {stats.applications}
            </span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/admin/postings/new" passHref>
            <Button
              variant="orange"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileEdit size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Post New Internship</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

// Content wrapper component that responds to sidebar state
export const AdminContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <main className={`p-4 sm:p-6 ${className}`}>{children}</main>;
};
