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
  Check,
  ShieldCheck,
  Radio,
  Activity,
  X,
  Play,
  FileCheck2,
  LockKeyhole,
  Link as LinkIcon,
  Paperclip
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
import { getProgramCurriculum, ProgramCurriculum, LevelCurriculum, CurriculumModule, Lesson } from "@/lib/data/curriculum";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const isProgram = application?.application_type === "program" || application?.applicationType === "program";
  const isEvent = application?.application_type === "event" || application?.applicationType === "event";

  const opportunity = isProgram 
    ? application?.programs 
    : isEvent 
      ? application?.event 
      : application?.internships;

  const company = opportunity?.company_profiles;
  const supervisor = application?.supervisor_profiles;

  // Cleanup title for dynamic URL
  const slugifiedTitle = (opportunity?.title || "workspace").toLowerCase().replace(/ /g, "-");
  const typeSlug = isProgram ? "program" : isEvent ? "event" : "internship";

  const studentDomain = (application?.domain || "").toLowerCase().trim();
  const displayedInterns = showDepartmentOnly 
    ? (fellowInterns || []).filter((i: any) => (i.domain || "").toLowerCase().trim() === studentDomain)
    : (fellowInterns || []);
    
  const displayedSupervisors = showDepartmentOnly
    ? (fellowSupervisors || []).filter((s: any) => (s.department || "").toLowerCase().trim() === studentDomain)
    : (fellowSupervisors || []);

  const fullProgramCurriculum = getProgramCurriculum(application?.domain || opportunity?.title || "");
  
  // Mapping for experience levels to match curriculum data levels
  const getMappedLevel = (level?: string): LevelCurriculum['level'] => {
    if (!level) return 'Beginner';
    const l = level.toLowerCase();
    if (l.includes('expert')) return 'Expert';
    if (l.includes('advanced')) return 'Advanced';
    if (l.includes('intermediate')) return 'Intermediate';
    return 'Beginner'; // Default to Beginner for "No Idea" or unknown
  };

  const [selectedLevel, setSelectedLevel] = useState<LevelCurriculum['level']>(
    getMappedLevel(application?.experience_level)
  );

  const currentLevelData = fullProgramCurriculum?.levels.find(l => l.level === selectedLevel) || fullProgramCurriculum?.levels[0];
  const displayCurriculum = currentLevelData?.modules || [];

  const paymentLedger = application?.payment_ledger || [];
  const totalPaid = paymentLedger
    .filter((r: any) => r.status === 'paid')
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  
  const isPaid = totalPaid > 0;
  
  // Check if today's log already exists (client-side check for better UX)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const hasLoggedToday = logs.some((log: any) => log.log_date === todayStr);

  const isPaidInternship = opportunity?.monthly_rate > 0;
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
    const companyId = opportunity?.company_id;

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
  }, [opportunity?.company_id, activeTab, router]);

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
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-slate-950">
      {/* Daily Report Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <DailyReportModal 
            isOpen={isLogModalOpen} 
            onClose={() => setIsLogModalOpen(false)} 
            applicationId={application.id}
            opportunityType={application.application_type || "internship"}
          />
        )}
      </AnimatePresence>

      {/* ===== HEADER ===== */}
      <header className="relative pt-12 pb-16 overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50">
        {/* Decorative Background Elements - More atmospheric */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/40 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 dark:bg-indigo-600/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-10">
            {/* Status Pulse Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                <span className="text-[9px] font-bold text-slate-900 dark:text-slate-400 tracking-wider">Active Status</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800" />
            </div>
            
            {/* Main Info Row - Stacked on Mobile, Row on Desktop */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10">
              <div className="flex flex-col sm:flex-row items-start lg:items-center gap-6 lg:gap-8">
                <div className="relative group shrink-0 mx-auto sm:mx-0">
                  <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] blur-2xl group-hover:bg-blue-600/10 transition-all duration-500" />
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-[0_10px_30px_-12px_rgba(0,0,0,0.08)]">
                    {company?.logo_url ? (
                      <Image 
                        src={normalizeImageSrc(company.logo_url)} 
                        alt={company.company_name} 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover p-3" 
                      />
                    ) : (
                      <Shield size={40} className="text-blue-600/20" />
                    )}
                  </div>
                </div>

                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-blue-600 text-white border-0 text-[9px] font-bold tracking-tight px-3 py-1 rounded-full shadow-lg shadow-blue-500/10">
                      {opportunity?.type || isProgram ? "Program Track" : isEvent ? "Event Track" : "Professional Track"}
                    </Badge>
                    <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">ID: {application?.id?.slice(0, 8)}</span>
                  </div>
                  <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                    {opportunity?.title || "Professional Program"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <Layout size={12} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-300 tracking-tight">{company?.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <Calendar size={12} className="text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-300 tracking-tight">{application?.duration} Program</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 lg:pt-0">
                <Button 
                  onClick={() => setIsLogbookPreviewOpen(true)}
                  variant="outline" 
                  className="rounded-xl border-slate-200 dark:border-slate-800 font-bold text-[10px] tracking-wider h-12 px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300"
                >
                  <FileText size={14} className="mr-3 text-slate-900 dark:text-white" />
                  Logbook preview
                </Button>
                <Button 
                  onClick={() => !hasLoggedToday && !needsPaymentAcknowledgment && setIsLogModalOpen(true)}
                  disabled={hasLoggedToday || needsPaymentAcknowledgment}
                  className={cn(
                    "rounded-xl font-bold text-[10px] tracking-wider h-12 px-8 shadow-xl transition-all duration-300 active:scale-[0.98] whitespace-nowrap",
                    hasLoggedToday 
                      ? "bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-100" 
                      : needsPaymentAcknowledgment
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-[#155DFC] hover:bg-blue-700 text-white shadow-blue-500/20"
                  )}
                >
                  {hasLoggedToday ? (
                    <span className="flex items-center gap-2">
                      <CheckCheck size={16} strokeWidth={3} /> Logged
                    </span>
                  ) : needsPaymentAcknowledgment ? (
                    <span className="flex items-center gap-2">
                       <Lock size={16} /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       Submit Report
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom Row: Network + Metadata */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-slate-50 dark:border-slate-800/50">
              <button 
                onClick={() => setIsColleaguesModalOpen(true)}
                className="flex items-center gap-5 group transition-all"
              >
                <div className="flex -space-x-2.5">
                  {(fellowInterns || []).slice(0, 4).map((intern: any, i: number) => (
                    <div 
                      key={intern.id} 
                      className="relative h-9 w-9 rounded-xl ring-2 ring-white dark:ring-slate-950 overflow-hidden bg-slate-100 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:translate-x-1.5 group-hover:-rotate-3"
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
                  {fellowInterns.length > 4 && (
                    <div className="relative flex items-center justify-center h-9 w-9 rounded-xl ring-2 ring-white dark:ring-slate-950 bg-slate-900 text-white text-[10px] font-black shadow-lg z-0 transition-transform group-hover:translate-x-1.5">
                      +{fellowInterns.length - 4}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-[#155DFC] dark:text-blue-400 uppercase tracking-[0.3em] mb-0.5">Fellow Interns</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-300">
                    Connect with {fellowInterns.length} other members
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Supervisor</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {supervisor?.full_name || "Assigning..."}
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div className="flex h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center border border-blue-100/50 dark:border-blue-800/50">
                   <Target className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NAVIGATION TABS ===== */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 py-4 overflow-x-auto hide-scrollbar custom-scrollbar">
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
                    "relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-[14px] tracking-tight whitespace-nowrap transition-all duration-300",
                    isActive 
                      ? "text-gray-100 bg-blue-700 dark:bg-blue-600/10" 
                      : "text-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="relative">
                    <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={cn(
                        "absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm",
                        tab.id === "announcements" ? "animate-pulse" : "",
                        tab.badgeColor || "bg-blue-600"
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span>{tab.label}</span>
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-1 lg:p-1.5 shadow-2xl mb-12 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 opacity-50" />
                    <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[2.25rem] p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10">
                      <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <CreditCard size={40} className="text-white" />
                      </div>
                      <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Financial Activation Required</h3>
                        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                          This is a paid track offering <span className="text-blue-600 font-black">{opportunity?.monthly_rate?.toLocaleString()} FCFA</span> per cycle. 
                          Please acknowledge the professional terms to activate your deployment modules and daily reporting ledger.
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
                        className="bg-[#155DFC] hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-12 text-[10px] tracking-wider shadow-lg shadow-blue-500/10 whitespace-nowrap active:scale-[0.98] transition-all"
                      >
                        Activate Mission
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: "Program Duration", value: application?.duration || "N/A", icon: Compass, color: "text-blue-600", bg: "bg-blue-50/50 dark:bg-blue-600/10" },
                    { label: "Reports Submitted", value: `${logs.length} Entries`, icon: Notebook, color: "text-indigo-600", bg: "bg-indigo-50/50 dark:bg-indigo-600/10" },
                    { label: "Specialization", value: application?.domain || "Core", icon: Cpu, color: "text-violet-600", bg: "bg-violet-50/50 dark:bg-violet-600/10" },
                    { label: "Completion Progress", value: `${progressPercent}% Tracked`, icon: Zap, color: "text-blue-500", bg: "bg-blue-50/50 dark:bg-blue-500/10" },
                  ].map((stat, i) => (
                    <div 
                      key={i}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 transition-transform group-hover:scale-105", stat.bg)}>
                        <stat.icon size={18} className={stat.color} />
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1.5">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Main Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Detailed Description */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 lg:p-12 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-5 bg-[#155DFC] rounded-full" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Program Overview</h3>
                    </div>
                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-10">
                      {opportunity?.description || "This deployment provides hands-on experience in your chosen field, allowing you to develop practical skills while working alongside industry professionals."}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 rounded-3xl bg-[#FDFDFF] dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-3">Technical Stack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(application?.skills || ["Professionalism", "Execution", "Strategy"]).map((skill: string, i: number) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-600 dark:text-slate-300 tracking-tight">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Experience Level</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {application?.experience_level || "Standard Level"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High-Performance Supervisor Card */}
                  <div className="lg:col-span-4 flex flex-col gap-5">
                    <div className="bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-2xl p-6 text-white shadow-xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl group-hover:scale-125 transition-transform duration-700" />
                      <p className="text-[9px] font-bold text-blue-100/70 tracking-wider mb-4 relative">Assigned Supervisor</p>
                      
                      {supervisor ? (
                        <div className="space-y-4 relative">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg bg-slate-800">
                              <Image 
                                src={normalizeImageSrc(supervisor.avatar_url, "/logo.png")} 
                                alt={supervisor.full_name} 
                                width={40} 
                                height={40} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm tracking-tight leading-tight text-white">{supervisor.full_name}</h4>
                              <p className="text-[9px] font-bold text-blue-300 tracking-wider">Mentorship Lead</p>
                            </div>
                          </div>
                          
                          <p className="text-xs font-medium text-white/80 leading-relaxed italic line-clamp-3">
                            "{supervisor.bio || "Available for guidance throughout your professional journey."}"
                          </p>
                          
                          <div className="pt-1 flex gap-2">
                             <Button 
                              asChild
                              className="flex-1 rounded-lg h-9 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-bold text-[9px] tracking-wider hover:bg-slate-100 whitespace-nowrap px-4"
                            >
                              <a href={`mailto:${supervisor.email}`}><Mail size={12} className="mr-2" /> Connect</a>
                            </Button>
                            {supervisor.whatsapp && (
                              <Button 
                                asChild
                                className="w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all p-0 flex items-center justify-center shrink-0 border-0 shadow-md shadow-blue-500/10"
                              >
                                <a href={`https://wa.me/${supervisor.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                  <MessageSquare size={14} />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/5">
                            <User size={18} className="text-blue-200/50" />
                          </div>
                          <p className="text-[9px] font-bold text-blue-100/50 tracking-wider">Assigning Soon...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deployment Roadmap */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 lg:p-10 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Program Journey</h3>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider mt-1">Milestones & Progress Tracking</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 dark:bg-blue-600/5 rounded-xl border border-blue-50 dark:border-blue-900/20">
                      <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100}%` }}
                          className="h-full bg-[#155DFC] transition-all duration-1000" 
                        />
                      </div>
                      <span className="text-[9px] font-bold text-[#155DFC] tracking-wider">
                        {Math.round(([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100)}% Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { label: "Payment Setup", desc: "Terms acknowledged", done: isPaid, icon: ShieldCheck },
                      { label: "Mentor Assigned", desc: "Supervisor linked", done: !!supervisor, icon: Radio },
                      { label: "First Report", desc: "Initial entry recorded", done: logs.length > 0, icon: Activity },
                    ].map((item, i) => (
                      <div key={i} className={cn(
                        "relative overflow-hidden p-6 rounded-2xl border-2 transition-all group",
                        item.done 
                          ? "bg-blue-50/20 border-blue-100 dark:bg-blue-600/5 dark:border-blue-900/30" 
                          : "bg-slate-50/50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800"
                      )}>
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm",
                            item.done ? "bg-[#155DFC] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          )}>
                            <item.icon size={18} strokeWidth={2.5} />
                          </div>
                          <div className="pt-0.5">
                            <p className={cn(
                              "text-[10px] font-bold tracking-tight mb-0.5",
                              item.done ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                            )}>{item.label}</p>
                            <p className="text-[8px] font-medium text-slate-400 tracking-wide leading-tight">{item.desc}</p>
                          </div>
                        </div>
                        {item.done && (
                          <div className="absolute top-3 right-3">
                            <div className="w-5 h-5 bg-[#155DFC] rounded-full flex items-center justify-center shadow-md">
                              <Check size={10} strokeWidth={4} className="text-white" />
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
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Tasks & Objectives</h2>
                    <p className="text-[10px] font-medium text-slate-500">Manage your assigned tasks and track progress</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-50 dark:border-blue-500/20">
                    <Target size={12} className="text-[#155DFC]" />
                    <span className="text-[9px] font-bold text-[#155DFC] tracking-wider">{tasks.length} Active Objectives</span>
                  </div>
                </div>

                {tasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tasks.map((task, i) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTask(task)}
                        className="group relative"
                      >
                        <div className={cn(
                          "h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all duration-300 shadow-sm overflow-hidden flex flex-col cursor-pointer",
                          !task.is_read ? "ring-1 ring-[#155DFC] shadow-lg shadow-blue-500/5" : "hover:border-blue-200"
                        )}>
                          {task.output_image_url && (
                            <div className="relative h-32 w-full overflow-hidden">
                              <Image 
                                src={task.output_image_url} 
                                alt={task.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-5">
                            <div className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[8px] font-bold tracking-wider border",
                              task.priority === "high" ? "bg-rose-50 text-rose-600 border-rose-100" :
                              task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-sky-50 text-sky-600 border-sky-100"
                            )}>
                              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
                            </div>
                            <CheckCheck 
                              size={16} 
                              className={cn("transition-colors duration-500", task.is_read ? "text-[#155DFC]" : "text-slate-200")} 
                            />
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-tight group-hover:text-[#155DFC] transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-4 leading-snug">
                            {task.description}
                          </p>

                          {(task.resource_links?.length > 0 || task.attachments?.length > 0) && (
                            <div className="flex items-center gap-2 mb-6">
                              {task.resource_links?.length > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                                  <LinkIcon size={10} /> {task.resource_links.length} Links
                                </div>
                              )}
                              {task.attachments?.length > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                  <Paperclip size={10} /> {task.attachments.length} Files
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Calendar size={10} className="text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[8px] font-bold text-slate-400 tracking-wider leading-none mb-0.5">Deadline</p>
                                <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                                  {format(new Date(task.due_date), "MMM dd")}
                                </p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/10 group-hover:bg-[#155DFC] group-hover:text-white text-[#155DFC] flex items-center justify-center transition-all">
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </div>

                          {!task.is_read && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                               <div className="h-1.5 w-1.5 bg-[#155DFC] rounded-full animate-pulse" />
                               <span className="text-[8px] font-bold text-[#155DFC] tracking-wider">New</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
                    <div className="w-24 h-24 bg-blue-50/50 dark:bg-slate-800/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-blue-200">
                      <Zap size={40} className="text-slate-200 dark:text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Pending Tasks</h3>
                    <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                      Everything is up to date. No new tasks have been assigned at this time.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ===== CURRICULUM TAB ===== */}
            {activeTab === "curriculum" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Curriculum Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Program Curriculum</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50">
                        v2.4.0 Production
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">•</span>
                      <p className="text-[10px] font-black text-[#155DFC] uppercase tracking-[0.2em]">Official Syllabus</p>
                    </div>
                  </div>
                  
                  {/* Level Switcher */}
                  <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl gap-1 w-fit border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level as any)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                          selectedLevel === level 
                            ? "bg-[#155DFC] text-white shadow-xl shadow-blue-500/20 scale-[1.02]" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {displayCurriculum.length > 0 ? (
                  <>
                    {/* Main Vercel-Style Detail Card */}
                    <Card className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-blue-500/5 overflow-hidden">
                      <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Deployment Details</h3>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" className="rounded-xl h-9 px-4 text-[10px] font-bold border-slate-100 dark:border-slate-800 gap-2">
                            <Compass size={12} /> Share
                          </Button>
                          <Button variant="outline" className="rounded-xl h-9 px-4 text-[10px] font-bold border-slate-100 dark:border-slate-800 gap-2">
                            <Activity size={12} /> Logs
                          </Button>
                          <Button className="rounded-xl h-9 px-6 text-[10px] font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 gap-2">
                            Visit Pathway <ChevronRight size={12} />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          {/* Level Preview Image */}
                          <div className="lg:col-span-4">
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg group">
                              {currentLevelData?.image ? (
                                <Image 
                                  src={currentLevelData.image} 
                                  alt={selectedLevel} 
                                  fill 
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center">
                                  <Compass size={60} className="text-white/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex flex-col justify-end p-6">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Active Stage</span>
                                <p className="text-xl font-black text-white tracking-tight">{selectedLevel} Mastery</p>
                              </div>
                            </div>
                          </div>

                          {/* Metadata Grid */}
                          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</p>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#155DFC] flex items-center justify-center text-[8px] font-bold text-white">ZX</div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">zigex-learning</span>
                                <span className="text-xs text-slate-400 font-medium">3d ago</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">Ready Latest</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{displayCurriculum.reduce((acc, mod) => acc + (parseInt(mod.duration) || 0), 0)} Weeks Total</span>
                                <span className="text-xs text-slate-400 font-medium">mastery time</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</p>
                              <div className="flex items-center gap-2">
                                <Target size={16} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">Professional Production</span>
                              </div>
                            </div>

                            <div className="sm:col-span-2 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Source</p>
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <FileText size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">curriculum.ts</span>
                                 </div>
                                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <Compass size={14} className="text-[#155DFC]" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fullProgramCurriculum?.program}</span>
                                 </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Syllabus Explorer (Inspired by Build Logs) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Syllabus Architecture</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                            <Check size={14} /> All Modules Validated
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-900 overflow-hidden shadow-sm">
                        {displayCurriculum.map((module, mIdx) => (
                          <Accordion type="single" collapsible key={module.id} className="w-full">
                            <AccordionItem value={module.id} className="border-0">
                              <AccordionTrigger className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors hover:no-underline group">
                                <div className="flex items-center gap-6 w-full text-left">
                                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-data-[state=open]:text-[#155DFC] group-data-[state=open]:border-blue-100">
                                     {mIdx + 1}
                                   </div>
                                   <div className="flex-1">
                                     <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{module.title}</h4>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">{module.duration} • {module.lessons.length} Learning Blocks</p>
                                   </div>
                                   <div className="hidden sm:flex items-center gap-2 mr-4">
                                      <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 font-bold text-[8px] uppercase tracking-tighter">Production Ready</Badge>
                                   </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-8 pb-8 pt-2">
                                <div className="pl-16 space-y-8">
                                   <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl border-l-2 border-slate-100 dark:border-slate-800 pl-6">
                                     {module.description}
                                   </p>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {module.lessons.map((lesson) => (
                                        <a 
                                          key={lesson.id} 
                                          href={lesson.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-blue-100 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                              {lesson.type === 'video' ? <Play size={12} className="text-blue-500 fill-blue-500" /> : <FileText size={12} className="text-indigo-400" />}
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-slate-900 dark:text-white">{lesson.title}</p>
                                              <p className="text-[9px] font-medium text-slate-400 uppercase">{lesson.type} • {lesson.duration}</p>
                                            </div>
                                          </div>
                                          <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        </a>
                                      ))}
                                   </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Diagnostic Tiles (Vercel Footer Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Learning Velocity", value: "24.5%", desc: "View activity logs & pace", icon: Activity, color: "text-[#155DFC]" },
                        { title: "Cognitive Retention", value: "88.2%", desc: "Knowledge durability metrics", icon: ShieldCheck, color: "text-emerald-500" },
                        { title: "Pathway Precision", value: "High", desc: "Syllabus alignment score", icon: Target, color: "text-amber-500" },
                        { title: "Engagement Flow", value: "Active", desc: "Session intensity tracking", icon: Zap, color: "text-indigo-500" }
                      ].map((tile, i) => (
                        <Card key={i} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-blue-100 transition-all p-6 group cursor-pointer shadow-sm">
                          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{tile.title}</p>
                          <p className="text-xs font-semibold text-slate-400 mb-4">{tile.desc}</p>
                          <div className="flex items-center justify-between">
                             <span className={cn("text-lg font-black tracking-tight", tile.color)}>{tile.value}</span>
                             <tile.icon size={18} className="text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/5 backdrop-blur-[1px]" />
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl text-slate-200">
                        <BookOpen size={40} strokeWidth={1} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Curriculum Not Found</h3>
                      <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">
                        We couldn't find a specialized track for your domain yet. Please check in with your supervisor.
                      </p>
                      <Button variant="outline" className="rounded-xl font-black text-[10px] h-10 px-6 uppercase tracking-widest text-slate-500">Contact Supervisor</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== REPORTS TAB ===== */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Reports</h2>
                    <p className="text-[10px] font-medium text-slate-500">Document your daily activities and operational progress</p>
                  </div>
                  <Button 
                    onClick={() => setIsLogModalOpen(true)}
                    className="rounded-xl bg-[#155DFC] hover:bg-[#1A3CB9] h-10 px-5 font-bold text-[10px] tracking-wider shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    <Plus size={14} className="mr-1.5" />
                    New Report
                  </Button>
                </div>

                {logs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {logs.map((log) => (
                      <div key={log.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-blue-100 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] text-slate-400 font-bold tracking-wider">
                            {format(new Date(log.log_date), "MMM dd, yyyy")}
                          </span>
                          <div className="flex items-center gap-2">
                            <CheckCheck 
                              size={14} 
                              className={cn(
                                (log.read_at && log.status === "approved") ? "text-[#155DFC]" : "text-slate-200"
                              )} 
                              strokeWidth={3}
                            />
                            <Badge className={cn(
                               "rounded-lg px-2 py-0.5 text-[8px] font-bold tracking-wider border-0",
                               log.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : 
                               log.status === "rejected" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10" :
                               "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                             )}>
                               {log.status === "approved" ? "Confirmed" : (log.status || "Pending")}
                             </Badge>
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {log.learning_log}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#155DFC]" />
                            {log.check_in ? format(new Date(log.check_in), "HH:mm") : "--:--"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star size={12} className="text-amber-500" />
                            {log.experience_rating}/5
                          </span>
                        </div>
                        {log.supervisor_feedback && (
                          <div className="mt-4 p-3 rounded-xl bg-blue-50/30 dark:bg-blue-600/5 border border-blue-50 dark:border-blue-900/20">
                            <p className="text-[9px] text-[#155DFC] font-bold tracking-wider mb-1 flex items-center gap-1.5">
                              <MessageSquare size={10} /> Feedback
                            </p>
                            <p className="text-[10px] text-blue-700 dark:text-blue-300 italic line-clamp-2 leading-relaxed">
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
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] p-6 sm:p-8 text-white shadow-xl">
                  <div className="relative z-10">
                    <p className="text-blue-100/70 text-[9px] font-bold tracking-widest mb-2">Financial Status</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8">Financial Ledger</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10">
                      <div>
                        <p className="text-[9px] font-bold text-blue-200/50 mb-1.5 tracking-wider">Monthly Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{opportunity?.monthly_rate?.toLocaleString() || "0"} <span className="text-[10px] opacity-70">FCFA</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-blue-200/50 mb-1.5 tracking-wider">Total Ledger</p>
                        <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{totalPaid.toLocaleString()} <span className="text-[10px] opacity-70">FCFA</span></p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[9px] font-bold text-blue-200/50 mb-1.5 tracking-wider">Operational Status</p>
                        <Badge className="bg-white/10 text-white border border-white/10 font-bold px-3 py-1 rounded-lg text-[9px] tracking-wider">
                          {totalPaid >= (opportunity?.monthly_rate * (application.duration_months || 1)) ? "Completed" : isPaid ? "Active" : "Awaiting Activation"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                  <Trophy size={80} className="absolute right-6 top-6 text-white/5" />
                </div>

                {/* Payment History Ledger */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Transaction History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-wider">Operational Month</th>
                          <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-wider">Date Recorded</th>
                          <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-wider">Protocol Status</th>
                          <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-wider text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {paymentLedger.length > 0 ? (
                          paymentLedger.map((record: any, idx: number) => (
                            <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                                  {new Date(0, record.month - 1).toLocaleString('en-US', { month: 'long' })}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-medium text-slate-500">
                                  {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "---"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                                  {record.amount?.toLocaleString()} XAF
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={cn(
                                  "text-[8px] font-bold px-2 py-0.5 rounded-lg border-0",
                                  record.status === 'paid' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                )}>
                                  {record.status === 'paid' ? 'Verified' : 'Pending'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {record.status === 'paid' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    asChild
                                    className="h-8 rounded-lg text-[#155DFC] hover:text-[#1A3CB9] hover:bg-blue-50 dark:hover:bg-blue-900/10 text-[9px] font-bold tracking-wider"
                                  >
                                    <a 
                                      href={`/api/internships/receipt/${application.id}?month=${record.month}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <Download size={12} className="mr-1.5" />
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
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                                  <CreditCard size={18} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 tracking-wider">No Transaction History Identified</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Operational Guidelines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-amber-50/30 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/20">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 mb-1 tracking-tight">Administrative Protocol</p>
                      <p className="text-[9px] font-medium text-amber-700/80 dark:text-amber-300/60 leading-relaxed">
                        To maintain operational access and unlock specialized resource sectors, ensure your financial ledger remains active through administration. Official verification receipts are accessible within the transaction row.
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
                <div className="flex items-center justify-between mb-6">
                  <Badge className={cn(
                    "text-[9px] font-bold px-3 py-1 rounded-lg border-0 tracking-tight",
                    selectedTask.priority === "high" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10" :
                    selectedTask.priority === "medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10" :
                    "bg-[#155DFC]/10 text-[#155DFC]"
                  )}>
                    {selectedTask.priority ? selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1) : "Normal"} Priority
                  </Badge>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold tracking-tight">
                      {format(new Date(selectedTask.due_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                {selectedTask.output_image_url && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-slate-100 dark:border-slate-800 shadow-md">
                    <Image 
                      src={selectedTask.output_image_url} 
                      alt={selectedTask.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  {selectedTask.title}
                </h2>
                
                <div className="space-y-6 mb-8 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {selectedTask.description}
                  </p>

                  {selectedTask.resource_links?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <LinkIcon size={12} className="text-blue-500" /> Resource Links
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedTask.resource_links.map((link: any, idx: number) => (
                          <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-all group/link"
                          >
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{link.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400 truncate max-w-[150px]">{link.url}</span>
                              <ExternalLink size={12} className="text-slate-300 group-hover/link:text-blue-500 transition-colors" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.attachments?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Paperclip size={12} className="text-indigo-500" /> Attached Documents
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedTask.attachments.map((file: any, idx: number) => (
                          <a 
                            key={idx} 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 transition-all group/file"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <FileText size={14} className="text-indigo-500" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[300px]">{file.name}</span>
                            </div>
                            <Download size={14} className="text-slate-300 group-hover/file:text-indigo-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.department && (
                    <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 w-fit">
                      <Layers size={12} className="text-[#155DFC]" />
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{selectedTask.department}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button 
                    onClick={() => setIsTaskDetailsOpen(false)}
                    className="flex-1 rounded-xl bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold h-11 shadow-lg shadow-blue-500/10 text-[10px] tracking-wider"
                  >
                    Confirm Observation
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsTaskDetailsOpen(false)}
                    className="flex-1 rounded-xl border-slate-100 dark:border-slate-800 font-bold h-11 text-[10px] tracking-wider text-slate-500"
                  >
                    Close Briefing
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
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#F6F8FF] dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#155DFC] to-[#0A3D91] p-8 text-white relative shrink-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white/95">{opportunity?.title}</h3>
                      <p className="text-[10px] text-blue-100 font-black tracking-[0.2em] uppercase opacity-90">Operational Network Hub</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsColleaguesModalOpen(false)}
                    className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 active:scale-90 border border-transparent hover:border-white/20 shadow-lg"
                  >
                    <X size={20} className="text-white/80" />
                  </button>
                </div>
              </div>

              {/* Filtering */}
              <div className="p-6 bg-white dark:bg-slate-900 border-b border-blue-100/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-[#155DFC]" />
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white tracking-widest">Network Explorer</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => setShowDepartmentOnly(false)}
                    variant={!showDepartmentOnly ? "primary" : "outline"}
                    className={cn(
                      "flex-1 sm:flex-none rounded-xl h-9 px-5 text-[9px] font-bold tracking-widest transition-all",
                      !showDepartmentOnly 
                        ? "bg-[#155DFC] text-white shadow-lg shadow-blue-500/10" 
                        : "border-slate-100 dark:border-slate-800 text-slate-500"
                    )}
                  >
                    All Interns
                  </Button>
                  <Button 
                    onClick={() => setShowDepartmentOnly(true)}
                    variant={showDepartmentOnly ? "primary" : "outline"}
                    className={cn(
                      "flex-1 sm:flex-none rounded-xl h-9 px-5 text-[9px] font-bold tracking-widest transition-all",
                      showDepartmentOnly 
                        ? "bg-[#155DFC] text-white shadow-lg shadow-blue-500/10" 
                        : "border-slate-100 dark:border-slate-800 text-slate-500"
                    )}
                  >
                    My Department
                  </Button>
                </div>
              </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                  {/* Fellow Interns Section */}
                  <div className="space-y-12">
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] flex items-center gap-2 uppercase">
                          <Users size={14} className="text-[#155DFC]" /> 
                          Fellow Cohorts ({displayedInterns.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedInterns.map((intern: any) => (
                          <div 
                            key={intern.id}
                            className="relative group h-full"
                          >
                            <div className="relative h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-5 shadow-sm hover:border-blue-100 transition-all">
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#155DFC]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-125" />
                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 shadow-md bg-slate-50 transition-all duration-500 group-hover:shadow-blue-500/20 group-hover:scale-105">
                                  <Image 
                                    src={normalizeImageSrc(intern.student_profiles?.avatar_url, "/logo.png")} 
                                    alt={intern.student_profiles?.full_name} 
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 w-full">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-1 truncate px-2 group-hover:text-[#155DFC] transition-colors">{intern.student_profiles?.full_name}</h5>
                                <Badge className="bg-blue-50/50 dark:bg-[#155DFC]/5 text-[#155DFC] border border-[#155DFC]/10 text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-lg uppercase">{intern.domain || "Specialist"}</Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-1 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                                <Button 
                                   asChild
                                   variant="outline"
                                   className="flex-1 rounded-xl h-9 border-slate-100 dark:border-slate-800 text-[9px] font-bold tracking-wider hover:bg-[#155DFC] hover:text-white hover:border-[#155DFC] transition-all duration-300"
                                >
                                  <a href={`mailto:${intern.student_profiles?.email}`}><Mail size={12} className="mr-1.5" /> Message</a>
                                </Button>
                                <Button 
                                   asChild
                                   className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#155DFC] dark:hover:bg-[#155DFC] dark:hover:text-white p-0 flex items-center justify-center transition-all shadow-lg"
                                >
                                   <Link href={`/dashboard/student/${intern.student_profiles?.username || intern.student_profiles?.user_id}`}>
                                      <ArrowUpRight size={14} />
                                   </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {displayedInterns.length === 0 && (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching cohorts found</p>
                        </div>
                      )}
                    </div>

                    {/* Supervisors Section */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2 uppercase">
                        <Shield size={14} className="text-amber-500" /> Command Core ({displayedSupervisors.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedSupervisors.map((sup: any) => (
                          <div 
                            key={sup.id}
                            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-5 group shadow-sm hover:shadow-xl hover:border-amber-100/50 transition-all duration-300"
                          >
                            <div className="relative group/avatar">
                              <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 scale-125" />
                              <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 shadow-lg bg-slate-50 transition-transform duration-500 group-hover:scale-105">
                                <Image 
                                  src={normalizeImageSrc(sup.avatar_url, "/logo.png")} 
                                  alt={sup.full_name} 
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                              <h5 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-1 truncate px-2 group-hover:text-amber-600 transition-colors uppercase">{sup.full_name}</h5>
                              <Badge className="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-lg uppercase">
                                {sup.role || "Lead Strategist"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 pt-1 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button 
                                 asChild
                                 variant="outline"
                                 className="flex-1 rounded-xl h-9 border-slate-100 dark:border-slate-800 text-[9px] font-bold tracking-wider hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300"
                              >
                                 <a href={`mailto:${sup.email}`}><Mail size={12} className="mr-1.5" /> Contact</a>
                              </Button>
                              {sup.whatsapp && (
                                <Button 
                                   asChild
                                   className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white p-0 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
                                >
                                   <a href={`https://wa.me/${sup.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                     <MessageSquare size={16} />
                                   </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {displayedSupervisors.length === 0 && (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mt-6">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No linked supervisors in this sector</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <Button 
                    onClick={() => setIsColleaguesModalOpen(false)}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold tracking-wider text-[10px] shadow-lg transition-all active:scale-[0.98]"
                  >
                    Close Protocol
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
