"use client";

import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell } from "lucide-react";
import Link from "next/link";
import { useAdminSidebar } from "./AdminLayoutProvider";
import { Logo } from "@/components/uiComponent/Logo";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-30 w-full">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-gray-100/50 lg:hidden" />
      
      <div className="relative flex items-center justify-between gap-4 p-4 lg:px-8 h-20">
        {/* Left Side: Menu Toggle (Mobile) + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Logo is visible on mobile, hidden on desktop as it's in sidebar/layout */}
          <div className="lg:hidden">
            <Logo />
          </div>
          
          {/* Desktop Title/Breadcrumb could go here */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Welcome back to your dashboard
            </p>
          </div>
        </div>

        {/* Right Side: Stats & Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick Stats - Hidden on small mobile */}
          <div className="hidden md:flex items-center gap-6 mr-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Jobs</span>
              <span className="text-lg font-bold text-gray-900 leading-none">{stats.active}</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Apps</span>
              <span className="text-lg font-bold text-gray-900 leading-none">{stats.applications}</span>
            </div>
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100/50">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <Link href="/admin/postings/new" passHref>
            <Button 
              className="h-11 px-6 rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300"
            >
              <Plus size={18} className="mr-2" />
              <span className="font-medium">Post Job</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
