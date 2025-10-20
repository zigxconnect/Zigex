"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// TypeScript interface for company profile data
export interface CompanyProfile {
  id: string;
  company_name: string;
  industry?: string;
  description?: string;
  [key: string]: any;
}

// Helper to get initials from a name
const getInitials = (name: string = ""): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Navigation links for the sidebar
const navLinks = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/postings", icon: FileText, label: "Postings" },
  { href: "/admin/applicants", icon: Users, label: "Applicants" },
  { href: "/admin/profile", icon: FilePen, label: "Edit Profile" },
  { href: "/admin/accepted", icon: CheckCheck, label: "Accepted Interns" },
];

// Context for managing sidebar state
const SidebarContext = createContext({
  isOpen: true,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// "Read More" component for long descriptions
const ReadMore = ({
  text,
  maxLength = 50,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text)
    return (
      <p className="mt-3 text-xs text-gray-600">No description provided.</p>
    );
  if (text.length <= maxLength)
    return <p className="mt-3 text-xs text-gray-600">{text}</p>;

  return (
    <p className="mt-3 text-xs text-gray-600 leading-relaxed">
      {isExpanded ? text : `${text.substring(0, maxLength)}... `}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 font-semibold hover:underline"
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </p>
  );
};

// Main provider component that wraps the admin layout
export const AdminSidebarProvider = ({
  children,
  companyProfile,
}: {
  children: React.ReactNode;
  companyProfile: CompanyProfile;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed on the server.");

      router.push("/");
      router.refresh();
      toast.success("You have been signed out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!companyProfile) return null;

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <div className="min-h-screen bg-gray-50">
        {!isOpen && isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-3 bg-white shadow-lg rounded-xl"
          >
            <Menu size={20} />
          </button>
        )}

        {isOpen && isMobile && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={toggleSidebar}
          />
        )}

        <aside
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl border-r z-40 flex flex-col transition-transform duration-300 ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}`}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <Logo />
            {isMobile && (
              <button onClick={toggleSidebar}>
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-col items-center p-6 text-center border-b">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-2xl font-bold">
                {getInitials(companyProfile.company_name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {companyProfile.company_name}
            </h2>
            <p className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full mt-1">
              {companyProfile.industry}
            </p>
            <ReadMore text={companyProfile.description || ""} />
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                }}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                <link.icon
                  size={20}
                  className="text-gray-500 group-hover:text-blue-700"
                />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t bg-gray-50">
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

        <div
          className={`transition-all duration-300 ${isMobile ? "ml-0" : "ml-80"}`}
        >
          <div className="pt-16 lg:pt-0">{children}</div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

// Main export to be used as the layout wrapper
export const AdminSidebar = AdminSidebarProvider;

export const EnhancedAdminHeader = ({
  stats,
  title = "Page Title",
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
          <p className="text-sm text-gray-500 mt-1">
            Total:{" "}
            <span className="font-semibold text-gray-700">{stats.total}</span> ·
            Active:{" "}
            <span className="font-semibold text-green-600">{stats.active}</span>{" "}
            · Applications:{" "}
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
              <FileEdit size={18} />
              <span>Post New Internship</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

// Standalone wrapper for the main content area of an admin page
export const AdminContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <main className={`p-4 sm:p-6 ${className}`}>{children}</main>;
};
