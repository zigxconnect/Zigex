// components/feed/DashboardWidgets.tsx
"use client";

import { useState } from "react";
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
  Briefcase,
  Search
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WidgetProps {
  user: any | null;
  workspaces?: any[];
}

export function DashboardWidgets({ user, workspaces }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // For unauthenticated visitors, show a conversion widget instead of the
  // profile/workspaces panel that requires user data.
  if (!user) {
    return (
      <div className="hidden xl:flex flex-col gap-5 w-72 shrink-0 sticky top-20 h-fit pb-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm overflow-hidden relative"
        >
          {/* Decorative background */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#155DFC]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#155DFC]/10 flex items-center justify-center">
              <Zap size={22} className="text-[#155DFC]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                Join Zigex
              </h3>
              <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                Create a free account to track applications, build your profile, and unlock smart-apply.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href="/feed"
                className="w-full h-10 bg-[#155DFC] hover:bg-[#0D47A1] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Get Started — It&apos;s Free
                <ChevronRight size={14} />
              </Link>
              <Link
                href="/sign-in"
                className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            <p className="text-[9px] font-semibold text-muted-foreground text-center uppercase tracking-wide pt-1">
              Join 3,000+ students on Zigex
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredWorkspaces = [...(workspaces || [])]
    .reverse()
    .filter((workspace: any) => {
      const q = searchQuery.toLowerCase();
      return (
        workspace.title?.toLowerCase().includes(q) ||
        workspace.company_name?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="hidden xl:flex flex-col gap-5 w-72 shrink-0 sticky top-20 h-fit pb-8">

      {/* Profile Strength */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="group bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-bold text-[#155DFC] dark:text-slate-300 uppercase tracking-wider">Stability</h3>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Profile Progress</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#155DFC] dark:text-slate-300">
            <Target size={18} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">72</span>
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wide">Intermediate</span>
          </div>

          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.2, ease: "circOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#155DFC] to-blue-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] w-1/2 animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>

          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            Enhance your <span className="text-[#155DFC] dark:text-slate-300 font-bold">Expertise Rating</span> by finalizing your project showcase.
          </p>

          <Link
            href="/profile"
            className="w-full h-10 bg-muted hover:bg-[#155DFC] dark:hover:bg-slate-300 hover:text-white dark:hover:text-slate-900 text-[#155DFC] dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group/btn"
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
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-bold text-[#155DFC] dark:text-slate-300 uppercase tracking-wider">Feed</h3>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Your Workspaces</p>
          </div>
          <div className="p-2 bg-muted rounded-lg text-[#155DFC] dark:text-slate-300">
            <Briefcase size={16} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-muted/50 text-[11px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#155DFC] transition-all"
          />
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {filteredWorkspaces.map((workspace: any) => (
            <Link
              key={workspace.id}
              href={`/intern/workspace/${workspace.type}/${encodeURIComponent(workspace.title || 'workspace')}?appId=${workspace.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all group cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-card shrink-0 shadow-sm">
                <img
                  src={workspace.logo_url || "/logo.png"}
                  alt={workspace.company_name || "Company"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-foreground truncate group-hover:text-[#155DFC] dark:group-hover:text-slate-300 transition-colors">
                  {workspace.title}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                  {workspace.company_name}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-[#155DFC] dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-6">
              <Activity size={20} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {searchQuery ? "No workspaces found" : "No active workspaces"}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Zila terminal */}

    </div>
  );
}
