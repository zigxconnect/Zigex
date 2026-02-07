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
  Layers,
  Megaphone,
  CheckCheck,
  Search,
  Users,
  Compass,
  ArrowUpRight,
  Zap,
  Cpu,
  Notebook,
  Rocket,
  Check
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyReportModal } from "./DailyReportModal";
import { createClient } from "@/lib/supabase/client";
import { markAnnouncementsAsRead } from "@/lib/actions/announcement.actions";
import { InternAnnouncementBoard } from "@/components/sections/intern/InternAnnouncementBoard";
import { LogbookPreviewModal } from "./LogbookPreviewModal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { InternActivityGraph } from "./InternActivityGraph";
import { normalizeImageSrc } from "@/lib/utils";

interface InternWorkspaceClientProps {
  data: {
    application: any;
    curriculum: any[];
    logs: any[];
    tasks: any[];
    notes: any[];
    announcements?: any[];
    unreadCount?: number;
    fellowInterns: any[];
    fellowSupervisors: any[];
  };
}

const getTabs = (reportsCount: number, paymentsCount: number, tasksCount: number, unreadAnnouncements: number, hasPendingReport: boolean) => [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "tasks", label: "Tasks", icon: CheckCheck, badge: tasksCount > 0 ? tasksCount : undefined },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "announcements", label: "Announcements", icon: Megaphone, badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined },
  { 
    id: "reports", 
    label: "Reports", 
    icon: FileText, 
    badge: reportsCount > 0 ? reportsCount : undefined,
    badgeColor: hasPendingReport ? "bg-red-500" : "bg-blue-600"
  },
  { 
    id: "payments", 
    label: "Payments", 
    icon: CreditCard, 
    badge: paymentsCount > 0 ? paymentsCount : undefined,
    badgeColor: "bg-blue-600"
  },
];

export function InternWorkspaceClient({ data }: InternWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(data.unreadCount || 0);
  const { application, curriculum, logs, tasks: initialTasks, announcements = [], fellowInterns = [], fellowSupervisors = [] } = data;
  const [tasks, setTasks] = useState(initialTasks || []);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isColleaguesModalOpen, setIsColleaguesModalOpen] = useState(false);
  const [isLogbookPreviewOpen, setIsLogbookPreviewOpen] = useState(false);
  const [showDepartmentOnly, setShowDepartmentOnly] = useState(false);
  const internship = application?.internships;
  const company = internship?.company_profiles;
  const supervisor = application?.supervisor_profiles;

  const paymentLedger = application?.payment_ledger || [];
  const totalPaid = paymentLedger
    .filter((r: any) => r.status === 'paid')
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  
  const isPaid = totalPaid > 0;
  
  // Check if today's log already exists (client-side check for better UX)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const hasLoggedToday = logs.some((log: any) => log.log_date === todayStr);

  const isPaidInternship = internship?.monthly_rate > 0;
  const needsPaymentAcknowledgment = !application?.is_paid_acknowledgement && isPaidInternship;

  const progressPercent = Math.min(Math.round((logs.length / 30) * 100), 100);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Listen for changes to the current application (e.g., supervisor assignment)
    const channel = supabase
      .channel(`application-${application?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internship_applications',
          filter: `id=eq.${application?.id}`
        },
        (payload) => {
          console.log('[REALTIME] Application update detected:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [application?.id, router]);

  // Handle Tab Change and Mark Announcements as Read
  useEffect(() => {
    if (activeTab === "announcements" && unreadAnnouncements > 0) {
      const studentId = application?.student_id;
      const announcementIds = announcements.map((a: any) => a.id);
      
      if (studentId && announcementIds.length > 0) {
        markAnnouncementsAsRead(studentId, announcementIds).then(res => {
          if (res.success) {
            setUnreadAnnouncements(0);
          }
        });
      }
    }
  }, [activeTab, unreadAnnouncements, application?.student_id, announcements]);

  // Real-time Announcements Listener
  useEffect(() => {
    const supabase = createClient();
    const companyId = application?.internships?.company_id;

    const announcementsChannel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
        },
        async (payload) => {
          const newAnnouncement = payload.new as any;
          
          // Check if relevant: Global (company_id is null) or specific to student's company
          const isRelevant = !newAnnouncement.company_id || newAnnouncement.company_id === companyId;
          
          if (isRelevant) {
            // Re-fetch enriched announcements or manually refresh to get company info
            router.refresh();

            if (activeTab !== "announcements") {
              setUnreadAnnouncements(prev => prev + 1);
            }

            // Notification with company info
            toast.info("New Announcement", {
              description: newAnnouncement.title,
              icon: <Megaphone className="h-4 w-4 text-blue-600" />
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(announcementsChannel);
    };
  }, [application?.internships?.company_id, activeTab, router]);

  // Real-time Logs Listener (for Approval Status)
  useEffect(() => {
    const supabase = createClient();
    
    const logsChannel = supabase
      .channel(`logs-${application?.student_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'intern_logs',
          filter: `student_id=eq.${application?.student_id}`
        },
        (payload) => {
          console.log('[REALTIME] Log update detected:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logsChannel);
    };
  }, [application?.student_id, router]);

  // Real-time Tasks Listener
  useEffect(() => {
    const supabase = createClient();
    
    const tasksChannel = supabase
      .channel(`tasks-${application?.student_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internship_tasks',
          filter: `student_id=eq.${application?.student_id}`
        },
        (payload) => {
          console.log('[REALTIME] Task change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as any;
            setTasks(prev => [newTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as any;
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setTasks(prev => prev.filter(t => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    // Listen for Payment Confirmation
    const paymentChannel = supabase
      .channel(`payments-${application?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_ledger',
          filter: `application_id=eq.${application?.id}`
        },
        (payload) => {
          console.log('[REALTIME] Payment update detected:', payload);
          router.refresh();
        }
      )
      .subscribe();

    // Listen for Evaluation Updates
    const evaluationChannel = supabase
      .channel(`evaluations-${application?.student_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intern_evaluations',
          filter: `student_id=eq.${application?.student_id}`
        },
        (payload) => {
          console.log('[REALTIME] Evaluation update detected:', payload);
          router.refresh();
        }
      )
      .subscribe();

    // Listen for Generic Notifications
    const notificationChannel = supabase
      .channel(`intern-notifications-${application?.student_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${application?.student_id}`
        },
        (payload) => {
          const newNotif = payload.new as any;
          toast.info(newNotif.title, {
            description: newNotif.message,
            duration: 8000,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(evaluationChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [application?.student_id, application?.id, router]);

  // Reset unread count when switching to announcements tab
  useEffect(() => {
    if (activeTab === "announcements") {
      setUnreadAnnouncements(0);
    }
  }, [activeTab]);

  const handleOpenTask = async (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
    
    if (!task.is_read) {
      const { markTaskAsRead } = await import("@/lib/actions/intenship.actions");
      const res = await markTaskAsRead(task.id);
      if (res.success) {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_read: true } : t));
      }
    }
  };

  const tasksCount = tasks.filter(t => !t.is_read).length;

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
      <header className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-blue-100/30 dark:border-slate-800/50">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -tr-1/4 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-600/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -bl-1/4 w-[300px] h-[300px] bg-indigo-50/30 dark:bg-indigo-600/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col gap-8">
            
            
            {/* Main Info Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group shrink-0"
                >
                  <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                    {company?.logo_url ? (
                      <Image 
                        src={normalizeImageSrc(company.logo_url)} 
                        alt={company.company_name} 
                        width={80} 
                        height={80} 
                        className="w-full h-full object-cover p-2" 
                      />
                    ) : (
                      <Shield size={32} className="text-blue-600/50" />
                    )}
                  </div>
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                      {internship?.type || "Professional Track"}
                    </Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
                    {internship?.title || "Professional Internship"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs">
                    <span className="flex items-center gap-1.5">
                      <Layout size={12} className="text-blue-500" />
                      {company?.company_name}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-500" />
                      {application?.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Button 
                  onClick={() => setIsLogbookPreviewOpen(true)}
                  variant="outline" 
                  className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-[10px] h-11 px-5 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-blue-200 transition-all whitespace-nowrap"
                >
                  <FileText size={14} className="mr-2 text-blue-600" />
                  LOGBOOK PREVIEW
                </Button>
                <Button 
                  onClick={() => !hasLoggedToday && !needsPaymentAcknowledgment && setIsLogModalOpen(true)}
                  disabled={hasLoggedToday || needsPaymentAcknowledgment}
                  className={cn(
                    "rounded-2xl font-black text-[10px] h-11 px-6 shadow-xl transition-all active:scale-[0.98] whitespace-nowrap",
                    hasLoggedToday 
                      ? "bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-100" 
                      : needsPaymentAcknowledgment
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                  )}
                >
                  {hasLoggedToday ? (
                    <span className="flex items-center gap-2">
                      <CheckCheck size={14} /> LOGGED TODAY
                    </span>
                  ) : needsPaymentAcknowledgment ? (
                    <span className="flex items-center gap-2">
                       <Lock size={14} /> WORKSPACE LOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus size={14} /> SUBMIT DAILY LOG
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom Row: Colleagues + Mobile Pulse */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-8 sm:pt-10">
              <button 
                onClick={() => setIsColleaguesModalOpen(true)}
                className="flex items-center gap-4 group transition-all"
              >
                <div className="flex -space-x-1 sm:-space-x-1.5">
                  {(fellowInterns || []).slice(0, 5).map((intern: any, i: number) => (
                    <div 
                      key={intern.id} 
                      className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl ring-2 ring-white dark:ring-slate-950 overflow-hidden bg-slate-100 shadow-sm transition-transform group-hover:translate-x-1 group-hover:scale-105"
                      style={{ transitionDelay: `${i * 50}ms`, zIndex: 10 - i }}
                    >
                      <Image 
                        src={normalizeImageSrc(intern.student_profiles?.avatar_url, "/logo.png")} 
                        alt={intern.student_profiles?.full_name || "Intern"} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {fellowInterns.length > 5 && (
                    <div className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl ring-2 ring-white dark:ring-slate-950 bg-blue-600 text-white text-[10px] font-black shadow-lg z-0 transition-transform group-hover:translate-x-1">
                      +{fellowInterns.length - 5}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mb-1">Collaborative Network</p>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    Meet your {fellowInterns.length} fellow cohorts
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Workspace</span>
                </div>
              </div>
            </div>

            {/* Mobile Actions (Visible Only on Mobile) */}
            <div className="flex md:hidden flex-col gap-2.5">
              <Button 
                onClick={() => setIsLogbookPreviewOpen(true)}
                variant="outline" 
                className="w-full rounded-2xl border-blue-100 dark:border-slate-800 font-black text-[10px] h-12 whitespace-nowrap"
              >
                <FileText size={14} className="mr-2 text-blue-600" />
                LOGBOOK PREVIEW
              </Button>
              <Button 
                onClick={() => !hasLoggedToday && !needsPaymentAcknowledgment && setIsLogModalOpen(true)}
                disabled={hasLoggedToday || needsPaymentAcknowledgment}
                className={cn(
                  "w-full rounded-2xl font-black text-[10px] h-12 shadow-lg whitespace-nowrap",
                  hasLoggedToday 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : needsPaymentAcknowledgment
                    ? "bg-slate-100 text-slate-400"
                    : "bg-blue-600 text-white shadow-blue-500/20"
                )}
              >
                {hasLoggedToday ? (
                  <span className="flex items-center gap-2">
                    <CheckCheck size={14} /> LOGGED TODAY
                  </span>
                ) : needsPaymentAcknowledgment ? (
                  <span className="flex items-center gap-2">
                     <Lock size={14} /> WORKSPACE LOCKED
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus size={14} /> SUBMIT DAILY LOG
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NAVIGATION TABS ===== */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-blue-50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto hide-scrollbar custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {getTabs(
              logs.length, 
              paymentLedger.filter((p: any) => p.status === 'paid').length, 
              tasks.filter(t => !t.is_read).length, 
              unreadAnnouncements,
              logs.some(l => l.status !== 'approved')
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-200",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="relative">
                    <Icon size={16} className={cn(isActive && "text-blue-600")} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={cn(
                        "absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 border border-white dark:border-slate-900 shadow-sm",
                        tab.id === "announcements" ? "animate-pulse" : "",
                        tab.badgeColor || "bg-blue-600"
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
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
                
                {/* Payment Acknowledgment Banner (Persistent until accepted) */}
                {needsPaymentAcknowledgment && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-xl shadow-amber-500/20 mb-6"
                  >
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <CreditCard size={32} className="text-white" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-black mb-1">Paid Internship Acknowledgment</h3>
                        <p className="text-sm text-amber-50 font-medium">
                          This is a paid internship ({internship?.monthly_rate?.toLocaleString()} FCFA/month). 
                          Please acknowledge that you agree to the payment terms to unlock your daily logs.
                        </p>
                      </div>
                      <Button 
                        onClick={async () => {
                          const { acknowledgePaidInternship } = await import("@/lib/actions/intenship.actions");
                          const res = await acknowledgePaidInternship(application.id);
                          if (res.success) {
                            router.refresh();
                          }
                        }}
                        className="bg-white text-orange-600 hover:bg-amber-50 font-black rounded-2xl px-6 h-11 text-[10px] uppercase tracking-widest shadow-lg whitespace-nowrap"
                      >
                        I AGREE & ACKNOWLEDGE
                      </Button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Active Phase", value: application?.duration || "N/A", icon: Compass, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Work Ledger", value: `${logs.length} Entries`, icon: Notebook, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                    { label: "Specialization", value: application?.domain || "General", icon: Cpu, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
                    { label: "Success Rate", value: "94% Tracking", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                    >
                      <div className={cn("inline-flex items-center justify-center p-2.5 rounded-xl mb-4", stat.bg)}>
                        <stat.icon size={18} className={stat.color} />
                      </div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Main Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Detailed Description */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-7 sm:p-9 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1 h-5 bg-blue-600 rounded-full" />
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Mission Briefing</h3>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-8">
                      {internship?.description || "This internship provides hands-on experience in your chosen field, allowing you to develop practical skills while working alongside industry professionals."}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Technical Environment</p>
                        <div className="flex flex-wrap gap-1">
                          {(application?.skills || ["Professionalism", "Execution", "Strategy"]).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-400 capitalize">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Experience Focus</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {application?.experience_level || "Industry Standards"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High Tech Supervisor Card */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-7 text-white shadow-2xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em] mb-5 relative opacity-80">Assigned Supervisor</p>
                      
                      {supervisor ? (
                        <div className="space-y-5 relative">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden ring-4 ring-white/10 dark:ring-slate-100 shadow-xl bg-slate-800">
                              <Image 
                                src={normalizeImageSrc(supervisor.avatar_url, "/logo.png")} 
                                alt={supervisor.full_name} 
                                width={48} 
                                height={48} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-black text-base tracking-tight leading-none mb-1 text-white">{supervisor.full_name}</h4>
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Lead Strategist</p>
                            </div>
                          </div>
                          
                          <p className="text-[13px] font-medium text-white/70 leading-relaxed italic line-clamp-3">
                            "{supervisor.bio || "Available for guidance throughout your professional journey."}"
                          </p>
                          
                          <div className="pt-2 flex gap-2">
                             <Button 
                              asChild
                              className="flex-1 rounded-xl h-10 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap px-4"
                            >
                              <a href={`mailto:${supervisor.email}`}><Mail size={12} className="mr-2" /> Connect</a>
                            </Button>
                            {supervisor.whatsapp && (
                              <Button 
                                asChild
                                className="w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all p-0 flex items-center justify-center shrink-0 border-0 shadow-lg shadow-blue-500/20"
                              >
                                <a href={`https://wa.me/${supervisor.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                  <MessageSquare size={16} />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="w-14 h-14 bg-white/5 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <User size={24} className="text-slate-500" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Command</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestone Progress Tracker */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Milestone Roadmap</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Onboarding & Activation Coverage</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                      <div className="w-16 h-1.5 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                        {Math.round(([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Financial Verification", desc: "Payment sequence completed", done: isPaid, icon: CreditCard },
                      { label: "Strategic Alignment", desc: "Supervisor contact established", done: !!supervisor, icon: Target },
                      { label: "Execution Start", desc: "Initial engagement log recorded", done: logs.length > 0, icon: Rocket },
                    ].map((item, i) => (
                      <div key={i} className={cn(
                        "relative overflow-hidden p-6 rounded-[1.5rem] border-2 transition-all group",
                        item.done 
                          ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" 
                          : "bg-slate-50/50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
                      )}>
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            item.done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                          )}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className={cn(
                              "text-sm font-black tracking-tight mb-0.5",
                              item.done ? "text-emerald-900 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"
                            )}>{item.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{item.desc}</p>
                          </div>
                        </div>
                        {item.done && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Graph */}
                <InternActivityGraph logs={logs} />
              </div>
            )}

            {/* ===== ANNOUNCEMENTS TAB ===== */}
            {activeTab === "announcements" && (
              <InternAnnouncementBoard announcements={data.announcements || []} />
            )}

            {/* ===== TASKS TAB ===== */}
            {activeTab === "tasks" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Milestone Track</h2>
                    <p className="text-sm font-medium text-slate-500">Execution roadmap and assigned objectives</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                    <Target size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tasks.length} Active Objectives</span>
                  </div>
                </div>

                {tasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        onClick={() => handleOpenTask(task)}
                        className="group relative"
                      >
                        <div className={cn(
                          "h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-7 transition-all duration-300 shadow-sm overflow-hidden flex flex-col cursor-pointer",
                          !task.is_read ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/10" : "hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-200"
                        )}>
                          <div className="flex items-start justify-between mb-6">
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              task.priority === "high" ? "bg-rose-50 text-rose-600 border-rose-100" :
                              task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-sky-50 text-sky-600 border-sky-100"
                            )}>
                              {task.priority || "Standard"} Priority
                            </div>
                            <div className="flex items-center gap-1.5">
                               <CheckCheck 
                                size={18} 
                                className={cn("transition-colors duration-500", task.is_read ? "text-blue-500" : "text-slate-200")} 
                              />
                            </div>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-3 mb-8 flex-1">
                            {task.description}
                          </p>

                          <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Calendar size={12} className="text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Deadline</p>
                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">
                                  {format(new Date(task.due_date), "MMM dd")}
                                </p>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-all">
                              <ArrowUpRight size={18} />
                            </div>
                          </div>

                          {!task.is_read && (
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                               <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping" />
                               <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">New</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
                    <div className="w-24 h-24 bg-blue-50/50 dark:bg-slate-800/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-blue-200">
                      <Zap size={40} className="text-slate-200 dark:text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Zero Objectives</h3>
                    <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                      All systems operating normally. No pending milestones assigned at this time.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ===== CURRICULUM TAB ===== */}
            {activeTab === "curriculum" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Curriculum Roadmap</h2>
                    <p className="text-sm font-medium text-slate-500">Structured learning path for technical mastery</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                    <BookOpen size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{curriculum.length} Learning Modules</span>
                  </div>
                </div>

                {curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {curriculum.map((item, idx) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group"
                      >
                        <div className={cn(
                          "relative flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                          idx === 0 
                            ? "bg-blue-50/30 border-blue-200 dark:bg-blue-600/5 dark:border-blue-500/30 shadow-xl shadow-blue-500/5" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
                        )}>
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                            idx === 0 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}>
                            {idx + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {item.video_url && (
                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase">
                                    <Video size={12} /> Video
                                  </div>
                                )}
                                {item.resources && (
                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                                    <FileText size={12} /> Resources
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-3xl">
                              {item.description}
                            </p>
                            
                            <div className="flex items-center gap-4">
                              <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[9px] h-10 px-5 uppercase tracking-widest shadow-xl transition-all active:scale-95 whitespace-nowrap">
                                Launch Module
                              </Button>
                              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Status: <span className="text-blue-600 dark:text-blue-400">{idx === 0 ? "In Progress" : "Upcoming"}</span>
                              </p>
                            </div>
                          </div>

                          {idx === 0 && (
                            <div className="absolute top-6 right-6">
                               <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
                                 Active Module
                               </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <BookOpen size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Curriculum Locked</h3>
                    <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                      Your specialized learning path is currently being finalized. Prepare for activation.
                    </p>
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
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 px-5 font-black text-[10px] uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    <Plus size={14} className="mr-1.5" />
                    NEW REPORT
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
                          <div className="flex items-center gap-2">
                            <CheckCheck 
                              size={16} 
                              className={cn(
                                (log.read_at && log.status === "approved") ? "text-blue-500" : "text-slate-300"
                              )} 
                              strokeWidth={3}
                            />
                            <Badge className={cn(
                               "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-0",
                               log.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : 
                               log.status === "rejected" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10" :
                               "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                             )}>
                               {log.status === "approved" ? "Confirmed" : (log.status || "Pending")}
                             </Badge>
                          </div>
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
                        <p className="text-xl sm:text-2xl font-bold">{totalPaid.toLocaleString()} <span className="text-sm font-normal opacity-70">FCFA</span></p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-blue-200 font-semibold mb-1">Status</p>
                        <Badge className="bg-white/20 text-white border-0 font-semibold px-3 py-1 rounded-lg">
                          {totalPaid >= (internship?.monthly_rate * (application.duration_months || 1)) ? "Completed" : isPaid ? "Active" : "Awaiting"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                  <Trophy size={60} className="absolute right-4 top-4 text-white/10" />
                </div>

                {/* Payment History Table */}
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-blue-50 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paymentLedger.length > 0 ? (
                          paymentLedger.map((record: any, idx: number) => (
                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {new Date(0, record.month - 1).toLocaleString('en-US', { month: 'long' })}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-500">
                                  {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "---"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {record.amount?.toLocaleString()} XAF
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-md border-0 capitalize",
                                  record.status === 'paid' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                )}>
                                  {record.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {record.status === 'paid' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    asChild
                                    className="h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[10px] font-black uppercase tracking-wider"
                                  >
                                    <a 
                                      href={`/api/internships/receipt/${application.id}?month=${record.month}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <Download size={14} className="mr-1.5" />
                                      Receipt
                                    </a>
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <CreditCard size={32} className="text-slate-200" />
                                <p className="text-sm text-slate-400 font-medium">No payment history found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20">
                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Payment Instructions</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300/80">
                        To activate your full workspace and unlock all resources, please ensure your monthly allowance is processed by the administration. Download your official receipts above for your records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Task Details Modal */}
      <AnimatePresence>
        {isTaskDetailsOpen && selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskDetailsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <Badge className={cn(
                    "text-[10px] font-black px-4 py-1.5 rounded-full border-0 tracking-widest",
                    selectedTask.priority === "high" ? "bg-red-500 text-white" :
                    selectedTask.priority === "medium" ? "bg-amber-500 text-white" :
                    "bg-blue-600 text-white"
                  )}>
                    {selectedTask.priority?.toUpperCase()} PRIORITY
                  </Badge>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {format(new Date(selectedTask.due_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {selectedTask.title}
                </h2>
                
                <div className="space-y-4 mb-10 overflow-y-auto max-h-[300px] custom-scrollbar pr-4">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {selectedTask.description}
                  </p>
                  {selectedTask.department && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 w-fit">
                      <Layers size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedTask.department}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button 
                    onClick={() => setIsTaskDetailsOpen(false)}
                    className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black h-14 shadow-xl shadow-blue-500/20"
                  >
                    GOT IT
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsTaskDetailsOpen(false)}
                    className="flex-1 rounded-2xl border-slate-100 dark:border-slate-800 font-bold h-14"
                  >
                    CLOSE
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Colleagues Modal */}
      <AnimatePresence>
        {isColleaguesModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsColleaguesModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#F6F8FF] dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#155DFC] p-8 text-white relative shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{internship?.title}</h3>
                      <p className="text-xs text-blue-100 font-bold uppercase tracking-widest opacity-80">Fellow Colleagues</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsColleaguesModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Users size={20} className="rotate-45" />
                  </button>
                </div>
              </div>

              {/* Filtering */}
              <div className="p-6 bg-white dark:bg-slate-900 border-b border-blue-100/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-blue-600" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Network Explorer</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => setShowDepartmentOnly(false)}
                    variant={!showDepartmentOnly ? "default" : "outline"}
                    className={cn(
                      "flex-1 sm:flex-none rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                      !showDepartmentOnly 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "border-blue-100 dark:border-slate-700 text-slate-500"
                    )}
                  >
                    All Interns
                  </Button>
                  <Button 
                    onClick={() => setShowDepartmentOnly(true)}
                    variant={showDepartmentOnly ? "default" : "outline"}
                    className={cn(
                      "flex-1 sm:flex-none rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                      showDepartmentOnly 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "border-blue-100 dark:border-slate-700 text-slate-500"
                    )}
                  >
                    My Department
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8">
                
                {/* Fellow Interns Section */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={12} /> Fellow Interns ({showDepartmentOnly ? fellowInterns.filter((i: any) => i.isSameProgram).length : fellowInterns.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(showDepartmentOnly 
                      ? fellowInterns.filter((i: any) => i.isSameProgram)
                      : fellowInterns
                    ).map((intern: any) => (
                      <motion.div 
                        key={intern.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="p-4 rounded-[2rem] bg-white dark:bg-slate-900 border border-blue-50/50 dark:border-slate-800 flex flex-col items-center text-center gap-3 group shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm transition-transform group-hover:scale-105">
                          <Image 
                            src={normalizeImageSrc(intern.student_profiles?.avatar_url, "/logo.png")} 
                            alt={intern.student_profiles?.full_name} 
                            width={56} 
                            height={56} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-slate-900 dark:text-white truncate text-[11px] mb-1">{intern.student_profiles?.full_name}</h5>
                          <p className="text-[8px] text-blue-600 font-bold uppercase tracking-[0.05em] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-block">{intern.domain}</p>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 pt-1 w-full">
                          <Button 
                             asChild
                             variant="outline"
                             className="w-full rounded-xl h-8 border-blue-100 dark:border-slate-800 text-[8px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                          >
                            <a href={`mailto:${intern.student_profiles?.email}`}><Mail size={10} className="mr-1.5" /> Mail</a>
                          </Button>
                          <Button 
                             asChild
                             className="w-full rounded-xl h-8 bg-blue-600 hover:bg-blue-700 text-[8px] font-black uppercase tracking-widest dark:text-white shadow-lg shadow-blue-500/10"
                          >
                             <Link href={`/dashboard/student/${intern.student_profiles?.username || intern.student_profiles?.user_id}`}>
                               <ArrowUpRight size={10} className="mr-1.5" /> Portal
                             </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {fellowInterns.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400">No other interns found yet.</p>
                    </div>
                  )}
                </div>

                {/* Supervisors Section */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={12} /> Company Supervisors ({fellowSupervisors.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(fellowSupervisors || []).map((sup: any) => (
                      <div 
                        key={sup.id}
                        className="p-4 rounded-[2rem] bg-white dark:bg-slate-900 border border-blue-50/50 dark:border-slate-800 flex flex-col items-center text-center gap-3 group shadow-sm"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm transition-transform group-hover:scale-105">
                          <Image 
                            src={normalizeImageSrc(sup.avatar_url, "/logo.png")} 
                            alt={sup.full_name} 
                            width={56} 
                            height={56} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-slate-900 dark:text-white truncate text-[11px] mb-1">{sup.full_name}</h5>
                          <p className="text-[8px] text-amber-600 font-bold uppercase tracking-[0.05em] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full inline-block">
                            {sup.role || "Lead Supervisor"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 pt-1 w-full">
                          <Button 
                             asChild
                             variant="outline"
                             className="w-full rounded-xl h-8 border-blue-100 dark:border-slate-800 text-[8px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                          >
                             <a href={`mailto:${sup.email}`}><Mail size={10} className="mr-1.5" /> Mail</a>
                          </Button>
                          {sup.whatsapp && (
                            <Button 
                               asChild
                               className="w-full rounded-xl h-8 bg-blue-600 hover:bg-blue-700 text-[8px] font-black uppercase tracking-widest dark:text-white shadow-lg shadow-blue-500/10"
                            >
                               <a href={`https://wa.me/${sup.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                 <MessageSquare size={10} className="mr-1.5" /> WhatsApp
                               </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button 
                  onClick={() => setIsColleaguesModalOpen(false)}
                  className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest text-xs"
                >
                  Close Network
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logbook Preview Modal */}
      <LogbookPreviewModal 
        isOpen={isLogbookPreviewOpen}
        onClose={() => setIsLogbookPreviewOpen(false)}
        applicationId={application.id}
        studentName={application.student_profiles?.full_name || application.full_name || "Intern"}
      />
    </div>
  );
}
