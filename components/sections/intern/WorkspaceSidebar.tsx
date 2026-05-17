"use client";

import React from "react";
import { 
  History,
  ChevronRight, 
  AlertCircle,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils";

interface WorkspaceSidebarProps {
  logs: any[];
  fellowInterns: any[];
  userWorkspaces?: any[];
  onOpenColleagues?: () => void;
}

export function WorkspaceSidebar({ logs, fellowInterns, userWorkspaces, onOpenColleagues }: WorkspaceSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-28 h-fit pb-12">
      {/* Your Workspaces Feed */}
      <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <History size={16} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your Workspaces</h3>
        </div>

        <div className="space-y-4">
          {(userWorkspaces || []).map((workspace) => (
            <a 
              key={workspace.id} 
              href={`/intern/workspace/${workspace.type}/${encodeURIComponent(workspace.title || 'workspace')}?appId=${workspace.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <Image 
                  src={normalizeImageSrc(workspace.logo_url, "/logo.png")}
                  alt={workspace.company_name || "Company"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                  {workspace.title}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">
                  {workspace.company_name}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
          
          {(userWorkspaces || []).length === 0 && (
            <div className="text-center py-8">
              <AlertCircle size={20} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No workspaces</p>
            </div>
          )}
        </div>
      </section>

      {/* Fellow Interns - Stacked Avatars */}
      <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users size={16} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Fellow Interns</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <div className="flex -space-x-3 overflow-hidden">
              {fellowInterns.slice(0, 5).map((intern, i) => (
                <div 
                  key={intern.id || i}
                  className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-950 overflow-hidden bg-slate-100 shadow-sm transition-transform hover:translate-y-[-2px] hover:z-20"
                >
                  <Image 
                    src={normalizeImageSrc(intern.avatar_url, "/logo.png")} 
                    alt={intern.full_name || "Intern"} 
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {fellowInterns.length > 5 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white dark:ring-slate-950 text-[10px] font-bold text-white shadow-sm">
                  +{fellowInterns.length - 5}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Connect with {fellowInterns.length} other members
            </p>
            <button 
              onClick={onOpenColleagues}
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest cursor-pointer flex items-center gap-1 group"
            >
              Network Explorer <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
