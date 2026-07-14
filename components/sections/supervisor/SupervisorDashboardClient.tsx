"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Star,
  User,
  ArrowUpRight,
  Eye,
  Plus,
  Check,
  X,
  LayoutDashboard,
  ClipboardCheck,
  ListTodo,
  Trash2,
  Send,
  Loader2,
  Award,
  Edit,
  AlertTriangle,
  UsersRound,
  ShieldCheck,
  Link,
  Paperclip,
  Upload,
  ChevronLeft,
  StarHalf,
  UserX,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LogReviewModal } from "./LogReviewModal";
import { AttendanceQRGenerator } from "./AttendanceQRGenerator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  markInternAttendance,
  assignInternshipTask, 
  deleteInternshipTask,
  submitBatchAttendance,
  submitWeeklyEvaluation
} from "@/lib/actions/supervisor.actions";

const isWithinWeeklyLimit = (dateString: string) => {
  if (!dateString) return false;
  const lastDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

interface SupervisorDashboardClientProps {
  data: {
    profile: any;
    workspace?: {
      id: string;
      type: "internship" | "program";
      title: string;
      company?: any;
    };
    interns: any[];
    recentLogs: any[];
    tasks: any[];
    attendance: any[];
    evaluations: any[];
  };
}

export function SupervisorDashboardClient({ data }: SupervisorDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "tasks" | "evaluations">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Task Form State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTask, setNewTask] = useState({
    internship_id: "",
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    resource_links: [] as { title: string; url: string }[],
    attachments: [] as { name: string; url: string; size: number; type: string }[],
    output_image: null as File | null,
    attachedFiles: [] as File[]
  });
  const [previews, setPreviews] = useState<{
    cover: string | null;
    files: { name: string; url: string; type: string }[];
  }>({ cover: null, files: [] });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; isGroup: boolean } | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  
  // Attendance Batch State
  const [pendingAttendance, setPendingAttendance] = useState<Record<string, string>>({});
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [showAttendanceSuccess, setShowAttendanceSuccess] = useState(false);
  const [internSearchTerm, setInternSearchTerm] = useState("");
  const [evalSearchTerm, setEvalSearchTerm] = useState("");
  const [evalFilter, setEvalFilter] = useState("all"); // all, pending, high, low
  const [selectedEvalIntern, setSelectedEvalIntern] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { interns, recentLogs, tasks, attendance, evaluations } = data;
  const router = useRouter();

  // Group bulk-assigned tasks (same title + description + supervisor_id) into one card
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, { representative: any; members: any[]; studentNames: string[] }>();
    tasks.forEach((task: any) => {
      const key = `${task.title}||${task.description}||${task.supervisor_id}`;
      if (!groups.has(key)) {
        groups.set(key, { representative: task, members: [task], studentNames: [] });
      } else {
        groups.get(key)!.members.push(task);
      }
      // Resolve student name for this task
      const targetIntern = interns.find((i: any) => i.id === task.internship_id);
      const student = targetIntern ? (Array.isArray(targetIntern.student) ? targetIntern.student[0] : targetIntern.student) : null;
      if (student?.full_name) groups.get(key)!.studentNames.push(student.full_name);
    });
    return Array.from(groups.values()).map(g => ({
      ...g.representative,
      isGroup: g.members.length > 1,
      memberCount: g.members.length,
      studentNames: g.studentNames
    }));
  }, [tasks, interns]);

  const filteredRecentLogs = useMemo(() => {
    return recentLogs.filter(log => {
      const student = Array.isArray(log.student) ? log.student[0] : log.student;
      return student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [recentLogs, searchTerm]);

  const filteredEvalInterns = useMemo(() => {
    return interns.filter(intern => {
      const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
      const matchesSearch = student?.full_name?.toLowerCase().includes(evalSearchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (evalFilter === "all") return true;
      
      const lastEval = evaluations.find(e => e.student_id === student?.user_id);
      const isPending = !lastEval || !isWithinWeeklyLimit(lastEval.evaluation_date);
      
      if (evalFilter === "pending") return isPending;
      if (evalFilter === "completed") return !isPending;
      
      if (evalFilter === "high") return lastEval && lastEval.overall_rating >= 4;
      if (evalFilter === "low") return lastEval && lastEval.overall_rating <= 2;
      
      return true;
    });
  }, [interns, evalSearchTerm, evalFilter, evaluations]);

  const filteredEvalLedger = useMemo(() => {
    // 1. Group by student_id and get the latest evaluation for each
    const latestEvals = new Map<string, any>();
    evaluations.forEach(e => {
      const studentId = e.student_id;
      if (!latestEvals.has(studentId) || new Date(e.created_at) > new Date(latestEvals.get(studentId).created_at)) {
        latestEvals.set(studentId, e);
      }
    });

    const uniqueEvals = Array.from(latestEvals.values());

    // 2. Filter by search term
    return uniqueEvals.filter(e => {
      const studentName = e.student?.full_name?.toLowerCase() || "";
      return studentName.includes(evalSearchTerm.toLowerCase());
    });
  }, [evaluations, evalSearchTerm]);

  const selectedInternHistory = useMemo(() => {
    if (!selectedEvalIntern) return [];
    const student = Array.isArray(selectedEvalIntern.student) ? selectedEvalIntern.student[0] : selectedEvalIntern.student;
    const studentId = student?.user_id || selectedEvalIntern.student_id;
    return evaluations.filter(e => e.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [evaluations, selectedEvalIntern]);

  const pendingReviews = recentLogs.filter(l => l.status === "pending" || !l.status).length;
  const approvedCount = recentLogs.filter(l => l.status === "approved").length;

  // Initialize pending attendance from existing data
  useEffect(() => {
    if (attendance && interns) {
      setPendingAttendance(prev => {
        const newMap = { ...prev };
        interns.forEach(intern => {
          const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
          const studentId = student?.user_id;
          if (!studentId) return;

          const record = attendance.find(a => a.student_id === studentId);
          
          // Only overwrite if not already in local state OR if record changed to 'present'
          if (!newMap[studentId] || (record && record.status === 'present')) {
             newMap[studentId] = record ? record.status : "absent";
          }
        });
        return newMap;
      });
    }
  }, [attendance, interns]);

  useEffect(() => {
    const supabase = createClient();
    const supervisorId = data.profile?.id;

    if (!supervisorId) return;

    const channel = supabase
      .channel(`supervisor-updates-${supervisorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internship_applications' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intern_logs' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internship_tasks' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intern_attendance' }, () => router.refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data.profile?.id, router]);

  const handleMarkAttendance = async (studentId: string, internshipId: string, status: string) => {
    // Single update fallback if needed, but we'll use batch below
    const res = await markInternAttendance(studentId, internshipId, status);
    if (res.success) {
      toast.success("Attendance updated");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update attendance");
    }
  };

  const handleToggleAttendance = (studentId: string) => {
    setPendingAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const handleSubmitBatchAttendance = async () => {
    setIsSubmittingBatch(true);
    try {
      const records = interns.map(intern => {
        const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
        return {
          studentId: student?.user_id,
          internshipId: intern.internship_id,
          status: pendingAttendance[student?.user_id] || "absent"
        };
      });

      const res = await submitBatchAttendance(records);
      if (res.success) {
        setShowAttendanceSuccess(true);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send attendance");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'attachment') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (type === 'cover') {
      const file = files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Cover image exceeds 3MB");
        return;
      }
      setNewTask(prev => ({ ...prev, output_image: file }));
      const url = URL.createObjectURL(file);
      setPreviews(prev => {
        if (prev.cover) URL.revokeObjectURL(prev.cover);
        return { ...prev, cover: url };
      });
    } else {
      const validFiles = files.filter(f => f.size <= 3 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error("Some files were skipped because they exceed 3MB.");
      }
      
      const newFiles = [...newTask.attachedFiles, ...validFiles];
      setNewTask(prev => ({ ...prev, attachedFiles: newFiles }));
      
      const newFilePreviews = validFiles.map(f => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type
      }));
      
      setPreviews(prev => ({
        ...prev,
        files: [...prev.files, ...newFilePreviews]
      }));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (!newTask.internship_id || !newTask.title) {
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSubmittingTask(true);
    try {
      const supabase = createClient();
      
      // 1. Upload Cover Image
      let imageUrl = "";
      if (newTask.output_image) {
        const fileExt = newTask.output_image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `task_outputs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task_attachments')
          .upload(filePath, newTask.output_image);

        if (uploadError) {
          console.error("Cover upload error:", uploadError);
          toast.error("Failed to upload cover image.");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('task_attachments')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      // 2. Upload Attachments
      const uploadedAttachments = [];
      for (const file of newTask.attachedFiles) {
        if (file.size > 3 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 3MB limit.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `tasks/${Date.now()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task_attachments')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('task_attachments')
            .getPublicUrl(filePath);
          
          uploadedAttachments.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }

      const cleanLinks = newTask.resource_links.filter(link => link.title.trim() !== "" && link.url.trim() !== "");

      const res = await assignInternshipTask({
        ...newTask,
        resource_links: cleanLinks,
        attachments: uploadedAttachments,
        output_image_url: imageUrl
      } as any);

      if (res.success) {
        toast.success("Task assigned successfully!");
        setIsTaskModalOpen(false);
        setCurrentStep(1);
        
        // Cleanup previews
        if (previews.cover) URL.revokeObjectURL(previews.cover);
        previews.files.forEach(f => URL.revokeObjectURL(f.url));
        setPreviews({ cover: null, files: [] });

        setNewTask({ 
          internship_id: "", 
          title: "", 
          description: "", 
          due_date: "", 
          priority: "medium",
          resource_links: [],
          attachments: [],
          output_image: null,
          attachedFiles: []
        });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign task");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingTask(true);
    try {
      const res = await deleteInternshipTask(deleteTarget.id, deleteTarget.isGroup);
      if (res.success) {
        toast.success(deleteTarget.isGroup ? "Task group deleted from all interns" : "Task deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete task");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeletingTask(false);
      setDeleteTarget(null);
    }
  };

  const isAttendanceWindow = () => {
    const hour = new Date().getHours();
    return hour >= 15; // 3pm onwards
  };

  // Evaluation Form State
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [newEval, setNewEval] = useState<{
    id?: string;
    internship_id: string;
    student_id: string;
    rating: number;
    feedback: string;
  }>({
    internship_id: "",
    student_id: "",
    rating: 5,
    feedback: ""
  });
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [existingEval, setExistingEval] = useState<any>(null);


  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEval.internship_id || !newEval.student_id || !newEval.feedback) {
      toast.error("Please fill in all fields.");
      return;
    }

    const wordCount = newEval.feedback.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 8) {
      toast.error(`Feedback must be at least 8 words. Current: ${wordCount}`);
      return;
    }

    setIsSubmittingEval(true);
    try {
      const res = await submitWeeklyEvaluation(newEval);
      if (res.success) {
        toast.success(newEval.id ? "Evaluation updated successfully!" : "Evaluation submitted successfully!");
        setIsEvalModalOpen(false);
        setNewEval({ id: undefined, internship_id: "", student_id: "", rating: 5, feedback: "" } as any);
        router.refresh();
      } else if (res.error === "WEEKLY_LIMIT_REACHED") {
        // Carry existing eval data for editing
        setExistingEval(res.existingEval);
        setShowLimitModal(true);
      } else {
        toast.error(res.error || "Failed to submit evaluation");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingEval(false);
    }
  };


  const startEditing = () => {
    if (existingEval) {
      setNewEval({
        id: existingEval.id,
        internship_id: existingEval.internship_id,
        student_id: existingEval.student_id,
        rating: existingEval.overall_rating,
        feedback: existingEval.comments
      });
      setShowLimitModal(false);
      setIsEvalModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      
      {/* Log Review Modal */}
      {selectedLog && (
        <LogReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedLog(null);
          }} 
          log={selectedLog}
        />
      )}

      {/* ===== HEADER ===== */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          {/* Workspace Context Bar */}
          {data.workspace && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <a href="/supervisor" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#155DFC] transition-colors group">
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Switch
              </a>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <Badge className={cn(
                "text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded-md border-0",
                data.workspace.type === "program" 
                  ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              )}>
                {data.workspace.type === "program" ? "PROGRAM" : "INTERNSHIP"}
              </Badge>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                {data.workspace.title}
              </span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC] animate-pulse" />
                <Badge className="bg-blue-50/50 dark:bg-blue-600/10 text-[#155DFC] border-0 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-lg">
                  Supervisor Portal
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Hello, {data.profile?.full_name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 tracking-tight">
                {data.workspace 
                  ? `Managing ${data.workspace.title} — ${interns.length} intern${interns.length !== 1 ? "s" : ""} assigned.`
                  : "Synchronize your team, track milestones, and drive internship excellence."
                }
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md p-1 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {[
                { id: "overview", icon: LayoutDashboard, label: "Dashboard" },
                { id: "attendance", icon: ClipboardCheck, label: "Attendance Hub" },
                { id: "tasks", icon: ListTodo, label: "Strategic Tasks" },
                { id: "evaluations", icon: Award, label: "Evaluations" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider transition-all duration-300 relative group",
                    activeTab === tab.id 
                      ? "bg-[#155DFC] text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                  )}
                >
                  <tab.icon size={14} strokeWidth={2.5} className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                  )} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* High-Fidelity Data Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Team Size", value: interns.length, icon: Users, color: "blue", brand: true },
                  { label: "Pending Logs", value: pendingReviews, icon: Clock, color: "amber", highlight: true },
                  { label: "Approved Stats", value: approvedCount, icon: CheckCircle2, color: "emerald" },
                  { label: "Active Tasks", value: tasks.length, icon: ListTodo, color: "indigo" }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-7 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105 shadow-sm",
                      stat.brand ? "bg-[#155DFC] text-white" : "",
                      !stat.brand && stat.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
                      stat.color === "amber" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
                      stat.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
                      stat.color === "indigo" && "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                    )}>
                      <stat.icon size={18} strokeWidth={2} />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1.5">{stat.label}</p>
                    <p className={cn(
                      "text-2xl font-bold tracking-tight transition-colors",
                      stat.highlight ? "text-amber-500" : "text-slate-900 dark:text-white"
                    )}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Immersive Submissions List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-1">LATEST INTERN REPORTS</p>
                    </div>
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                      <Input 
                        placeholder="Filter by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-800 px-4 text-xs font-medium w-56 transition-all focus:w-64 focus:bg-white focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredRecentLogs.length > 0 ? filteredRecentLogs.map((log, idx) => {
                      const student = Array.isArray(log.student) ? log.student[0] : log.student;
                      const isPending = !log.status || log.status === "pending";
                      return (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex items-center gap-6 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300"
                        >
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden border-2 border-white dark:border-slate-800 shadow-md group-hover:rotate-3 transition-transform">
                               <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" fill className="object-cover" />
                            </div>
                            {isPending && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white ring-2 ring-amber-100" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">{student?.full_name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-300" /> {format(new Date(log.log_date), "MMM dd, yyyy")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-300" /> Daily Report
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                             <Badge className={cn(
                               "text-[8px] font-bold tracking-wider px-2.5 py-1 rounded-lg border-0", 
                               isPending ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                             )}>
                                {log.status === "approved" ? "Confirmed" : (isPending ? "Pending Review" : log.status)}
                             </Badge>
                             <Button 
                              onClick={() => { setSelectedLog(log); setIsReviewModalOpen(true); }}
                              className="h-8 px-4 text-[9px] font-bold tracking-wider rounded-xl bg-[#155DFC] text-white hover:bg-[#1A3CB9] transition-all shadow-lg shadow-blue-500/10"
                             >
                               Review Report
                             </Button>
                          </div>
                        </motion.div>
                      )
                    }) : (
                      <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <FileText className="mx-auto mb-4 text-slate-200" size={40} />
                        <p className="text-slate-400 font-bold text-base tracking-tight">System Standing By</p>
                        <p className="text-slate-400 text-[9px] font-bold mt-1 tracking-widest">No Logs Submitted For Review</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aesthetic Right Sidebar */}
                <div className="space-y-8">
                  {/* High-Impact Attendance Banner */}
                  <div className={cn(
                    "relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-500",
                    isAttendanceWindow() 
                      ? "bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] text-white shadow-blue-500/20" 
                      : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                  )}>
                    {isAttendanceWindow() && (
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[60px]" />
                    )}
                    
                    <div className="relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm",
                        isAttendanceWindow() ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}>
                        <ClipboardCheck size={20} strokeWidth={2} />
                      </div>
                      
                      <h3 className={cn("text-lg font-bold mb-1.5 tracking-tight", isAttendanceWindow() ? "text-white" : "text-slate-900 dark:text-white")}>
                        Daily <span className={isAttendanceWindow() ? "text-blue-200" : "text-[#155DFC]"}>Attendance</span>
                      </h3>
                      
                      <p className={cn("text-[10px] font-medium leading-relaxed mb-6", isAttendanceWindow() ? "text-blue-100/70" : "text-slate-500")}>
                        {isAttendanceWindow() 
                          ? "The portal is now receiving attendance logs. Confirm your team status for today's session." 
                          : "Attendance window opens daily at 15:00. Ensure all present interns are logged by midnight."}
                      </p>

                      <Button 
                        onClick={() => setActiveTab("attendance")}
                        className={cn(
                          "w-full rounded-xl font-bold text-[9px] tracking-wider h-11 shadow-lg transition-transform active:scale-[0.98]",
                          isAttendanceWindow() 
                            ? "bg-white text-[#155DFC] hover:bg-blue-50 shadow-white/10" 
                            : "bg-[#155DFC] text-white hover:bg-[#1A3CB9] shadow-blue-500/10"
                        )}
                      >
                        {isAttendanceWindow() ? "Mark Attendance Now" : "View Records"}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Connect */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/10 rounded-bl-full translate-x-12 -translate-y-12" />
                    
                    <h3 className="text-[9px] font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-3 relative z-10">
                       <div className="w-8 h-8 bg-[#155DFC] rounded-xl flex items-center justify-center text-white">
                         <MessageSquare size={14} strokeWidth={2} />
                       </div>
                       Direct Connect
                    </h3>

                    <div className="space-y-4 relative z-10">
                      {interns.slice(0, 5).map((i, idx) => {
                        const student = Array.isArray(i.student) ? i.student[0] : i.student;
                        return (
                          <div 
                            key={i.id} 
                            className="flex items-center gap-4 group/item cursor-pointer"
                          >
                            <div className="relative w-10 h-10">
                              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                                 <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" fill className="object-cover" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate tracking-tight group-hover/item:text-[#155DFC] transition-colors">{student?.full_name}</p>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <p className="text-[8px] font-bold text-slate-400 tracking-widest">Active Session</p>
                               </div>
                            </div>
                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#155DFC] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                              <Send size={12} strokeWidth={2} />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <Button variant="ghost" className="w-full mt-6 rounded-xl font-bold text-[9px] tracking-wider text-slate-400 hover:text-[#155DFC]">
                      Expand Directory
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "attendance" && (
            <motion.div 
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Attendance Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-1">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#155DFC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <ClipboardCheck size={20} strokeWidth={2} />
                    </div>
                    <Badge className={cn(
                      "font-bold text-[8px] tracking-wider px-3 py-1 border-0 rounded-lg",
                      isAttendanceWindow() ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {isAttendanceWindow() ? "Logging Live" : "Window Secured"}
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    Daily <span className="text-[#155DFC]">Roll Call</span>
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest">
                    Confirm Session Participation & Track Momentum
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-bold text-slate-400 tracking-widest mb-1">Total</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{interns.length}</p>
                  </div>
                  <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-bold text-emerald-500 tracking-widest mb-1">Present</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {Object.values(pendingAttendance).filter(v => v === 'present').length}
                    </p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-[8px] font-bold text-rose-500 tracking-widest mb-1">Absent</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {interns.length - Object.values(pendingAttendance).filter(v => v === 'present').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Generator for Printed Posters */}
              {data.workspace && (
                <AttendanceQRGenerator 
                  internshipId={data.workspace.id}
                  internshipTitle={data.workspace.title}
                  companyName={data.workspace.company?.company_name}
                />
              )}

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Register Trainees</h3>
                   <p className="text-[10px] text-slate-500 mt-1 max-w-sm tracking-tight leading-relaxed">Search through your assigned interns to mark them present quickly. Unmarked interns default to absent.</p>
                 </div>
                 
                 <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input 
                      placeholder="Search intern name..." 
                      value={internSearchTerm}
                      onChange={(e) => setInternSearchTerm(e.target.value)}
                      className="pl-10 h-11 w-full sm:w-64 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-800 text-xs font-bold tracking-tight focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                 </div>
              </div>

              {/* Intern List/Grid with bottom padding for mobile tab bar */}
              <div className={cn(
                "grid gap-4 sm:gap-6 md:grid-cols-2 pb-32 md:pb-12",
                !isAttendanceWindow() && "opacity-50 pointer-events-none grayscale-[0.5]"
              )}>
                {interns.filter((intern) => {
                  const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
                  if (!internSearchTerm) return true;
                  return student?.full_name?.toLowerCase().includes(internSearchTerm.toLowerCase());
                }).map((intern, idx) => {
                  const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
                  const confirmedRecord = attendance.find(a => a.student_id === student?.user_id);
                  const isLocked = !!confirmedRecord && confirmedRecord.status === 'present';
                  const status = pendingAttendance[student?.user_id] || "absent";
                  const isPresent = status === "present";

                  return (
                    <motion.div
                      key={intern.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "group bg-white dark:bg-slate-900 border transition-all duration-300 rounded-xl p-4 sm:p-5 flex items-center gap-4",
                        isPresent ? "border-[#155DFC]/15 bg-blue-50/30" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0">
                        <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                          <Image 
                            src={student?.avatar_url || "/default-avatar.svg"} 
                            alt="" 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate mb-0.5">
                          {student?.full_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] font-bold text-slate-400 border-slate-200 tracking-wider px-2 py-0">
                            {intern.internship?.category || "Trainee"}
                          </Badge>
                          <span className="text-[9px] font-bold text-slate-400 truncate hidden sm:inline">
                            @{student?.username || 'intern'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          disabled={isLocked || !isAttendanceWindow()}
                          onClick={() => student?.user_id && !isLocked && handleToggleAttendance(student.user_id)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                            isPresent 
                              ? "bg-[#155DFC] border-[#155DFC] text-white shadow-lg shadow-blue-500/20" 
                              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-200 hover:border-[#155DFC] hover:text-[#155DFC]"
                          )}
                        >
                          <Check size={18} className={cn(
                            "transition-all duration-300 scale-0",
                            isPresent && "scale-100 stroke-[3]"
                          )} />
                          {!isPresent && <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                        </button>
                        {isLocked ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                            <ShieldCheck size={10} className="text-[#155DFC]" />
                            <p className="text-[8px] font-bold tracking-wider text-[#155DFC]">
                              Confirmed
                            </p>
                          </div>
                        ) : (
                          <p className={cn(
                            "text-[8px] font-bold tracking-wider transition-all duration-300",
                            isPresent ? "text-slate-900" : "text-slate-300"
                          )}>
                            {isPresent ? "Present" : "Absent"}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-8 flex justify-center">
                <Button 
                  onClick={handleSubmitBatchAttendance}
                  disabled={!isAttendanceWindow() || isSubmittingBatch || interns.length === 0}
                  className={cn(
                    "relative group overflow-hidden rounded-xl h-12 min-w-[260px] sm:min-w-[320px] px-8 font-bold text-[10px] transition-all duration-500 tracking-wider shadow-lg",
                    isAttendanceWindow() 
                      ? "bg-[#155DFC] hover:bg-[#1A3CB9] text-white shadow-blue-500/20" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <div className="relative flex items-center justify-center gap-3">
                    {isSubmittingBatch ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle2 size={18} className="text-blue-200 group-hover:scale-110 transition-transform" />
                    )}
                    <span>Submit Attendance Log</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Mission Control</h2>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-1">Assign & Track Project Milestones</p>
                </div>
                <Button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="rounded-xl bg-[#155DFC] text-white hover:bg-[#1A3CB9] font-bold text-[9px] tracking-wider px-6 h-11 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <Plus size={14} strokeWidth={2.5} className="mr-2" /> New Milestone
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTasks.length > 0 ? groupedTasks.map((task: any, idx: number) => {
                  const targetIntern = interns.find((i: any) => i.id === task.internship_id);
                  const student = targetIntern ? (Array.isArray(targetIntern.student) ? targetIntern.student[0] : targetIntern.student) : null;
                  
                  return (
                    <motion.div 
                      key={task.isGroup ? `group-${task.title}-${task.supervisor_id}` : task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/30 dark:hover:shadow-none transition-all duration-400 hover:-translate-y-1 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "border-0 font-bold text-[8px] tracking-wider px-2.5 py-1 rounded-lg",
                            task.priority === "high" || task.priority === "critical" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                          )}>
                            {(task.priority || "Standard").charAt(0).toUpperCase() + (task.priority || "standard").slice(1)}
                          </Badge>
                          {task.isGroup && (
                            <Badge className="border-0 font-bold text-[8px] tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-[#155DFC]">
                              <UsersRound size={10} className="mr-1" /> Team
                            </Badge>
                          )}
                        </div>
                        <button 
                          onClick={() => setDeleteTarget({ id: task.id, title: task.title, isGroup: task.isGroup })} 
                          className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight mb-2 group-hover:text-[#155DFC] transition-colors line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-3 mb-6 leading-relaxed flex-1">
                        {task.description}
                      </p>

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        {task.isGroup ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#155DFC]/10 flex items-center justify-center">
                              <UsersRound size={14} className="text-[#155DFC]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-900 dark:text-white">Assigned To All</span>
                              <span className="text-[8px] font-medium text-slate-400">{task.memberCount} Interns</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden shadow-sm border border-slate-100">
                              <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" fill className="object-cover" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                              {student ? student.full_name : "General"}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-bold text-slate-300 tracking-widest mb-0.5">Due Date</span>
                          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100">
                            {task.due_date ? format(new Date(task.due_date), "MMM dd, yyyy") : "None"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                     <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <ListTodo className="text-slate-200" size={28} />
                     </div>
                     <p className="text-slate-900 dark:text-white font-bold text-base tracking-tight">Mission Board Empty</p>
                     <p className="text-slate-400 text-[9px] font-bold mt-1 tracking-widest">No Active Milestones Recorded</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "evaluations" && (
            <motion.div 
              key="evaluations"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Performance Tracker</h2>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-1">Drive Excellence Through Feedback</p>
                </div>
                <Button 
                  onClick={() => setIsEvalModalOpen(true)}
                  className="rounded-xl bg-[#155DFC] text-white hover:bg-[#1A3CB9] font-bold text-[9px] tracking-wider px-6 h-11 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <Plus size={14} strokeWidth={2.5} className="mr-2" /> New Evaluation
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search students by name..."
                    value={evalSearchTerm}
                    onChange={(e) => setEvalSearchTerm(e.target.value)}
                    className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'All Students', icon: Users },
                    { id: 'pending', label: 'Pending', icon: Clock },
                    { id: 'completed', label: 'Evaluated', icon: CheckCircle2 },
                    { id: 'high', label: 'High Rating', icon: Star },
                    { id: 'low', label: 'Low Rating', icon: StarHalf }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setEvalFilter(f.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 h-12 rounded-2xl text-[10px] font-bold whitespace-nowrap transition-all border",
                        evalFilter === f.id
                          ? "bg-[#155DFC] border-[#155DFC] text-white shadow-lg shadow-blue-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <f.icon size={14} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Scoreboard */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvalInterns.map((intern, idx) => {
                  const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
                  const lastEval = evaluations.find(e => e.student_id === student?.user_id);
                  const hasWeeklyEval = lastEval && isWithinWeeklyLimit(lastEval.evaluation_date);

                  return (
                    <motion.div
                      key={intern.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-400 flex flex-col items-center text-center group"
                    >
                      <div className="relative mb-4">
                        <div className="w-18 h-18 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg">
                          <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" fill className="object-cover" />
                        </div>
                        {hasWeeklyEval ? (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-lg shadow-md border-2 border-white">
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-lg shadow-md border-2 border-white">
                            <Clock size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-0.5">{student?.full_name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-4">{intern.internship?.title}</p>

                      <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                        <p className="text-[8px] font-bold text-slate-400 tracking-widest mb-2">Latest Performance</p>
                        {lastEval ? (
                          <div className="flex flex-col items-center">
                            <div className="flex gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} className={cn(i < lastEval.overall_rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium italic line-clamp-2 px-2">"{lastEval.comments}"</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-300 italic py-2">No Records Found</p>
                        )}
                      </div>

                      <Button 
                        onClick={() => {
                          if (hasWeeklyEval) {
                            setNewEval({
                              id: lastEval.id,
                              internship_id: intern.internship_id,
                              student_id: student?.user_id,
                              rating: lastEval.overall_rating,
                              feedback: lastEval.comments
                            });
                          } else {
                            setNewEval({
                              internship_id: intern.internship_id,
                              student_id: student?.user_id,
                              rating: 5,
                              feedback: ""
                            });
                          }
                          setIsEvalModalOpen(true);
                        }}
                        className={cn(
                          "w-full rounded-xl h-11 font-bold text-[9px] tracking-wider transition-all",
                          hasWeeklyEval 
                           ? "bg-slate-50 text-slate-900 border border-slate-100 hover:bg-white hover:border-[#155DFC] hover:text-[#155DFC]" 
                           : "bg-[#155DFC] text-white hover:bg-[#1A3CB9] shadow-lg shadow-blue-500/10"
                        )}
                      >
                        {hasWeeklyEval ? "Update Feedback" : "Start Evaluation"}
                      </Button>
                    </motion.div>
                   )
                })}
                {filteredEvalInterns.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <UserX className="mx-auto mb-3 text-slate-200" size={32} />
                    <p className="text-slate-400 font-bold text-xs tracking-tight">No students match your criteria</p>
                  </div>
                )}
              </div>

              {/* Precise Evaluation Ledger */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Evaluation Ledger</h3>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">Historical Performance Logs</p>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                          <tr>
                             <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-widest">Student Identity</th>
                             <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-widest">Score</th>
                             <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-widest">Session Date</th>
                             <th className="px-6 py-3 text-[9px] font-bold text-slate-400 tracking-widest text-right">Details</th>
                          </tr>
                       </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                           {filteredEvalLedger.map(e => (
                             <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                      <Image src={e.student?.avatar_url || "/default-avatar.svg"} alt="" width={32} height={32} className="object-cover" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">{e.student?.full_name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={11} className={cn(i < e.overall_rating ? "text-amber-500 fill-amber-500" : "text-slate-100")} />
                                      ))}
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 tracking-wider">
                                  {format(new Date(e.created_at), "MMMM dd, yyyy")}
                                </td>
                                 <td className="px-6 py-4 text-right">
                                    <Button 
                                      onClick={() => {
                                        setSelectedEvalIntern(e);
                                        setIsHistoryModalOpen(true);
                                      }}
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-[#155DFC] hover:bg-blue-50 transition-all"
                                    >
                                      <Eye size={14} strokeWidth={2} />
                                    </Button>
                                 </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                     {filteredEvalLedger.length === 0 && (
                      <div className="p-20 text-center">
                         <FileText className="mx-auto mb-3 text-slate-100" size={48} />
                         <p className="text-slate-300 font-bold text-base tracking-tight">No Entries In Ledger</p>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NEW TASK MODAL */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsTaskModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] dark:shadow-none overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#155DFC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    {currentStep === 1 ? <Plus size={20} strokeWidth={2.5} /> : <Paperclip size={20} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {currentStep === 1 ? "Deploy Mission" : "Resource Intelligence"}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">
                      {currentStep === 1 ? "Phase 01: Core Objectives" : "Phase 02: Supporting Materials"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full transition-all duration-300", currentStep === 1 ? "bg-[#155DFC] w-6" : "bg-slate-200")} />
                   <div className={cn("w-2 h-2 rounded-full transition-all duration-300", currentStep === 2 ? "bg-[#155DFC] w-6" : "bg-slate-200")} />
                </div>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 ? (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Target Identity</label>
                          <select 
                            value={newTask.internship_id}
                            onChange={(e) => setNewTask({...newTask, internship_id: e.target.value})}
                            className="w-full h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-xs font-bold tracking-tight focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select Intern...</option>
                            <option value="all" className="font-bold text-[#155DFC]">🚀 Full Team Deployment</option>
                            {interns.map(i => (
                              <option key={i.id} value={i.id}>
                                {(Array.isArray(i.student) ? i.student[0] : i.student)?.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newTask.internship_id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 md:col-span-2"
                          >
                             <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20 flex items-center justify-between gap-3">
                               <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 p-0.5 shadow-sm overflow-hidden shrink-0">
                                    {newTask.internship_id === "all" ? (
                                      <div className="w-full h-full bg-[#155DFC] flex items-center justify-center text-white">
                                        <UsersRound size={18} />
                                      </div>
                                    ) : (
                                      <div className="relative w-full h-full">
                                        <Image 
                                          src={(Array.isArray(interns.find(i => i.id === newTask.internship_id)?.student) 
                                            ? interns.find(i => i.id === newTask.internship_id)?.student[0] 
                                            : interns.find(i => i.id === newTask.internship_id)?.student)?.avatar_url || "/default-avatar.svg"} 
                                          alt="" fill className="object-cover" 
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                                      {newTask.internship_id === "all" ? "Strategic Team Deployment" : (Array.isArray(interns.find(i => i.id === newTask.internship_id)?.student) 
                                        ? interns.find(i => i.id === newTask.internship_id)?.student[0] 
                                        : interns.find(i => i.id === newTask.internship_id)?.student)?.full_name}
                                    </p>
                                    <p className="text-[8px] font-bold text-[#155DFC] tracking-widest uppercase mt-0.5">Mission Recipient Locked</p>
                                  </div>
                               </div>
                               <Badge className="bg-[#155DFC] text-white text-[8px] font-bold border-0 h-6">DYNAMIC</Badge>
                             </div>
                          </motion.div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Mission Priority</label>
                          <select 
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                            className="w-full h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Standard</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Mission Call-sign</label>
                        <Input 
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          placeholder="e.g. Core Architecture Phase"
                          className="h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-sm font-bold tracking-tight focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Mission Intelligence</label>
                        <Textarea 
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          placeholder="Define objectives and requirements..."
                          className="min-h-[120px] rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-medium resize-none focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Deadline Horizon</label>
                        <Input 
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                          className="h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                          required
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Cover Image Upload & Preview */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase">Mission Cover Image</label>
                        <div className="relative group">
                          {previews.cover ? (
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                              <Image src={previews.cover} alt="Cover" fill className="object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (previews.cover) URL.revokeObjectURL(previews.cover);
                                  setPreviews(p => ({ ...p, cover: null }));
                                  setNewTask(p => ({ ...p, output_image: null }));
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="relative h-24 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950 hover:border-[#155DFC] transition-colors">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'cover')}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <Upload size={20} className="text-slate-300 mb-1" />
                              <span className="text-[10px] font-bold text-slate-400">Add Cover Image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resource Links Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                             <Link size={12} className="text-[#155DFC]" /> Resource Links
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setNewTask({...newTask, resource_links: [...newTask.resource_links, { title: "", url: "" }]})}
                            className="text-[9px] font-bold text-[#155DFC] hover:underline"
                          >
                            + ADD LINK
                          </button>
                        </div>
                        <div className="space-y-2.5">
                          {newTask.resource_links.map((link, idx) => (
                            <div key={idx} className="flex gap-2 items-center group">
                              <Input 
                                placeholder="Title" 
                                value={link.title}
                                onChange={(e) => {
                                  const updated = [...newTask.resource_links];
                                  updated[idx].title = e.target.value;
                                  setNewTask({...newTask, resource_links: updated});
                                }}
                                className="flex-1 h-10 rounded-xl text-xs font-bold border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                              />
                              <Input 
                                placeholder="URL" 
                                value={link.url}
                                onChange={(e) => {
                                  const updated = [...newTask.resource_links];
                                  updated[idx].url = e.target.value;
                                  setNewTask({...newTask, resource_links: updated});
                                }}
                                className="flex-[2] h-10 rounded-xl text-xs border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updated = newTask.resource_links.filter((_, i) => i !== idx);
                                  setNewTask({...newTask, resource_links: updated});
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {newTask.resource_links.length === 0 && (
                            <div className="text-center py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
                              <p className="text-[10px] text-slate-400 font-medium italic">No intelligence links projected</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Upload Section */}
                      <div className="space-y-4">
                        <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 uppercase flex items-center gap-2">
                           <Paperclip size={12} className="text-[#155DFC]" /> Attachments (Max 3MB)
                        </label>
                        
                        <div className="relative">
                          <input 
                            type="file" 
                            multiple 
                            onChange={(e) => handleFileChange(e, 'attachment')}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            accept=".pdf,.doc,.docx,.txt,.md,image/*"
                          />
                          <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#155DFC] transition-all bg-slate-50/50 dark:bg-slate-950">
                            <Upload size={20} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400">Click or drag materials here</p>
                            <p className="text-[8px] text-slate-300 mt-1 uppercase font-black tracking-tighter">PDF • DOC • TXT • MD • IMAGES</p>
                          </div>
                        </div>

                        {/* File Previews */}
                        <div className="grid grid-cols-2 gap-3">
                          {previews.files.map((file, idx) => (
                            <div key={idx} className="relative group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                {file.type.startsWith('image/') ? (
                                   <div className="relative w-full h-full rounded-lg overflow-hidden">
                                      <Image src={file.url} alt="" fill className="object-cover" />
                                   </div>
                                ) : (
                                   <FileText size={14} className="text-[#155DFC]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-[8px] font-medium text-slate-400">Ready for uplink</p>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => {
                                  URL.revokeObjectURL(file.url);
                                  const updatedPreviews = previews.files.filter((_, i) => i !== idx);
                                  const updatedFiles = newTask.attachedFiles.filter((_, i) => i !== idx);
                                  setPreviews(p => ({ ...p, files: updatedPreviews }));
                                  setNewTask(p => ({ ...p, attachedFiles: updatedFiles }));
                                }}
                                className="w-6 h-6 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6 flex gap-3">
                   {currentStep === 2 && (
                     <Button 
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      variant="ghost" 
                      className="rounded-xl h-11 font-bold text-[9px] tracking-wider hover:bg-slate-50 px-6 border border-transparent hover:border-slate-100"
                     >
                       <ChevronLeft size={14} className="mr-2" /> Back
                     </Button>
                   )}
                   <Button 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    variant="ghost" 
                    className={cn(
                      "rounded-xl h-11 font-bold text-[9px] tracking-wider hover:bg-slate-50 px-6",
                      currentStep === 2 ? "hidden sm:flex" : "flex-1"
                    )}
                   >
                     Cancel
                   </Button>
                   <Button 
                    type="submit"
                    disabled={isSubmittingTask}
                    className="flex-[2] rounded-xl h-11 font-bold text-[9px] tracking-wider bg-[#155DFC] text-white hover:bg-[#1A3CB9] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                   >
                     {isSubmittingTask ? (
                       <Loader2 className="animate-spin" />
                     ) : currentStep === 1 ? (
                       <span className="flex items-center gap-2">Project Details <ChevronRight size={14} /></span>
                     ) : (
                       "Deploy Mission"
                     )}
                   </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW EVALUATION MODAL */}
      <AnimatePresence>
        {isEvalModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsEvalModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] dark:shadow-none overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-[#155DFC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Award size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Merit Review</h3>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">Record Performance & Feedback</p>
                </div>
              </div>

              <form onSubmit={handleSubmitEvaluation} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1">Identify Student</label>
                  <select 
                    value={newEval.student_id}
                    onChange={(e) => {
                      const intern = interns.find(i => (Array.isArray(i.student) ? i.student[0] : i.student)?.user_id === e.target.value);
                      setNewEval({...newEval, student_id: e.target.value, internship_id: intern?.internship_id || ""});
                    }}
                    className="w-full h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-xs font-bold tracking-tight focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Student...</option>
                    {interns.map(i => (
                      <option key={i.id} value={(Array.isArray(i.student) ? i.student[0] : i.student)?.user_id}>
                        {(Array.isArray(i.student) ? i.student[0] : i.student)?.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest px-1 text-center block w-full mb-1">Performance Score</label>
                  <div className="flex items-center justify-center gap-5">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button
                         key={star}
                         type="button"
                         onClick={() => setNewEval({...newEval, rating: star})}
                         className="transition-all transform active:scale-75 hover:scale-110"
                       >
                         <Star 
                           size={30} 
                           strokeWidth={star <= newEval.rating ? 0 : 2}
                           className={cn(
                             "transition-all duration-300",
                             star <= newEval.rating ? "text-amber-500 fill-amber-500 drop-shadow-lg" : "text-slate-200"
                           )} 
                         />
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest">Merit Intelligence</label>
                    <span className={cn(
                      "text-[8px] font-bold tracking-widest",
                      newEval.feedback.trim().split(/\s+/).filter(Boolean).length >= 8 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {newEval.feedback.trim().split(/\s+/).filter(Boolean).length} / 8 Words
                    </span>
                  </div>
                  <Textarea 
                    value={newEval.feedback}
                    onChange={(e) => setNewEval({...newEval, feedback: e.target.value})}
                    placeholder="Provide a detailed evaluation of performance, trajectory, and mission success..."
                    className="min-h-[130px] rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs font-medium resize-none focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                   <Button 
                    type="button"
                    onClick={() => {
                        setIsEvalModalOpen(false);
                        setNewEval({ id: undefined, internship_id: "", student_id: "", rating: 5, feedback: "" } as any);
                    }}
                    variant="ghost" 
                    className="flex-1 rounded-xl h-11 font-bold text-[9px] tracking-wider hover:bg-slate-50"
                   >
                     Cancel Review
                   </Button>
                   <Button 
                    type="submit"
                    disabled={isSubmittingEval || newEval.feedback.trim().split(/\s+/).filter(Boolean).length < 8}
                    className="flex-[2] rounded-xl h-11 font-bold text-[9px] tracking-wider bg-[#155DFC] text-white hover:bg-[#1A3CB9] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                   >
                     {isSubmittingEval ? <Loader2 className="animate-spin" /> : (newEval.id ? "Update Record" : "Log Performance")}
                   </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WEEKLY LIMIT MODAL */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowLimitModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Weekly Limit Reached</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                You have already evaluated this student this week. Evaluations are recorded once per week to track gradual progress.
              </p>
              <div className="space-y-3">
                <Button 
                    onClick={startEditing}
                    className="w-full rounded-2xl h-14 font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                >
                    EDIT EXISTING FEEDBACK
                </Button>
                <Button 
                    onClick={() => {
                        setShowLimitModal(false);
                        setIsEvalModalOpen(false);
                    }}
                    variant="ghost"
                    className="w-full rounded-2xl h-14 font-black text-slate-400 hover:text-slate-600"
                >
                    CLOSE
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATTENDANCE SUCCESS MODAL */}
      <AnimatePresence>
        {showAttendanceSuccess && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowAttendanceSuccess(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center border border-slate-100 dark:border-slate-800"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
                <CheckCircle2 size={40} className="drop-shadow-sm" />
              </div>
              
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Logs Secured</h3>
              <p className="relative z-10 text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Daily attendance has been synchronized. All operations are nominal.
              </p>
              
              <div className="relative z-10 space-y-3">
                <Button 
                    onClick={() => setShowAttendanceSuccess(false)}
                    className="w-full rounded-2xl h-14 font-black text-[10px] tracking-wider bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                    ACKNOWLEDGE
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => !isDeletingTask && setDeleteTarget(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-5 text-rose-500">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">Delete Task</h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-1">
                Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">&ldquo;{deleteTarget.title}&rdquo;</span>?
              </p>
              {deleteTarget.isGroup && (
                <p className="text-[10px] font-bold text-rose-500 bg-rose-50 rounded-lg px-3 py-1.5 mt-2 inline-block">
                  This will remove the task from all assigned interns
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeletingTask}
                    variant="ghost" 
                    className="flex-1 rounded-xl h-11 font-bold text-[9px] tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                    onClick={handleConfirmDelete}
                    disabled={isDeletingTask}
                    className="flex-[2] rounded-xl h-11 font-bold text-[9px] tracking-wider bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
                >
                  {isDeletingTask ? <Loader2 className="animate-spin" size={16} /> : "Delete Task"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* EVALUATION HISTORY MODAL */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedEvalIntern && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsHistoryModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                    <Image 
                      src={(selectedEvalIntern.student?.avatar_url || selectedEvalIntern.avatar_url) || "/default-avatar.svg"} 
                      alt="" fill className="object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {(selectedEvalIntern.student?.full_name || selectedEvalIntern.full_name) || "Student Performance History"}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Verified Session Records</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {selectedInternHistory.map((entry: any, index: number) => (
                  <div key={entry.id} className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 last:border-l-0 pb-2">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-[#155DFC]" />
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-50 dark:border-slate-700/50">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[#155DFC] tracking-widest uppercase">
                          Week Record • {format(new Date(entry.created_at || entry.evaluation_date), "MMM dd, yyyy")}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={cn(i < entry.overall_rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{entry.comments || entry.feedback}"
                      </p>
                    </div>
                  </div>
                ))}
                {selectedInternHistory.length === 0 && (
                  <div className="text-center py-20">
                    <Award className="mx-auto mb-4 text-slate-100" size={48} />
                    <p className="text-slate-300 font-bold text-lg">No history recorded yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
