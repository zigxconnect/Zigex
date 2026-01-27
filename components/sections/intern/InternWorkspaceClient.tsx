"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Layout, 
  MessageSquare, 
  Trophy, 
  User, 
  Video,
  ExternalLink,
  Shield,
  Lock,
  Download,
  AlertCircle,
  Plus,
  Mail,
  Linkedin,
  ArrowRight,
  Star,
  ChevronRight,
  CreditCard,
  Target,
  Layers
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyReportModal } from "./DailyReportModal";

interface InternWorkspaceClientProps {
  data: {
    application: any;
    curriculum: any[];
    logs: any[];
    tasks: any[];
    notes: any[];
  };
}

const tabs = [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
];

export function InternWorkspaceClient({ data }: InternWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const { application, curriculum, logs } = data;
  const internship = application?.internships;
  const company = internship?.company_profiles;
  const supervisor = application?.supervisor_profiles;

  const isPaid = application?.payment_ledger?.length > 0;
  const progressPercent = Math.min(Math.round((logs.length / 30) * 100), 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Daily Report Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <DailyReportModal 
            isOpen={isLogModalOpen} 
            onClose={() => setIsLogModalOpen(false)} 
            internshipId={application.internship_id}
          />
        )}
      </AnimatePresence>

      {/* ===== HEADER ===== */}
      <header className="relative bg-white dark:bg-slate-900 border-b border-blue-100/50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          
          {/* Mobile: Stacked Layout */}
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Logo + Badge */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-[2px] shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  {company?.logo_url ? (
                    <Image src={company.logo_url} alt={company.company_name} width={64} height={64} className="object-cover" />
                  ) : (
                    <Shield size={24} className="text-blue-600" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600 text-white border-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {internship?.type || "Internship"}
                  </Badge>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {internship?.title || "Professional Internship"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                  {company?.company_name} • {application?.duration}
                </p>
              </div>
            </div>

            {/* Action Buttons - Full Width on Mobile */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none rounded-xl border-blue-100 dark:border-slate-700 font-semibold text-xs h-11 px-4 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
              >
                <Download size={14} className="mr-2" />
                Logbook
              </Button>
              <Button 
                onClick={() => setIsLogModalOpen(true)}
                className="flex-1 sm:flex-none rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11 px-4 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Plus size={14} className="mr-2" />
                Daily Log
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NAVIGATION TABS ===== */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-blue-50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto hide-scrollbar custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon size={16} className={cn(isActive && "text-blue-600")} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Progress Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 p-5 sm:p-8 text-white">
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Internship Progress</p>
                        <h3 className="text-xl sm:text-2xl font-bold">Keep up the great work!</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-3xl sm:text-4xl font-bold">{progressPercent}%</p>
                          <p className="text-xs text-blue-200 font-medium">{logs.length}/30 days</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                  {/* Decorative */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Duration", value: application?.duration || "N/A", icon: Calendar },
                    { label: "Daily Logs", value: logs.length.toString(), icon: FileText },
                    { label: "Domain", value: application?.domain || "General", icon: Layers },
                    { label: "Level", value: application?.experience_level || "Entry", icon: Target },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
                      <stat.icon size={18} className="text-blue-600 mb-3" />
                      <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Two Column: Description + Supervisor */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Description */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About This Internship</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {internship?.description || "This internship provides hands-on experience in your chosen field, allowing you to develop practical skills while working alongside industry professionals."}
                    </p>
                  </div>

                  {/* Supervisor Card */}
                  <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">Your Supervisor</p>
                    {supervisor ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-blue-100 dark:ring-slate-700">
                            <Image 
                              src={supervisor.avatar_url || "/default-avatar.svg"} 
                              alt={supervisor.full_name} 
                              width={48} 
                              height={48} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">{supervisor.full_name}</h4>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none mt-1">Lead Supervisor</p>
                          </div>
                        </div>
                        {supervisor.field_expertise?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {supervisor.field_expertise.map((field: string, i: number) => (
                              <Badge key={i} className="bg-blue-50 text-blue-600 border-0 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-blue-100 pl-3">
                          "{supervisor.bio || "Available for guidance and feedback."}"
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm" 
                            className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider border-blue-50 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                          >
                            <a href={`mailto:${supervisor.email}`}><Mail size={12} className="mr-1.5" /> Email</a>
                          </Button>
                          {supervisor.whatsapp && (
                            <Button 
                              asChild
                              variant="outline" 
                              size="sm" 
                              className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider border-green-50 hover:bg-green-50 hover:text-green-600 transition-all shadow-sm"
                            >
                              <a href={`https://wa.me/${supervisor.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <MessageSquare size={12} className="mr-1.5" /> WhatsApp
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <User size={24} />
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">Awaiting Assignment</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding Checklist */}
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Onboarding Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Payment Confirmed", done: isPaid },
                      { label: "Supervisor Assigned", done: !!supervisor },
                      { label: "First Log Submitted", done: logs.length > 0 },
                    ].map((item, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-colors",
                        item.done 
                          ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20" 
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          item.done ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                        )}>
                          {item.done ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <span className={cn(
                          "text-sm font-semibold",
                          item.done ? "text-blue-700 dark:text-blue-400" : "text-slate-500"
                        )}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== CURRICULUM TAB ===== */}
            {activeTab === "curriculum" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Learning Roadmap</h2>
                    <p className="text-sm text-slate-500">Master your field week by week</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-lg font-semibold text-xs self-start sm:self-auto">
                    {curriculum.length} Modules
                  </Badge>
                </div>

                {curriculum.length > 0 ? (
                  <div className="space-y-4">
                    {curriculum.map((item, idx) => (
                      <div key={item.id} className="group">
                        <div className={cn(
                          "flex gap-4 p-5 rounded-2xl border transition-all",
                          idx === 0 
                            ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/30" 
                            : "bg-white dark:bg-slate-900 border-blue-50 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                            idx === 0 
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.video_url && <Video size={14} className="text-slate-400" />}
                                {item.resources && <FileText size={14} className="text-slate-400" />}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{item.description}</p>
                            <Button variant="ghost" size="sm" className="text-blue-600 font-semibold text-xs p-0 h-auto hover:bg-transparent group/btn">
                              Start Learning <ArrowRight size={12} className="ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-blue-100 dark:border-slate-800">
                    <BookOpen size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold">No modules available yet</p>
                    <p className="text-xs text-slate-400 mt-1">Check back soon for your curriculum</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== REPORTS TAB ===== */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Daily Reports</h2>
                    <p className="text-sm text-slate-500">Document your daily activities</p>
                  </div>
                  <Button 
                    onClick={() => setIsLogModalOpen(true)}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 px-5 font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    <Plus size={14} className="mr-2" />
                    New Report
                  </Button>
                </div>

                {logs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {logs.map((log) => (
                      <div key={log.id} className="group bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-blue-100 dark:hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {format(new Date(log.log_date), "MMM dd, yyyy")}
                          </span>
                          <Badge className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-semibold border",
                            log.status === "approved" ? "bg-green-50 text-green-600 border-green-100" : 
                            log.status === "rejected" ? "bg-red-50 text-red-600 border-red-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {log.status || "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 mb-4">
                          {log.learning_log?.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            {log.check_in ? format(new Date(log.check_in), "HH:mm") : "--:--"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-amber-500" />
                            {log.experience_rating}/5
                          </span>
                        </div>
                        {log.supervisor_feedback && (
                          <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
                            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Feedback
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 italic line-clamp-2">
                              "{log.supervisor_feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-blue-100 dark:border-slate-800">
                    <FileText size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold">No reports submitted yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start by submitting your first daily log</p>
                    <Button 
                      onClick={() => setIsLogModalOpen(true)}
                      className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 h-10 px-5 font-semibold text-xs"
                    >
                      <Plus size={14} className="mr-2" /> Submit First Report
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ===== PAYMENTS TAB ===== */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                {/* Payment Header Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-8 text-white">
                  <div className="relative z-10">
                    <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-2">Payment Overview</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6">Financial Ledger</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs text-blue-200 font-semibold mb-1">Monthly Rate</p>
                        <p className="text-xl sm:text-2xl font-bold">{internship?.monthly_rate?.toLocaleString() || "0"} <span className="text-sm font-normal opacity-70">FCFA</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-200 font-semibold mb-1">Total Paid</p>
                        <p className="text-xl sm:text-2xl font-bold">0 <span className="text-sm font-normal opacity-70">FCFA</span></p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-blue-200 font-semibold mb-1">Status</p>
                        <Badge className="bg-white/20 text-white border-0 font-semibold px-3 py-1 rounded-lg">
                          {isPaid ? "Active" : "Awaiting Payment"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                  <Trophy size={60} className="absolute right-4 top-4 text-white/10" />
                </div>

                {/* Payment Info */}
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20">
                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Payment Instructions</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300/80">
                        To activate your full workspace and unlock all resources, please follow the payment instructions provided during your interview. Contact your supervisor if you need assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
