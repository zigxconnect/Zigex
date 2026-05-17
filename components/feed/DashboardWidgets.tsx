// components/feed/DashboardWidgets.tsx
"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Clock,
  ArrowUpRight,
  Target,
  Zap,
  Activity,
  Terminal,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WidgetProps {
  user: any;
  workspaces?: any[];
}

export function DashboardWidgets({ user, workspaces }: WidgetProps) {
  return (
    <div className="hidden xl:flex flex-col gap-5 w-72 shrink-0 sticky top-20 h-fit pb-8">
      
      {/* Profile Strength */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
             <h3 className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">Stability</h3>
             <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Profile Progress</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#155DFC]">
            <Target size={18} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">72</span>
              <span className="text-sm font-bold text-slate-400">%</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wide">Intermediate</span>
          </div>
          
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.2, ease: "circOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#155DFC] to-blue-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] w-1/2 animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Enhance your <span className="text-[#155DFC] font-bold">Expertise Rating</span> by finalizing your project showcase.
          </p>

          <Link 
            href="/profile"
            className="w-full h-10 bg-slate-50 dark:bg-slate-800 hover:bg-[#155DFC] hover:text-white text-[#155DFC] rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group/btn"
          >
            <span>Finalize Profile</span>
            <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Your Workspaces */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
             <h3 className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">Feed</h3>
             <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Your Workspaces</p>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[#155DFC]">
            <Briefcase size={16} />
          </div>
        </div>

        <div className="space-y-4">
          {(workspaces || []).map((workspace: any) => (
            <Link 
              key={workspace.id} 
              href={`/intern/workspace/${workspace.type}/${encodeURIComponent(workspace.title || 'workspace')}?appId=${workspace.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shrink-0 shadow-sm">
                <img 
                  src={workspace.logo_url || "/logo.png"}
                  alt={workspace.company_name || "Company"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#155DFC] transition-colors">
                  {workspace.title}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">
                  {workspace.company_name}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-[#155DFC] group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
          
          {(workspaces || []).length === 0 && (
            <div className="text-center py-6">
              <Activity size={20} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No active workspaces</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Zila terminal */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "circOut", delay: 0.2 }}
        className="relative overflow-hidden bg-[#155DFC] rounded-2xl p-5 text-white group cursor-pointer shadow-lg shadow-blue-500/20"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-white rounded-full blur-[70px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400 rounded-full blur-[40px] opacity-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white blur-lg opacity-20" />
              <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Terminal size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-extrabold tracking-tight leading-none mb-0.5">Zila terminal</h4>
              <p className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.15em] opacity-80">Coming Soon</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[11px] font-medium text-blue-50 leading-relaxed italic">
              "An AI agent in the terminal coming soon. Prepare for the next level of developer productivity."
            </p>
          </div>

          <div 
            className="flex items-center justify-between h-10 px-4 bg-white text-[#155DFC] rounded-xl transition-all duration-300 shadow-md opacity-60 cursor-not-allowed"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">Early Access</span>
            <ArrowUpRight size={16} className="opacity-50" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
