"use client";

import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { useAdminSidebar } from "./AdminLayoutProvider";
import { Logo } from "@/components/uiComponent/Logo";

type AdminHeaderProps = {
  stats: {
    total: number;
    active: number;
    applications: number;
  };
};

export const AdminHeader = ({ stats }: AdminHeaderProps) => {
  const { toggleSidebar } = useAdminSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 p-4 lg:px-6 h-20">
        {/* Left Side: Menu Toggle (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Logo is now always visible */}
          <Logo />
        </div>

        {/* Center: Stats (Hidden on screens smaller than 'md') */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800">{stats.total}</p>
            <p className="text-xs">Total Postings</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-green-600">{stats.active}</p>
            <p className="text-xs">Active</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800">
              {stats.applications}
            </p>
            <p className="text-xs">Applications</p>
          </div>
        </div>

        {/* Right Side: Action Button */}
        <div className="flex-shrink-0">
          <Link href="/admin/postings/new" passHref>
            <Button variant="orange" className="flex items-center gap-2">
              <Plus size={18} />
              {/* Responsive Text: Shows full text on 'sm' screens and up */}
              <span className="hidden sm:inline">Post New Program</span>
              {/* Shows shorter text on screens smaller than 'sm' */}
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
