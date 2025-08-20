"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/app/_components/ui/Logo";
import { Button } from "@/app/_components/ui/Button";
import {
  Menu,
  X,
  FileText,
  Users,
  FileEdit,
  CheckCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

const companyData = {
  name: "TechCorp Bamenda",
  industry: "Technology Solutions",
  initials: "TC",
  description:
    "Leading technology company specializing in software development and digital solutions for businesses across Cameroon.",
};

const navLinks = [
  { href: "/admin/postings", icon: FileText, label: "Internship Postings" },
  { href: "/admin/applicants", icon: Users, label: "Applicants" },
  { href: "/admin/drafts", icon: FileEdit, label: "Draft Internships" },
  { href: "/admin/accepted", icon: CheckCheck, label: "Accepted Interns" },
];

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Note: Your original code for managing body margin can have side effects in Next.js 14.
  // The recommended approach is to use a layout component that adds margin to the main content,
  // similar to our student dashboard layout. For now, I have kept your logic but commented it out.

  // const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // This is the logout function you provided.
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Redirect to the homepage after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Logo />
          <button
            onClick={closeSidebar}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Company Profile Section */}
        <div className="flex flex-col items-center p-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-800 text-2xl font-bold shadow-sm ring-4 ring-white">
              {companyData.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {companyData.name}
          </h2>
          <p className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full mt-1">
            {companyData.industry}
          </p>
          <p className="mt-3 text-xs text-gray-600 leading-relaxed max-w-xs">
            {companyData.description}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeSidebar}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                // Add your active link logic here if needed
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon
                size={20}
                className="text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
              />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
          <Link
            href="/admin/fupro-ai"
            onClick={closeSidebar}
            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-800 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-orange-200"
          >
            <div className="flex items-center gap-3">
              <Sparkles
                size={20}
                className="text-orange-600 group-hover:text-orange-700"
              />
              <span className="font-medium">FuproAI</span>
            </div>
            <span className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 rounded-full shadow-sm animate-pulse">
              NEW
            </span>
          </Link>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="secondary"
            className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent transition-all duration-200"
            onClick={handleSignOut} // The button now calls the logout function
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
