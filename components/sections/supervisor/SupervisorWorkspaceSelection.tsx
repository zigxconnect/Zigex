"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  ArrowUpRight,
  Search,
  Users,
  GraduationCap,
  LayoutGrid,
  Calendar,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WorkspaceSlot {
  id: string;
  type: "internship" | "program";
  title: string;
  location: string | null;
  company: { id: string; name: string; logo: string | null } | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  internCount: number;
}

interface SupervisorWorkspaceSelectionProps {
  workspaces: WorkspaceSlot[];
  supervisorName: string;
}

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}> = {
  internship: {
    label: "Internship",
    icon: Briefcase,
    gradient: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  program: {
    label: "Program",
    icon: GraduationCap,
    gradient: "from-violet-600 to-purple-600",
    badgeBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    dotColor: "bg-violet-500",
  },
};

type FilterType = "all" | "internship" | "program";

export function SupervisorWorkspaceSelection({
  workspaces,
  supervisorName,
}: SupervisorWorkspaceSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const totalInterns = workspaces.reduce((sum, w) => sum + w.internCount, 0);

  // Derive available filter types from actual data
  const availableTypes = useMemo(() => {
    const types = new Set(workspaces.map((w) => w.type));
    return Array.from(types) as FilterType[];
  }, [workspaces]);

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((ws) => {
      const matchesFilter = activeFilter === "all" || ws.type === activeFilter;
      const matchesSearch =
        !searchQuery ||
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ws.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [workspaces, activeFilter, searchQuery]);

  const filters: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All Spaces", icon: LayoutGrid },
    ...availableTypes.map((t) => ({
      key: t,
      label: TYPE_CONFIG[t]?.label + "s" || t,
      icon: TYPE_CONFIG[t]?.icon || Briefcase,
    })),
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Ambient background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/[0.03] dark:bg-blue-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/[0.03] dark:bg-violet-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC] animate-pulse" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#155DFC] bg-blue-50/60 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
              Supervisor Portal
            </span>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {supervisorName?.split(" ")[0]} 👋
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
                Select a workspace below to manage your assigned interns. Each workspace is isolated — data stays within its scope.
              </p>
            </div>

            {/* Stats Pill */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#155DFC]" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {workspaces.length} Space{workspaces.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {totalInterns} Intern{totalInterns !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5"
        >
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
            />
          </div>

          {availableTypes.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide transition-all duration-200 border",
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <Icon size={11} />
                    {filter.label}
                  </button>
                );
              })}
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 ml-1.5">
                {filteredWorkspaces.length} of {workspaces.length}
              </span>
            </div>
          )}
        </motion.div>

        {/* Workspace Cards */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredWorkspaces.map((ws, idx) => {
              const config = TYPE_CONFIG[ws.type] || TYPE_CONFIG.internship;
              const TypeIcon = config.icon;

              return (
                <motion.div
                  key={ws.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                >
                  <Link
                    href={`/supervisor/workspace/${ws.id}`}
                    className="group block"
                  >
                    <div className="relative flex items-center gap-4 px-4 py-4 sm:py-4.5 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/[0.06] transition-all duration-300">
                      {/* Active indicator */}
                      <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300", config.dotColor)} />

                      {/* Company Logo */}
                      <div className="relative w-12 h-12 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 overflow-hidden flex items-center justify-center group-hover:scale-[1.04] transition-transform duration-300">
                        {ws.company?.logo ? (
                          <Image
                            src={ws.company.logo}
                            alt={ws.company.name || ""}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Label + Badge row */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded",
                              config.badgeBg,
                              config.badgeText
                            )}
                          >
                            <TypeIcon size={9} />
                            {config.label}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-600 tracking-wide flex items-center gap-1">
                            <Users size={9} />
                            {ws.internCount} intern{ws.internCount !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {ws.title}
                        </h3>

                        {/* Company & Location */}
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <Building2 size={9} className="shrink-0 text-slate-400" />
                            {ws.company?.name || "Confidential"}
                          </span>
                          {ws.location && (
                            <span className="hidden sm:flex text-[10px] font-medium text-slate-400 dark:text-slate-500 items-center gap-1">
                              <MapPin size={9} className="shrink-0" />
                              {ws.location}
                            </span>
                          )}
                          {ws.startDate && (
                            <span className="hidden sm:flex text-[10px] font-medium text-slate-400 dark:text-slate-500 items-center gap-1">
                              <Calendar size={9} className="shrink-0" />
                              {new Date(ws.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter Arrow */}
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-[#155DFC] group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                          <ArrowUpRight
                            size={15}
                            strokeWidth={2.5}
                            className="group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredWorkspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No workspaces match your search
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/50"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 tracking-wide">
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} • {totalInterns} total intern{totalInterns !== 1 ? "s" : ""}
            </p>
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Return to Feed
              <ChevronRight size={11} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
