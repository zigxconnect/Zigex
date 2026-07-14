"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  ArrowUpRight,
  Search,
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Ticket,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InternshipSelectionProps {
  internships: any[];
}

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}> = {
  internship: {
    label: "Internship",
    icon: Briefcase,
    gradient: "from-blue-600 to-indigo-600",
    accentColor: "text-blue-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  program: {
    label: "Program",
    icon: GraduationCap,
    gradient: "from-violet-600 to-purple-600",
    accentColor: "text-violet-600",
    badgeBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    dotColor: "bg-violet-500",
  },
  event: {
    label: "Event",
    icon: Ticket,
    gradient: "from-emerald-600 to-teal-600",
    accentColor: "text-emerald-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
};

type FilterType = "all" | "internship" | "program" | "event";

export function InternWorkspaceSelection({ internships }: InternshipSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const currentYear = new Date().getFullYear();

  // Derive available filter types from actual data
  const availableTypes = useMemo(() => {
    const types = new Set(internships.map(a => (a.application_type || "internship").toLowerCase()));
    return Array.from(types) as FilterType[];
  }, [internships]);

  // Filter and search logic
  const filteredPlacements = useMemo(() => {
    return internships.filter((app) => {
      const type = (app.application_type || "internship").toLowerCase();
      const isProgram = type === "program";
      const isEvent = type === "event";
      const opportunity = isProgram ? app.programs : isEvent ? app.event : app.internships;
      const title = (opportunity?.title || "").toLowerCase();
      const company = (opportunity?.company_profiles?.company_name || "").toLowerCase();

      const matchesFilter = activeFilter === "all" || type === activeFilter;
      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery.toLowerCase()) ||
        company.includes(searchQuery.toLowerCase()) ||
        type.includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [internships, activeFilter, searchQuery]);

  const filters: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All", icon: LayoutGrid },
    ...availableTypes.map((t) => ({
      key: t,
      label: TYPE_CONFIG[t]?.label || t,
      icon: TYPE_CONFIG[t]?.icon || Briefcase,
    })),
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/[0.03] dark:bg-blue-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/[0.03] dark:bg-violet-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <LayoutDashboard size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Your Workspaces
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            Select an active placement below to enter your dedicated workspace environment.
          </p>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5"
        >
          {/* Search Input */}
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by name, company, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
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
                {filteredPlacements.length} of {internships.length}
              </span>
            </div>
          )}
        </motion.div>

        {/* Placement Cards */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredPlacements.map((app, idx) => {
              const type = (app.application_type || "internship").toLowerCase();
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.internship;
              const isProgram = type === "program";
              const isEvent = type === "event";

              const opportunity = isProgram
                ? app.programs
                : isEvent
                  ? app.event
                  : app.internships;
              const company = opportunity?.company_profiles;
              const slug = (opportunity?.title || "mission")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

              const TypeIcon = config.icon;

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                >
                  <Link
                    href={`/student/workspace/${type}/${slug}?appId=${app.id}`}
                    className="group block"
                  >
                    <div className="relative flex items-center gap-3.5 px-4 py-3 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/[0.04] transition-all duration-300">
                      {/* Type indicator dot */}
                      <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300", config.dotColor)} />

                      {/* Company Logo */}
                      <div className="relative w-10 h-10 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 overflow-hidden flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300">
                        {company?.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.company_name || ""}
                            fill
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-0.5">
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
                            <Calendar size={8} />
                            {currentYear}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {opportunity?.title || "Professional Mission"}
                        </h3>

                        {/* Company & Location */}
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <Building2 size={9} className="shrink-0 text-slate-400" />
                            {company?.company_name || "Confidential"}
                          </span>
                          {opportunity?.location && (
                            <span className="hidden sm:flex text-[10px] font-medium text-slate-400 dark:text-slate-500 items-center gap-1">
                              <MapPin size={9} className="shrink-0" />
                              {opportunity.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter Arrow */}
                      <div className="shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                          <ArrowUpRight
                            size={14}
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
          {filteredPlacements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search size={18} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No placements match your search
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
              {internships.length} active placement{internships.length !== 1 ? "s" : ""}
            </p>
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Browse opportunities
              <ChevronRight size={11} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
