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
  Paperclip,
  Building2,
  Filter,
  Scan,
  Camera
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
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { AttendanceScannerModal } from "./AttendanceScannerModal";
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
    userWorkspaces?: any[];
    studentProfile?: any;
  };
}

const getTabs = (reportsCount: number, paymentsCount: number, tasksCount: number, unreadAnnouncements: number, hasPendingReport: boolean) => [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "curriculum", label: "Learning path", icon: BookOpen },
  { id: "tasks", label: "Tasks", icon: CheckCheck, badge: tasksCount > 0 ? tasksCount : undefined },
  { id: "reports", label: "Daily logs", icon: FileText, badge: hasPendingReport ? 1 : 0, badgeColor: "bg-red-500" },
  { id: "announcements", label: "Updates", icon: Megaphone, badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined },
  { id: "payments", label: "Payments", icon: CreditCard },
];

export function InternWorkspaceClient({ data }: InternWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(data.unreadCount || 0);
  const { application, curriculum, logs, tasks: initialTasks, announcements = [], fellowInterns = [], fellowSupervisors = [], studentProfile, attendance = [] } = data;
  const [tasks, setTasks] = useState(initialTasks || []);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isColleaguesModalOpen, setIsColleaguesModalOpen] = useState(false);
  const [isLogbookPreviewOpen, setIsLogbookPreviewOpen] = useState(false);
  const [showDepartmentOnly, setShowDepartmentOnly] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
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
            internshipId={opportunity?.id || application?.internship_id || application?.program_id || application?.event_id}
          />
        )}
      </AnimatePresence>

      {/* ===== NAVIGATION TABS ===== */}
      <nav className="sticky top-[52px] z-[40] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-12">
          <div className="flex items-center gap-1 sm:gap-4 py-0.5 px-2 sm:px-0 overflow-x-auto hide-scrollbar w-full">
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
                    "relative flex flex-shrink-0 items-center gap-1 sm:gap-2 px-3 sm:px-4 py-4 sm:py-5 transition-all duration-300 group cursor-pointer text-[11px] sm:text-[13px] font-bold tracking-tight whitespace-nowrap",
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent"
                  )}
                >
                  <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      "ml-1 sm:ml-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[8px] font-black text-white",
                      tab.id === "announcements" ? "animate-pulse" : "",
                      tab.badgeColor || "bg-blue-600"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-12 py-3 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 sm:gap-8 items-start">
          {/* Left Column: Active Tab Content */}
          <div className="min-w-0 space-y-6 sm:space-y-8">
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

                    {/* Program Identity Card (Integrated Header) */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
                        <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                          <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-[#155DFC] shadow-lg shadow-blue-500/20 shrink-0">
                            <Image
                              src={normalizeImageSrc(studentProfile?.avatar_url, "/default-avatar.svg")}
                              alt="Student Avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Badge className="bg-blue-600 text-white font-black px-1.5 sm:px-2 py-0.5 rounded-md text-[7px] sm:text-[8px] uppercase tracking-widest border-0">
                                {isProgram ? "Program Track" : isEvent ? "Event Access" : "Internship"}
                              </Badge>
                              <span className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {application.id.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                              {opportunity?.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Building2 size={12} className="text-blue-600" />
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-tight">{company?.company_name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Calendar size={12} className="text-slate-400" />
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-tight">{application.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-2 w-full lg:w-auto mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            onClick={() => setIsLogbookPreviewOpen(true)}
                            className="flex-1 sm:flex-none rounded-xl h-10 sm:h-11 px-2 sm:px-6 border-slate-200 dark:border-slate-800 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                          >
                            <FileText size={14} className="hidden sm:inline-block" /> Logbook
                          </Button>
                          <Button
                            disabled={hasLoggedToday || needsPaymentAcknowledgment}
                            onClick={() => setIsLogModalOpen(true)}
                            className={cn(
                              "flex-1 sm:flex-none rounded-xl h-10 sm:h-11 px-2 sm:px-8 font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg transition-all cursor-pointer whitespace-nowrap",
                              hasLoggedToday
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                            )}
                          >
                            {hasLoggedToday ? "Logged Today" : needsPaymentAcknowledgment ? "Locked" : "Submit Report"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Alert */}
                    {needsPaymentAcknowledgment && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-8 flex flex-col lg:flex-row items-center gap-8 shadow-xl"
                      >
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                          <CreditCard size={28} className="text-white" />
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                          <h3 className="text-xl font-black text-white mb-1 tracking-tight">Setup Required</h3>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-xl">
                            This program requires a monthly rate of <span className="text-blue-500 font-black">{opportunity?.monthly_rate?.toLocaleString()} FCFA</span>.
                            Acknowledge the terms to start your internship.
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
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg px-8 h-11 text-[10px] tracking-widest cursor-pointer shadow-lg shadow-blue-500/20"
                        >
                          I AGREE & START
                        </Button>
                      </motion.div>
                    )}

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Duration", value: application?.duration || "N/A", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-600/10" },
                        { label: "Reports", value: `${logs.length} Submitted`, icon: Notebook, color: "text-slate-900 dark:text-white", bg: "bg-slate-100 dark:bg-slate-800" },
                        { label: "Focus", value: application?.domain || "General", icon: Cpu, color: "text-slate-900 dark:text-white", bg: "bg-slate-100 dark:bg-slate-800" },
                        { label: "Progress", value: `${progressPercent}% Done`, icon: Zap, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-600/10" },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-600 transition-all group"
                        >
                          <div className={cn("inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3", stat.bg)}>
                            <stat.icon size={14} className={stat.color} />
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold tracking-wider mb-1 uppercase">{stat.label}</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Attendance Tracker */}
                    {(() => {
                      // Flatten attendance_logs JSONB from all attendance rows into a sorted list
                      const allCheckIns: { date: string; status: string; confirmed_at: string }[] = [];
                      if (attendance && attendance.length > 0) {
                        attendance.forEach((record: any) => {
                          const logs = record.attendance_logs || {};
                          Object.entries(logs).forEach(([dateKey, entry]: [string, any]) => {
                            allCheckIns.push({
                              date: dateKey,
                              status: entry?.status || "present",
                              confirmed_at: entry?.confirmed_at || "",
                            });
                          });
                        });
                        allCheckIns.sort((a, b) => b.date.localeCompare(a.date));
                      }
                      const presentCount = allCheckIns.filter(c => c.status === "present").length;

                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-8 shadow-sm">
                          <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="w-1 h-4 sm:h-5 bg-emerald-500 rounded-full" />
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Attendance Tracker</h3>
                          </div>

                          {allCheckIns.length > 0 ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                              <div className="flex items-center gap-6 w-full sm:w-auto">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</span>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Days Present</p>
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">You have successfully scanned in on {presentCount} day(s).</p>
                                </div>
                              </div>

                              <div className="flex-1 w-full lg:max-w-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                  Recent Check-ins
                                </p>
                                <div className="space-y-2">
                                  {allCheckIns.slice(0, 5).map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                          {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                      </div>
                                      <Badge className="text-[9px] uppercase font-black tracking-widest bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border-none">
                                        {entry.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <Scan size={20} className="text-slate-400" />
                              </div>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No attendance records yet</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Scan the QR code at your department to log attendance</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* About This Program */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="w-1 h-4 sm:h-5 bg-blue-600 rounded-full" />
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">About This Program</h3>
                      </div>
                      <div className="space-y-4">
                        <div 
                          className={cn(
                            "prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed",
                            !isDescriptionExpanded && "line-clamp-4 overflow-hidden"
                          )}
                          dangerouslySetInnerHTML={{ __html: opportunity?.description || "No description provided." }}
                        />
                        {(opportunity?.description?.replace(/<[^>]*>/g, '') || "").split(/\s+/).filter(Boolean).length > 45 && (
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 cursor-pointer flex items-center gap-1 mt-2"
                          >
                            {isDescriptionExpanded ? "Show Less" : "Read More"}
                            <ChevronRight size={12} className={cn("transition-transform", isDescriptionExpanded ? "rotate-90" : "")} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Mentor</p>
                          {supervisor ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                                <Image
                                  src={normalizeImageSrc(supervisor.avatar_url, "/logo.png")}
                                  alt={supervisor.full_name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">{supervisor.full_name}</h4>
                                <p className="text-[10px] font-bold text-blue-600 uppercase">Expert Lead</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-slate-400">Mentor assignment pending...</p>
                          )}
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {(application?.skills || ["Professionalism", "Strategy"]).map((skill: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance History Graph */}
                    <InternActivityGraph logs={logs} />

                    {/* Your Progress */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-8 shadow-sm relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Your Milestones</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Track your onboarding and performance</p>
                          </div>
                          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 dark:bg-blue-600/5 rounded-xl border border-blue-50 dark:border-blue-900/20">
                            <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100}%` }}
                                className="h-full bg-blue-600 transition-all duration-1000"
                              />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 tracking-wider">
                              {Math.round(([isPaid, !!supervisor, logs.length > 0].filter(Boolean).length / 3) * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: "Terms Agreed", desc: "Access granted", done: isPaid, icon: ShieldCheck },
                            { label: "Mentor Connected", desc: "Guidance linked", done: !!supervisor, icon: Radio },
                            { label: "Logs Active", desc: "Reporting started", done: logs.length > 0, icon: Activity },
                          ].map((item, i) => (
                            <div key={i} className={cn(
                              "relative overflow-hidden p-6 rounded-xl border transition-all",
                              item.done
                                ? "bg-blue-50/20 border-blue-100 dark:bg-blue-600/5 dark:border-blue-900/30"
                                : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800"
                            )}>
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                  item.done ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                )}>
                                  <item.icon size={18} strokeWidth={3} />
                                </div>
                                <div className="pt-0.5">
                                  <p className={cn(
                                    "text-[10px] font-black uppercase tracking-tight mb-0.5",
                                    item.done ? "text-slate-900 dark:text-white" : "text-slate-400"
                                  )}>{item.label}</p>
                                  <p className="text-[9px] font-bold text-slate-500 tracking-tight leading-tight">{item.desc}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== ANNOUNCEMENTS TAB ===== */}
                {activeTab === "announcements" && (
                  <InternAnnouncementBoard announcements={data.announcements || []} />
                )}

                {/* ===== TASKS TAB ===== */}
                {activeTab === "tasks" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Tasks</h2>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{tasks.length} active objectives</p>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-50 dark:border-blue-500/20">
                        <Target size={12} className="text-[#155DFC]" />
                        <span className="text-[8px] sm:text-[9px] font-bold text-[#155DFC] tracking-wider">{tasks.filter(t => !t.is_read).length} New</span>
                      </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                        {["all", "high", "medium", "low"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setTaskFilter(f)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                              taskFilter === f
                                ? "bg-[#155DFC] text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
                            )}
                          >
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Task Cards - Sleek Horizontal */}
                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks
                          .filter(task => {
                            const matchSearch = !taskSearch || task.title?.toLowerCase().includes(taskSearch.toLowerCase()) || task.description?.toLowerCase().includes(taskSearch.toLowerCase());
                            const matchFilter = taskFilter === "all" || task.priority === taskFilter;
                            return matchSearch && matchFilter;
                          })
                          .map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleOpenTask(task)}
                            className={cn(
                              "flex items-center gap-3 sm:gap-4 bg-white dark:bg-slate-900 border rounded-xl px-3 sm:px-4 py-3 transition-all cursor-pointer group",
                              !task.is_read
                                ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/5"
                                : "border-slate-100 dark:border-slate-800 hover:border-blue-200"
                            )}
                          >
                            {/* Priority Indicator */}
                            <div className={cn(
                              "w-2 h-8 rounded-full shrink-0",
                              task.priority === "high" ? "bg-rose-500" :
                                task.priority === "medium" ? "bg-amber-400" : "bg-sky-400"
                            )} />
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-[#155DFC] transition-colors">{task.title}</h3>
                                {!task.is_read && <div className="w-1.5 h-1.5 bg-[#155DFC] rounded-full animate-pulse shrink-0" />}
                              </div>
                              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{task.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-bold tracking-wider border",
                                  task.priority === "high" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                      "bg-sky-50 text-sky-600 border-sky-100"
                                )}>
                                  {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Calendar size={9} />{format(new Date(task.due_date), "MMM dd")}</span>
                                {task.resource_links?.length > 0 && (
                                  <span className="text-[8px] text-blue-500 font-bold flex items-center gap-0.5"><LinkIcon size={8} />{task.resource_links.length}</span>
                                )}
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-[#155DFC] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                              <ArrowUpRight size={12} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Zap size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">No Pending Tasks</h3>
                        <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">Everything is up to date.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== CURRICULUM TAB ===== */}
                {activeTab === "curriculum" && (
                  <div className="space-y-5 sm:space-y-8 pb-12">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-1.5">
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Learning Path</h2>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[8px] sm:text-[9px] font-black border-slate-200 dark:border-slate-800 text-slate-600 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50">
                            Version 4.0
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">•</span>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Curriculum</p>
                        </div>
                      </div>

                      {/* Level Switcher - Industrial Style */}
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl gap-1 w-full sm:w-fit border border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setSelectedLevel(level as any)}
                            className={cn(
                              "flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap",
                              selectedLevel === level
                                ? "bg-white dark:bg-slate-800 text-[#155DFC] shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
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
                        {/* High-Density Pathway Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-4 aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl relative group">
                            {currentLevelData?.image ? (
                              <Image
                                src={currentLevelData.image}
                                alt={selectedLevel}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <Compass size={48} className="text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-6">
                              <p className="text-lg font-black text-white tracking-tight uppercase">{selectedLevel} Mastery</p>
                              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Operational Track</p>
                            </div>
                          </div>

                          <div className="lg:col-span-8 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-8 grid grid-cols-2 gap-4 sm:gap-8 shadow-sm">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Track</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timeframe</p>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-blue-600" />
                                <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{displayCurriculum.reduce((acc, mod) => acc + (parseInt(mod.duration) || 0), 0)} Weeks</span>
                              </div>
                            </div>
                            <div className="col-span-2 pt-6 border-t border-slate-50 dark:border-slate-900">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Context</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400">zigex-core-v4</span>
                                <span className="px-3 py-1 bg-[#155DFC]/5 border border-[#155DFC]/10 rounded-lg text-[10px] font-bold text-[#155DFC]">{fullProgramCurriculum?.program}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Program Content */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Program Content</h3>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Updates</span>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-50 dark:divide-slate-900 overflow-hidden shadow-sm">
                            {displayCurriculum.map((module, mIdx) => (
                              <Accordion type="single" collapsible key={module.id} className="w-full">
                                <AccordionItem value={module.id} className="border-0">
                                  <AccordionTrigger className="px-3 sm:px-6 py-4 sm:py-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors hover:no-underline group cursor-pointer">
                                    <div className="flex items-center gap-3 sm:gap-5 w-full text-left">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-400 group-data-[state=open]:text-[#155DFC] group-data-[state=open]:border-blue-100 transition-all shrink-0">
                                        {String(mIdx + 1).padStart(2, '0')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase truncate">{module.title}</h4>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{module.duration} • {module.lessons.length} Blocks</p>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-3 sm:px-6 pb-6 sm:pb-8 pt-2">
                                    <div className="pl-0 sm:pl-14 space-y-4 sm:space-y-6">
                                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-3xl border-l-2 border-[#155DFC] pl-4 sm:pl-6 py-1">
                                        {module.description}
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {module.lessons.map((lesson) => (
                                          <a
                                            key={lesson.id}
                                            href={lesson.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/item flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-[#155DFC] hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                                {lesson.type === 'video' ? <Play size={12} className="text-[#155DFC] fill-[#155DFC]" /> : <FileText size={12} className="text-indigo-400" />}
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{lesson.title}</p>
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lesson.type} • {lesson.duration}</p>
                                              </div>
                                            </div>
                                            <ExternalLink size={12} className="text-slate-300 group-hover/item:text-[#155DFC] transition-colors" />
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
                      </>
                    ) : (
                      <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <BookOpen size={40} className="text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Syllabus Not Identified</h3>
                        <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto mb-6">Contact your supervisor to synchronize your domain pathway.</p>
                        <Button variant="outline" className="rounded-xl font-black text-[9px] h-10 px-6 uppercase tracking-widest cursor-pointer">Request Sync</Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== DAILY LOGS TAB ===== */}
                {activeTab === "reports" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Daily Logs</h2>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{logs.length} reports submitted</p>
                      </div>
                      <Button
                        onClick={() => setIsLogModalOpen(true)}
                        className="rounded-xl bg-[#155DFC] hover:bg-[#1A3CB9] h-9 sm:h-10 px-3 sm:px-5 font-bold text-[9px] sm:text-[10px] tracking-wider shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
                      >
                        <Plus size={12} className="mr-1" />
                        New Report
                      </Button>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search logs..."
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                        {["all", "approved", "pending", "rejected"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setLogFilter(f)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                              logFilter === f
                                ? "bg-[#155DFC] text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
                            )}
                          >
                            {f === "all" ? "All" : f === "approved" ? "Confirmed" : f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Log Cards - Sleek Horizontal Rectangles */}
                    {logs.length > 0 ? (
                      <div className="space-y-2">
                        {logs
                          .filter(log => {
                            const matchSearch = !logSearch || log.learning_log?.toLowerCase().includes(logSearch.toLowerCase());
                            const matchFilter = logFilter === "all" || log.status === logFilter;
                            return matchSearch && matchFilter;
                          })
                          .map((log) => (
                          <div key={log.id} className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 sm:px-4 py-3 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                            {/* Status Dot */}
                            <div className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              log.status === "approved" ? "bg-emerald-500" :
                                log.status === "rejected" ? "bg-rose-500" : "bg-amber-400"
                            )} />
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{log.learning_log}</p>
                              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                                <span className="text-[9px] text-slate-400 font-bold">{format(new Date(log.log_date), "MMM dd")}</span>
                                <span className="text-[9px] text-slate-300">•</span>
                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={9} />{log.check_in ? format(new Date(log.check_in), "HH:mm") : "--:--"}</span>
                                <span className="text-[9px] text-slate-300">•</span>
                                <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1"><Star size={9} />{log.experience_rating}/5</span>
                              </div>
                            </div>
                            {/* Status Badge */}
                            <Badge className={cn(
                              "rounded-lg px-2 py-0.5 text-[7px] sm:text-[8px] font-bold tracking-wider border-0 shrink-0",
                              log.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" :
                                log.status === "rejected" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10" :
                                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                            )}>
                              {log.status === "approved" ? "Confirmed" : (log.status || "Pending")}
                            </Badge>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 hidden sm:block" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <FileText size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">No reports yet</p>
                        <p className="text-[10px] text-slate-400 mt-1">Start by submitting your first daily log</p>
                        <Button
                          onClick={() => setIsLogModalOpen(true)}
                          className="mt-3 rounded-xl bg-blue-600 hover:bg-blue-700 h-9 px-5 font-bold text-[10px] cursor-pointer"
                        >
                          <Plus size={12} className="mr-1.5" /> Submit First Report
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
                              <th className="px-6 py-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider">Month</th>
                              <th className="px-6 py-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider">Verification Status</th>
                              <th className="px-6 py-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {paymentLedger.length > 0 ? (
                              paymentLedger.map((record: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
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
                                        className="h-8 rounded-lg text-[#155DFC] hover:text-[#1A3CB9] hover:bg-blue-50 dark:hover:bg-blue-900/10 text-[9px] font-bold tracking-wider cursor-pointer"
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
          </div>

          {/* Right Column: Dynamic Sidebar (Persistent context) */}
          <WorkspaceSidebar
            logs={logs}
            fellowInterns={fellowInterns}
            userWorkspaces={data.userWorkspaces}
            onOpenColleagues={() => setIsColleaguesModalOpen(true)}
          />
        </div>
      </main>

      {/* Floating QR Scan Button */}
      <div className="fixed bottom-28 right-4 lg:bottom-8 lg:right-8 z-50">
        <AttendanceScannerModal>
          <button className="group relative flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#155DFC] to-[#3B82F6] text-white shadow-[0_8px_30px_rgb(21,93,252,0.4)] transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgb(21,93,252,0.6)] focus:outline-none focus:ring-2 focus:ring-[#155DFC] focus:ring-offset-2 dark:focus:ring-offset-slate-950">
            <Camera className="h-6 w-6 lg:h-7 lg:w-7 transition-transform group-hover:scale-110" />
            <div className="absolute -top-12 right-0 w-max translate-y-2 opacity-0 transition-all group-hover:-translate-y-0 group-hover:opacity-100 pointer-events-none">
              <div className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xl dark:bg-slate-800 flex items-center gap-2">
                <Scan size={12} className="text-blue-400" />
                Scan Attendance
              </div>
            </div>
            {/* Little indicator ping */}
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3 lg:h-4 lg:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 lg:h-4 lg:w-4 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
              </span>
            </div>
          </button>
        </AttendanceScannerModal>
      </div>

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
