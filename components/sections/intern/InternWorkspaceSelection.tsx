"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  ChevronRight, 
  MapPin, 
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Layout,
  Globe,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InternshipSelectionProps {
  internships: any[];
}

export function InternWorkspaceSelection({ internships }: InternshipSelectionProps) {
  return (
    <div className="min-h-screen bg-[#F6F8FF] dark:bg-black relative overflow-hidden flex flex-col items-center justify-center py-12 px-4">
      {/* Immersive Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-600/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 dark:bg-indigo-600/5 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-5xl w-full mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#155DFC] animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Multi-Mission Interface
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Select Your <span className="text-[#155DFC]">Workspace</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm max-w-lg mx-auto tracking-normal opacity-80">
              Multiple placements identified. Choose your operational environment to proceed with the mission.
            </p>
          </motion.div>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((app, idx) => {
            const company = app.internships?.company_profiles;
            const internship = app.internships;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link 
                  href={`/intern/workspace?appId=${app.id}`}
                  className="group block relative"
                >
                  <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#155DFC] transition-all duration-400 hover:-translate-y-2 overflow-hidden">
                    
                    {/* Decorative Background Icon */}
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 translate-x-1/4 -translate-y-1/4">
                      <Layout size={150} />
                    </div>

                    {/* Company Brand */}
                    <div className="relative z-10 flex flex-col items-center text-center mb-8">
                      <div className="relative w-20 h-20 rounded-3xl bg-[#F6F8FF] dark:bg-slate-800 border border-slate-50 dark:border-slate-700 overflow-hidden flex items-center justify-center p-3 shadow-md mb-5 group-hover:scale-105 transition-all duration-400">
                        {company?.logo_url ? (
                          <Image 
                            src={company.logo_url} 
                            alt={company.company_name}
                            fill
                            className="object-contain p-3"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#155DFC] text-[9px] font-bold tracking-tight mb-4 border border-blue-100/50 dark:border-blue-800/50">
                         Active Protocol
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1.5 tracking-tight group-hover:text-[#155DFC] transition-colors">
                        {company?.company_name || "Confidential Corp"}
                      </h2>
                      
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold text-[9px] tracking-wide">
                        <Globe size={10} className="text-[#155DFC]" />
                        {internship?.location || "Remote Deployment"}
                      </div>
                    </div>

                    {/* Program Meta */}
                    <div className="relative z-10 space-y-3 mb-8">
                      <div className="p-4 rounded-2xl bg-[#F6F8FF] dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-1.5">
                           <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                             <Briefcase size={14} className="text-[#155DFC]" />
                           </div>
                           <p className="text-[9px] font-bold text-slate-400 tracking-wider">Designation</p>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug pl-11">
                           {internship?.title}
                        </p>
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="relative z-10 flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">Access Granted</span>
                      </div>
                      <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white text-[10px] tracking-wider transition-all duration-300 group-hover:gap-4">
                        Enter Mission
                        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#155DFC] text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Support Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 dark:text-slate-600 text-[9px] font-bold tracking-[0.2em] mb-3">
            Deployment Assistance Required?
          </p>
          <Link 
            href="/support"
            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-[10px] tracking-wider hover:text-[#155DFC] transition-colors"
          >
            Contact Command Center
            <ChevronRight size={12} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Helper Badge component if not imported from elsewhere or to ensure local style
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      {children}
    </div>
  );
}
