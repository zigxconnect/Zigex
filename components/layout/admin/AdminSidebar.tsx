"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  CheckCheck,
  FilePen,
  LayoutDashboard,
  Calendar,
  Briefcase,
  TrendingUp,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useAdminSidebar } from "./AdminLayoutProvider";

// Define the type for the company profile
export interface CompanyProfile {
  id: string;
  company_name: string;
  industry?: string;
  logo_url?: string;
}

// Grouped navigation links
const navigationGroups = [
  {
    title: "Overview",
    links: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/analytics", icon: TrendingUp, label: "Analytics", badge: "New" },
    ],
  },
  {
    title: "Management",
    links: [
      { href: "/admin/postings", icon: Briefcase, label: "Postings" },
      { href: "/admin/applicants", icon: Users, label: "Applicants" },
      { href: "/admin/interns", icon: GraduationCap, label: "Interns", badge: "New" },
      { href: "/admin/accepted", icon: CheckCheck, label: "Hires" },
      { href: "/admin/programs/content", icon: BookOpen, label: "Content" },
    ],
  },

  {
    title: "Organization",
    links: [
      { href: "/admin/calendar", icon: Calendar, label: "Schedules" },
      { href: "/admin/profile", icon: FilePen, label: "Settings" },
    ],
  },
];

export const AdminSidebar = ({
  companyProfile,
}: {
  companyProfile: CompanyProfile;
}) => {
  const { isOpen, isMobile, toggleSidebar } = useAdminSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 w-72 bg-white/70 backdrop-blur-xl border-r border-indigo-100/50 z-40 flex flex-col transition-all duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"}
          top-20 
          h-[calc(100vh-5rem)]
        `}
      >
        <div className="flex-1 px-4 py-8 space-y-10 overflow-y-auto custom-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className={cn(
                "px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-opacity duration-300",
                !isOpen && "lg:opacity-0"
              )}>
                {group.title}
              </h3>
              <nav className="space-y-1.5">
                {group.links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/admin/dashboard" &&
                      pathname.startsWith(link.href));
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => isMobile && toggleSidebar()}
                      className={cn(
                        "group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] text-sm font-bold transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300",
                        isActive ? "bg-white/20" : "bg-slate-50 group-hover:bg-primary/10"
                      )}>
                        <link.icon
                          size={18}
                          className={isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}
                        />
                      </div>
                      
                      <span className={cn(
                        "transition-all duration-300",
                        !isOpen && "lg:opacity-0 lg:absolute lg:left-20"
                      )}>
                        {link.label}
                      </span>
                      
                      {link.badge && !isActive && isOpen && (
                        <span className="ml-auto px-1.5 py-0.5 text-[8px] font-black bg-primary/10 text-primary rounded-md uppercase tracking-wider">
                          {link.badge}
                        </span>
                      )}
                      
                      {isActive && isOpen && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="ml-auto"
                        >
                          <ChevronRight size={14} className="text-white/70" />
                        </motion.div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Pro Invite Banner */}
        <div className={cn(
          "p-5 m-4 rounded-[2rem] bg-slate-900 border border-slate-800 text-white relative overflow-hidden group transition-all duration-500",
          !isOpen && "lg:p-2 lg:m-2"
        )}>
          <div className={cn("relative z-10 transition-all duration-500", !isOpen && "lg:rotate-90 lg:my-8")}>
             <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-amber-400" />
                <p className={cn("text-[10px] font-black text-amber-400 tracking-widest uppercase", !isOpen && "lg:hidden")}>PRO Access</p>
             </div>
             {isOpen && (
                <>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-4">Master recruitment with AI matching.</p>
                  <button className="w-full py-2.5 bg-white text-slate-900 text-xs font-black rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                    Upgrade
                  </button>
                </>
             )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/40 transition-all duration-700" />
        </div>
      </aside>
    </>
  );
};

