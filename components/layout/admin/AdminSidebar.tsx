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
} from "lucide-react";
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
        className={`fixed left-0 w-72 bg-white border-r border-slate-100 z-40 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 shadow-2xl shadow-slate-200/50" : "-translate-x-full"}
          top-20 
          h-[calc(100vh-5rem)]
        `}
      >
        <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {group.title}
              </h3>
              <nav className="space-y-1">
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
                      className={`group relative flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon
                          size={18}
                          className={isActive ? "text-white" : "text-slate-400 group-hover:text-primary transition-colors"}
                        />
                        <span>{link.label}</span>
                      </div>
                      
                      {link.badge && !isActive && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-600 rounded-md">
                          {link.badge}
                        </span>
                      )}
                      
                      {isActive && (
                        <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full opacity-50" />
                      )}

                      {!isActive && (
                         <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Pro Invite Banner */}
        <div className="p-4 m-4 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
          <div className="relative z-10">
             <p className="text-xs font-bold text-indigo-400 mb-1">PRO PLAN</p>
             <p className="text-[11px] text-slate-300 leading-relaxed mb-3">Unlock advanced analytics and AI candidate matching.</p>
             <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-colors">
               Upgrade Now
             </button>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all" />
        </div>
      </aside>
    </>
  );
};

