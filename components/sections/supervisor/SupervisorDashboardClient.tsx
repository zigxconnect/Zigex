"use client";

import React, { useState } from "react";
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
  Eye
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LogReviewModal } from "./LogReviewModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SupervisorDashboardClientProps {
  data: {
    profile: any;
    interns: any[];
    recentLogs: any[];
  };
}

export function SupervisorDashboardClient({ data }: SupervisorDashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { interns, recentLogs } = data;

  const filteredInterns = interns.filter(i => {
    const student = Array.isArray(i.student) ? i.student[0] : i.student;
    return student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingReviews = recentLogs.filter(l => l.status === "pending" || !l.status).length;
  const approvedCount = recentLogs.filter(l => l.status === "approved").length;

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const supervisorId = data.profile?.id;

    if (!supervisorId) return;

    // Listen for new/updated intern assignments
    const assignmentsChannel = supabase
      .channel(`supervisor-assignments-${supervisorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internship_applications',
          filter: `supervisor_id=eq.${supervisorId}`
        },
        () => {
          console.log('[REALTIME] New intern assignment or update detected');
          router.refresh();
        }
      )
      .subscribe();

    // Listen for new logs from any of the assigned interns
    const logsChannel = supabase
      .channel(`supervisor-logs-${supervisorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'intern_logs'
          // Ideally we'd filter by student_id IN (...) but Supabase doesn't support IN filter in Realtime yet
          // So we listen to all INSERTs and let router.refresh() handle the filtering via the server action
        },
        () => {
          console.log('[REALTIME] New intern log detected');
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [data.profile?.id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Mentorship Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your assigned interns and review their progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{interns.length}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Interns</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <Users size={18} className="text-blue-600 mb-3" />
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Active Interns</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{interns.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <FileText size={18} className="text-blue-600 mb-3" />
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Reports</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{recentLogs.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <Clock size={18} className="text-amber-500 mb-3" />
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pending Review</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{pendingReviews}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <CheckCircle2 size={18} className="text-green-500 mb-3" />
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Approved</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{approvedCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== INTERN LIST ===== */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-blue-50 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Interns</h2>
                    <p className="text-xs text-slate-500">Track student progress and performance</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      placeholder="Search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white text-sm w-full sm:w-52"
                    />
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-blue-50 dark:divide-slate-800">
                {filteredInterns.length > 0 ? filteredInterns.map((intern) => {
                  const student = Array.isArray(intern.student) ? intern.student[0] : intern.student;
                  const internship = Array.isArray(intern.internship) ? intern.internship[0] : intern.internship;
                  
                  return (
                    <div key={intern.id} className="group flex items-center gap-4 p-4 sm:p-5 hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0">
                        <Image 
                          src={student?.avatar_url || "/default-avatar.svg"} 
                          alt={student?.full_name || "Intern"} 
                          width={44} 
                          height={44} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {student?.full_name || "Unknown"}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {internship?.title || "Internship Program"}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <Badge className="bg-green-50 text-green-600 border-green-100 text-[10px] font-semibold rounded-md">
                          {intern.status || "Active"}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  );
                }) : (
                  <div className="p-12 text-center">
                    <Users size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 font-semibold text-sm">No interns assigned</p>
                    <p className="text-xs text-slate-400 mt-1">You'll see your assigned students here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== RECENT ACTIVITY ===== */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-blue-50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Logs</h2>
                  <Button variant="ghost" size="sm" className="text-blue-600 font-semibold text-xs h-8 px-3 hover:bg-blue-50 rounded-lg">
                    View All
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Latest submissions from your interns</p>
              </div>
              
              <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentLogs.length > 0 ? recentLogs.slice(0, 6).map((log) => {
                  const student = Array.isArray(log.student) ? log.student[0] : log.student;
                  const isPending = !log.status || log.status === "pending";
                  
                  return (
                    <div key={log.id} className="relative pl-5 pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:pb-0 last:border-0">
                      <div className={cn(
                        "absolute left-[-5px] top-0 w-2 h-2 rounded-full",
                        isPending ? "bg-amber-500" : "bg-blue-600"
                      )} />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {format(new Date(log.log_date), "MMM dd, HH:mm")}
                        </span>
                        <Badge className={cn(
                          "text-[9px] font-semibold px-2 py-0.5 rounded-md",
                          log.status === "approved" ? "bg-green-500 text-white" : "bg-amber-400 text-white"
                        )}>
                          {log.status || "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                        {student?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-slate-500 italic line-clamp-2 mb-2">
                        "{log.learning_log?.substring(0, 80)}..."
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Star size={10} className="text-amber-400" />
                          {log.experience_rating}/5
                        </div>
                        <Button 
                          onClick={() => {
                            setSelectedLog(log);
                            setIsReviewModalOpen(true);
                          }}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-3 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={12} className="mr-1" /> Review
                        </Button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-8 text-center">
                    <FileText size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 font-semibold text-sm">No recent logs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white">
              <MessageSquare size={20} className="mb-4 text-blue-200" />
              <h3 className="text-lg font-bold mb-2">Need Assistance?</h3>
              <p className="text-sm text-blue-100/80 mb-4">
                Contact the admin team for help with the mentorship system.
              </p>
              <Button className="w-full h-10 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-colors">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
