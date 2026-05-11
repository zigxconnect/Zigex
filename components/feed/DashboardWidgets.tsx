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
  Terminal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WidgetProps {
  user: any;
}

export function DashboardWidgets({ user }: WidgetProps) {
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

      {/* Upcoming Events */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
             <h3 className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">Agenda</h3>
             <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Timeline View</p>
          </div>
          <Link href="/events" className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-[#155DFC] hover:text-white transition-all duration-300 text-slate-400">
            <Activity size={16} />
          </Link>
        </div>

        <div className="space-y-2">
          {[
            { title: "UI/UX Design Workshop", date: "Today", time: "2:00 PM", icon: Zap, accent: "text-amber-500 bg-amber-500/10" },
            { title: "Career Networking Fair", date: "Tomorrow", time: "10:00 AM", icon: Target, accent: "text-blue-500 bg-blue-500/10" },
            { title: "AI in Product Mgmt", date: "Oct 24", time: "4:30 PM", icon: Zap, accent: "text-purple-500 bg-purple-500/10" }
          ].map((event, i) => (
            <div key={i} className="group cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
              <div className={cn("shrink-0 w-9 h-9 rounded-xl flex items-center justify-center", event.accent)}>
                <event.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#155DFC] transition-colors leading-none mb-1.5">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Clock size={9} className="text-slate-400" />
                    <span className="text-[9px] font-semibold text-slate-400">{event.time}</span>
                  </div>
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[9px] font-bold text-[#155DFC]">{event.date}</span>
                </div>
              </div>
            </div>
          ))}
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
