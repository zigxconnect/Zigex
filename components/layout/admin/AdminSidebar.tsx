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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSidebar } from "./AdminLayoutProvider";

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
  { href: "/admin/applicants", icon: Users, label: "Applicants" },
  { href: "/admin/accepted", icon: CheckCheck, label: "Accepted Interns" },
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
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 w-72 bg-sidebar shadow-lg border-r border-sidebar-border z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          top-20 
          h-[calc(100vh-5rem)]
        `}
      >
        {/* Company Profile Section */}
        <div className="p-5 text-center border-b border-sidebar-border">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-sidebar shadow-inner">
              { companyProfile.logo_url ? (
                <img src={companyProfile.logo_url} alt="Company Logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(companyProfile.company_name)
              )}
            </div>
          </div>
          <h2 className="mt-3 text-lg font-bold text-sidebar-foreground truncate">
            {companyProfile.company_name}
          </h2>
          {companyProfile.industry && (
            <p className="text-sm font-medium text-primary">
              {companyProfile.industry}
            </p>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin/dashboard" &&
                pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <link.icon
                  size={18}
                  className={
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary"
                  }
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Sign Out Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
