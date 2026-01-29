"use client";

import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Plus, 
  Search, 
  Bell, 
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAdminSidebar } from "./AdminLayoutProvider";
import { Logo } from "@/components/layout/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AdminHeaderProps = {
  stats: {
    total: number;
    active: number;
    applications: number;
  };
  companyProfile?: {
    company_name: string;
    logo_url?: string;
  };
};

export const AdminHeader = ({ stats, companyProfile }: AdminHeaderProps) => {
  const { toggleSidebar } = useAdminSidebar();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/");
      router.refresh();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100/50 h-20">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left Section: Logo & Toggle */}
        <div className="flex items-center gap-4 lg:w-72">
          <button
            onClick={toggleSidebar}
            className="p-2.5 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all lg:hidden active:scale-90"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <Link href="/admin/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="w-9 h-9 lg:w-11 lg:h-11 shadow-lg shadow-primary/10 rounded-xl overflow-hidden p-0.5 bg-white">
              <Logo />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight hidden sm:block text-slate-900">
              Zigex<span className="text-primary italic font-black">Admin</span>
            </span>
          </Link>
        </div>

        {/* Center Section: Search & Stats */}
        <div className="flex-1 flex justify-center max-w-2xl px-4">
          <div className="relative w-full group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search applications, postings, or candidates..." 
              className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-8 ml-8 text-sm border-l border-slate-200 pl-8 hidden lg:flex">
             <div className="flex flex-col">
               <span className="text-xs text-slate-400 font-medium">Active</span>
               <span className="font-bold text-emerald-600">{stats.active}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-slate-400 font-medium">Apps</span>
               <span className="font-bold text-slate-900">{stats.applications}</span>
             </div>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/admin/postings/new" className="hidden sm:block">
            <Button className="rounded-xl h-10 px-5 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus size={18} />
              <span className="font-medium text-xs lg:text-sm">Post New</span>
            </Button>
          </Link>

          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-all outline-none">
                <Avatar className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm">
                  <AvatarImage src={companyProfile?.logo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {companyProfile?.company_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-slate-100 animate-in fade-in zoom-in-95">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{companyProfile?.company_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <div className="p-1">
                <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer">
                  <User size={16} className="text-slate-400" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer">
                  <Settings size={16} className="text-slate-400" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">PRO FEATURES</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-slate-100" />
              <div className="p-1">
                <DropdownMenuItem onClick={handleSignOut} className="rounded-lg h-9 gap-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer">
                  <LogOut size={16} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

