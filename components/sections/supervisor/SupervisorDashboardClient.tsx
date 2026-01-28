"use client";

import React, { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LogReviewModal } from "./LogReviewModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  markInternAttendance, 
  assignInternshipTask, 
  deleteInternshipTask,
  submitBatchAttendance
} from "@/lib/actions/supervisor.actions";

interface SupervisorDashboardClientProps {
  data: {
    profile: any;
    interns: any[];
    recentLogs: any[];
    tasks: any[];
    attendance: any[];
  };
}

export function SupervisorDashboardClient({ data }: SupervisorDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "tasks">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Task Form State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    internship_id: "",
    title: "",
    description: "",
    due_date: "",
    priority: "medium"
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  
  // Attendance Batch State
  const [pendingAttendance, setPendingAttendance] = useState<Record<string, string>>({});
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const { interns, recentLogs, tasks, attendance } = data;
  const router = useRouter();

  const filteredInterns = interns.filter(i => {
    const student = Array.isArray(i.student) ? i.student[0] : i.student;
    return student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingReviews = recentLogs.filter(l => l.status === "pending" || !l.status).length;
  const approvedCount = recentLogs.filter(l => l.status === "approved").length;

  // Initialize pending attendance from existing data
  useEffect(() => {
    if (attendance && interns) {
      const initialMap: Record<string, string> = {};
      interns.forEach(intern => {
        const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
        const record = attendance.find(a => a.student_id === student?.user_id);
        if (record) {
          initialMap[student?.user_id] = record.status;
        } else {
          initialMap[student?.user_id] = "absent"; // default
        }
      });
      setPendingAttendance(initialMap);
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
        toast.success(`Success: ${res.count} records sent to company!`);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.internship_id || !newTask.title) {
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSubmittingTask(true);
    try {
      const res = await assignInternshipTask(newTask);
      if (res.success) {
        toast.success("Task assigned successfully!");
        setIsTaskModalOpen(false);
        setNewTask({ internship_id: "", title: "", description: "", due_date: "", priority: "medium" });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign task");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const res = await deleteInternshipTask(id);
    if (res.success) {
      toast.success("Task deleted");
      router.refresh();
    }
  };

  const isAttendanceWindow = () => {
    const hour = new Date().getHours();
    return hour >= 15 || hour < 0; // 3pm to 12am (approx)
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
      <header className="bg-white dark:bg-slate-900 border-b border-blue-100/50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <Badge className="bg-blue-600 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2">
                Supervisor Portal
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Hello, {data.profile?.full_name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your mentored students and project milestones.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[
                { id: "overview", icon: LayoutDashboard, label: "Overview" },
                { id: "attendance", icon: ClipboardCheck, label: "Attendance" },
                { id: "tasks", icon: ListTodo, label: "Tasks" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <tab.icon size={14} />
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                    <Users size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Assigned</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{interns.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                    <Clock size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pending logs</p>
                  <p className="text-2xl font-black text-amber-600 uppercase">{pendingReviews}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Approved</p>
                  <p className="text-2xl font-black text-green-600">{approvedCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                    <ListTodo size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Active Tasks</p>
                  <p className="text-2xl font-black text-purple-600">{tasks.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Intern List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Recent Submissions</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <Input 
                        placeholder="Search interns..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 rounded-xl border-slate-100 bg-slate-50 text-xs w-48"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {recentLogs.length > 0 ? recentLogs.map((log) => {
                      const student = Array.isArray(log.student) ? log.student[0] : log.student;
                      const isPending = !log.status || log.status === "pending";
                      return (
                        <div key={log.id} className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                          <div className="w-12 h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden ring-4 ring-blue-50/20">
                             <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" width={48} height={48} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{student?.full_name}</h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar size={10} /> {format(new Date(log.log_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-0", isPending ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600")}>
                                {log.status || "Pending"}
                             </Badge>
                             <Button 
                              onClick={() => { setSelectedLog(log); setIsReviewModalOpen(true); }}
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-4 text-[10px] font-bold uppercase rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                             >
                               Review Log
                             </Button>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <FileText className="mx-auto mb-3 text-slate-300" size={32} />
                        <p className="text-slate-400 font-bold text-sm">Waiting for logs...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Attendance Banner */}
                  <div className={cn(
                    "p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/10",
                    isAttendanceWindow() ? "bg-gradient-to-br from-blue-600 to-indigo-700" : "bg-slate-800"
                  )}>
                    <ClipboardCheck size={24} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-black mb-1">Daily Roll Call</h3>
                    <p className="text-xs text-blue-100/70 mb-5 leading-relaxed">
                      {isAttendanceWindow() 
                        ? "Window is currently OPEN. Mark your interns as present today." 
                        : "Window opens daily at 15:00 PM for attendance confirmation."}
                    </p>
                    <Button 
                      onClick={() => setActiveTab("attendance")}
                      className="w-full rounded-2xl bg-white text-slate-900 font-bold text-xs h-12 shadow-lg"
                    >
                      GO TO ATTENDANCE
                    </Button>
                  </div>

                  {/* Quick Contacts */}
                  <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-6">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                       <MessageSquare size={16} className="text-blue-600" />
                       Quick Connect
                    </h3>
                    <div className="space-y-3">
                      {interns.slice(0, 3).map(i => {
                        const student = Array.isArray(i.student) ? i.student[0] : i.student;
                        return (
                          <div key={i.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                               <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" width={32} height={32} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{student?.full_name}</span>
                            <div className="flex gap-1">
                              <button className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 transition-colors"><Send size={12} /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "attendance" && (
            <motion.div 
              key="attendance"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden relative">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 underline decoration-blue-500 decoration-4">Daily Attendance</h2>
                    <p className="text-slate-500 text-sm max-w-lg">
                      Confirm attendance for each intern assigned to your department. 
                      Roll call is active from <span className="font-bold text-blue-600">3:00 PM to Midnight</span>.
                    </p>
                  </div>
                  {!isAttendanceWindow() && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
                      <AlertCircle size={20} />
                      <span className="text-xs font-bold font-mono">WINDOW LOCKED: REOPENS @ 15:00</span>
                    </div>
                  )}
                </div>
                <div className="absolute right-[-5%] top-[-10%] w-60 h-60 bg-blue-50 dark:bg-blue-500/5 rounded-full blur-3xl -z-0" />
              </div>

                <div className={cn(
                  "grid gap-4",
                  !isAttendanceWindow() && "opacity-60 grayscale pointer-events-none"
                )}>
                  {interns.map((intern) => {
                    const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
                    const status = pendingAttendance[student?.user_id] || "absent";
                    const isPresent = status === "present";

                    return (
                      <div key={intern.id} className={cn(
                        "bg-white dark:bg-slate-900 border transition-all rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-6",
                        isPresent ? "border-green-200 bg-green-50/20 shadow-sm" : "border-slate-100"
                      )}>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                            <Image src={student?.avatar_url || "/default-avatar.svg"} alt="" width={56} height={56} className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{student?.full_name}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {intern.internship?.title || "Internship Program"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              isPresent ? "text-green-600" : "text-slate-400"
                            )}>
                              {isPresent ? "Present" : "Absent"}
                            </span>
                            
                            <button
                              onClick={() => handleToggleAttendance(student?.user_id)}
                              className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2",
                                isPresent 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-300 hover:border-blue-200"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                                isPresent ? "bg-white border-white text-blue-600" : "bg-slate-50 border-slate-200"
                              )}>
                                {isPresent && <Check size={16} strokeWidth={4} />}
                              </div>
                            </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Batch Submission Button */}
                <div className="pt-8 flex justify-center">
                   <Button 
                    onClick={handleSubmitBatchAttendance}
                    disabled={!isAttendanceWindow() || isSubmittingBatch || interns.length === 0}
                    className={cn(
                      "rounded-3xl h-16 px-12 font-black text-sm transition-all shadow-xl",
                      isAttendanceWindow() 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" 
                        : "bg-slate-200 text-slate-400"
                    )}
                   >
                     {isSubmittingBatch ? (
                       <Loader2 className="animate-spin mr-2" />
                     ) : (
                       <CheckCircle2 className="mr-2" size={20} />
                     )}
                     SEND ATTENDANCE TO {data.profile?.company?.company_name || 'COMPANY'}
                   </Button>
                </div>
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Task Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white underline decoration-blue-500 decoration-3">Project Tasks</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Assign weekly milestones and track student activity</p>
                </div>
                <Button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 h-12 shadow-lg shadow-blue-500/20"
                >
                  <Plus size={16} className="mr-2" /> NEW TASK
                </Button>
              </div>

              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.length > 0 ? tasks.map((task) => {
                  const targetIntern = interns.find(i => i.internship_id === task.internship_id);
                  const internName = targetIntern ? (Array.isArray(targetIntern.student) ? targetIntern.student[0] : targetIntern.student)?.full_name : "General Task";
                  
                  return (
                    <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl transition-all border-b-4 border-b-blue-500 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-blue-50 text-blue-600 border-0 font-black text-[9px] uppercase tracking-widest px-2 py-1">
                           {task.priority || "Medium"}
                        </Badge>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white capitalize mb-2 line-clamp-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed flex-1">
                        {task.description}
                      </p>
                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                              <User size={12} className="text-slate-400" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[100px]">{internName}</span>
                         </div>
                         <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                           {task.due_date ? format(new Date(task.due_date), "MMM dd") : "No Due Date"}
                         </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                     <ListTodo className="mx-auto mb-4 text-slate-200" size={48} />
                     <p className="text-slate-400 font-black text-lg">No tasks assigned yet</p>
                     <p className="text-slate-400 text-sm mt-2">Start by creating a milestone for your interns.</p>
                  </div>
                )}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assign New Task 🚀</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Intern</label>
                  <select 
                    value={newTask.internship_id}
                    onChange={(e) => setNewTask({...newTask, internship_id: e.target.value})}
                    className="w-full h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Intern...</option>
                    {interns.map(i => (
                      <option key={i.id} value={i.internship_id}>
                        {(Array.isArray(i.student) ? i.student[0] : i.student)?.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Task Title</label>
                  <Input 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. Implement Authentication Flow"
                    className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <Textarea 
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Describe the goals and requirements..."
                    className="min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 text-sm font-medium resize-none shadow-none focus-visible:ring-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
                    <Input 
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
                    <select 
                       value={newTask.priority}
                       onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                       className="w-full h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                   <Button 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    variant="ghost" 
                    className="flex-1 rounded-2xl h-14 font-black hover:bg-slate-50"
                   >
                     CANCEL
                   </Button>
                   <Button 
                    type="submit"
                    disabled={isSubmittingTask}
                    className="flex-[2] rounded-2xl h-14 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                   >
                     {isSubmittingTask ? <Loader2 className="animate-spin" /> : "ASSIGN TASK"}
                   </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
