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
  onOpenColleagues?: () => void;
}

export function WorkspaceSidebar({ logs, fellowInterns, onOpenColleagues }: WorkspaceSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-28 h-fit pb-12">
      {/* Recent Activity Feed */}
      <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <History size={16} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        </div>

        <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
          {(logs || []).slice(0, 5).map((log) => (
            <div key={log.id} className="relative pl-10 group cursor-pointer">
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-blue-600 transition-colors shadow-sm">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   log.status === "approved" ? "bg-emerald-500" : "bg-amber-500"
                 )} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 mb-0.5 line-clamp-2 leading-snug">
                  {log.learning_log}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                    {format(new Date(log.log_date), "MMM dd")}
                  </span>
                  <span className={cn(
                    "text-[8px] font-bold uppercase",
                    log.status === "approved" ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {log.status === "approved" ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {(logs || []).length === 0 && (
            <div className="text-center py-8">
              <AlertCircle size={20} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No activity yet</p>
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
