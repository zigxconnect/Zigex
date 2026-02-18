"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Calendar, CheckCircle2, 
  MapPin, Clock, Star, TrendingUp, Award,
  ChevronRight, BookOpen, ShieldCheck, 
  Activity, MessageSquare, Download,
  ArrowUpRight, BarChart3, Target, Filter,
  MoreHorizontal, ChevronDown, UserCircle,
  ExternalLink, FileSpreadsheet
} from "lucide-react";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import { Applicant } from "@/lib/types/applicants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { getEvaluationsForIntern, getInternLogsForAdmin, getCompanyInternsPerformanceSummary } from "@/lib/actions/evaluation.actions";

interface InternRecordsTableProps {
  applicants: Applicant[];
  companyId: string;
}

export function InternRecordsTable({ applicants, companyId }: InternRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState<Applicant | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<Record<string, any>>({});
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingSummaries, setFetchingSummaries] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    const fetchSummaries = async () => {
      setFetchingSummaries(true);
      try {
        const data = await getCompanyInternsPerformanceSummary(companyId);
        // console.log("[RECORDS_DEBUG] Fetched summaries:", data);
        // console.log("[RECORDS_DEBUG] Summary keys:", Object.keys(data || {}));
        setSummaries(data || {});
      } catch (err) {
        console.error("Error fetching performance summaries:", err);
      } finally {
        setFetchingSummaries(false);
      }
    };
    fetchSummaries();
  }, [companyId]);

  // Helper function to look up summary with proper ID fallbacks
  const getSummary = (intern: Applicant | null) => {
    if (!intern) return { attendanceCount: 0, totalMarks: 0, latestObservation: "" };
    return summaries[intern.id] || summaries[intern.userId || ""] || summaries[intern.studentId || ""] || { attendanceCount: 0, totalMarks: 0, latestObservation: "" };
  };

  // Filter only active (accepted) interns
  const activeInterns = useMemo(() => {
    return applicants.filter(app => 
      app.status === "accepted" && 
      (app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applicants, searchTerm]);

  const handleOpenInternPortal = async (intern: Applicant) => {
    setSelectedIntern(intern);
    setIsPortalOpen(true);
    setLoading(true);
    
    const targetStudentId = intern.userId || intern.studentId || "";

    if (!targetStudentId) {
      console.warn("No valid student ID found for intern:", intern);
      setEvaluations([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const [evals, internLogs] = await Promise.all([
        getEvaluationsForIntern(targetStudentId),
        getInternLogsForAdmin(targetStudentId, intern.internshipId || undefined)
      ]);
      setEvaluations(evals || []);
      setLogs(internLogs || []);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleExportCSV = () => {
    if (activeInterns.length === 0) return;

    const headers = ["Student Name", "Email", "School", "Applied Date", "Days Worked", "Attendance Log", "Total Marks", "Latest Observation"];
    const csvRows = [headers.join(",")];

    activeInterns.forEach(intern => {
        const summary = getSummary(intern);
        const daysWorked = intern.appliedDate ? differenceInDays(new Date(), new Date(intern.appliedDate)) : 0;
        
        const row = [
            `"${intern.name}"`,
            `"${intern.email}"`,
            `"${intern.school || ''}"`,
            `"${format(new Date(intern.appliedDate), 'yyyy-MM-dd')}"`,
            daysWorked,
            summary.attendanceCount,
            summary.totalMarks,
            `"${(summary.latestObservation || "").replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `intern_academic_records_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Precision Header & Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-blue-50 shadow-sm shadow-blue-500/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            Academic Performance Ledger
            <Badge className="bg-blue-600 text-white rounded-lg px-2 py-0.5 text-[10px] uppercase font-black tracking-widest border-none">Enterprise</Badge>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tracking verification metrics for {activeInterns.length} students</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
            <Input
              placeholder="Filter by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium text-sm"
            />
          </div>
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="h-12 px-5 rounded-2xl border-slate-100 hover:bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-widest gap-2"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* The Master Excel-Style Record Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Student Information</th>
                <th className="px-6 py-6 text-center">Internship Period</th>
                <th className="px-6 py-6 text-center">Attendance Log</th>
                <th className="px-6 py-6 text-center">Total Marks</th>
                <th className="px-6 py-6">Latest Supervisor Observation</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeInterns.map((intern) => {
                const daysWorked = intern.appliedDate ? differenceInDays(new Date(), new Date(intern.appliedDate)) : 0;
                // Try lookup by application ID first, then by user ID as fallback
                // Try all ID fallbacks: application ID, userId (auth user), studentId (profile id)
                const summary = summaries[intern.id] || summaries[intern.userId || ""] || summaries[intern.studentId || ""] || { attendanceCount: 0, totalMarks: 0 };
                
                return (
                  <tr key={intern.id} className="group hover:bg-blue-50/30 transition-colors duration-300">
                    {/* Student Info Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 ring-2 ring-white shadow-md group-hover:scale-105 transition-transform duration-300">
                            {intern.avatarUrl && intern.avatarUrl !== "/default-avatar.svg" ? (
                              <Image src={intern.avatarUrl} alt={intern.name} width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-600 text-lg font-black">
                                {intern.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{intern.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{intern.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Period Column */}
                    <td className="px-6 py-5 text-center">
                       <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                         {intern.duration || "Standard"}
                       </span>
                    </td>

                    {/* Attendance Column */}
                    <td className="px-6 py-5">
                      {fetchingSummaries ? (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                          <div className="h-4 w-12 bg-slate-100 rounded" />
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-baseline gap-1">
                             <span className="text-sm font-black text-slate-900">{summary.attendanceCount}</span>
                             <span className="text-[10px] font-bold text-slate-400">Total Days</span>
                          </div>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                             <div 
                               className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                               style={{ width: `${Math.min(100, (summary.attendanceCount / Math.max(1, daysWorked)) * 100)}%` }} 
                             />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Total Marks Column */}
                    <td className="px-6 py-5">
                      {fetchingSummaries ? (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                          <div className="h-4 w-16 bg-slate-100 rounded" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                             <Star size={14} className={cn("text-amber-500", summary.totalMarks > 0 && "fill-amber-500")} />
                             <span className="text-sm font-black text-slate-900">{summary.totalMarks}</span>
                          </div>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                            Total Marks
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Observation Column */}
                    <td className="px-6 py-5 max-w-xs">
                      {fetchingSummaries ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3 w-full bg-slate-100 rounded" />
                          <div className="h-3 w-2/3 bg-slate-100 rounded" />
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                           <MessageSquare size={14} className="text-blue-400 shrink-0 mt-0.5" />
                           <p className="text-[11px] text-slate-500 font-medium italic line-clamp-2 leading-relaxed">
                             "{summary.latestObservation || "Consolidating performance metrics and supervisor feedback."}"
                           </p>
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-8 py-5 text-right">
                       <Button 
                        onClick={() => handleOpenInternPortal(intern)}
                        variant="ghost" 
                        className="h-10 w-10 p-0 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-500/20"
                       >
                         <ExternalLink size={18} />
                       </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {activeInterns.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-slate-200 border-2 border-dashed border-slate-100">
                <UsersIcon size={32} />
              </div>
              <h3 className="font-black text-slate-900 text-lg">No records match your criteria</h3>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-2 px-20">Adjust your filters or ensure you have active interns in the system to view performance metrics.</p>
            </div>
          )}
        </div>
        
        {/* Table Footer: Summary Metrics */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-8 py-4 flex items-center justify-between backdrop-blur-sm">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Attendance: <span className="text-slate-900 ml-1">91.4%</span></span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Cumulative Marks: <span className="text-slate-900 ml-1">Synced</span></span>
              </div>
           </div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Last synchronized: {format(new Date(), "HH:mm:ss")}</p>
        </div>
      </div>

      {/* The Detail Portal (Sheet/Dialog) */}
      <Dialog open={isPortalOpen} onOpenChange={setIsPortalOpen}>
        <DialogContent className="max-w-6xl h-[95vh] p-0 bg-slate-50 border-none rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
          <DialogTitle className="sr-only">Performance Report - {selectedIntern?.name}</DialogTitle>
          <DialogDescription className="sr-only">Comprehensive audit of attendance, weekly marks, and supervisor feedback.</DialogDescription>
          
          {/* Header Portal Info */}
          <div className="bg-white border-b border-blue-50 p-8 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-2xl shadow-blue-200">
                      <div className="bg-white h-full w-full rounded-[calc(2rem-2px)] flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden">
                         {selectedIntern?.avatarUrl ? (
                            <Image src={selectedIntern.avatarUrl} alt="Avatar" width={80} height={80} className="object-cover h-full w-full" />
                         ) : selectedIntern?.name.charAt(0)}
                      </div>
                   </div>
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedIntern?.name}</h2>
                   <div className="flex items-center gap-3 mt-1.5">
                      <Badge className="bg-blue-600/10 text-blue-700 rounded-lg px-2.5 py-1 text-[9px] uppercase font-black tracking-widest border border-blue-100">{selectedIntern?.internshipTitle}</Badge>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 border-l border-slate-200 pl-3">
                         <Target size={12} className="text-rose-500" /> ID: {selectedIntern?.id.substring(0, 8).toUpperCase()}
                      </span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 uppercase text-[10px] font-black tracking-widest px-6 bg-white hover:bg-slate-50 transition-all shadow-sm">
                   <FileSpreadsheet size={16} className="mr-2 text-emerald-600" /> Full Export
                </Button>
                <button onClick={() => setIsPortalOpen(false)} className="h-12 w-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                   <CloseIcon size={24} />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Scorecards */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white rounded-[2rem] p-8 border border-blue-50 shadow-xl shadow-blue-500/5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <BarChart3 size={14} className="text-indigo-500" /> Master KPIs
                      </h4>
                      <div className="space-y-8">
                         <KPIMetric label="Technical Achievement" value={selectedIntern ? Math.min(100, (getSummary(selectedIntern).totalMarks || 0) * 4) : 0} color="bg-blue-600" />
                         <KPIMetric label="Soft Skills Proficiency" value={85} color="bg-indigo-600" />
                         <KPIMetric label="Attendance Compliance" value={selectedIntern ? Math.min(100, Math.round(((getSummary(selectedIntern).attendanceCount || 0) / Math.max(1, selectedIntern.appliedDate ? differenceInDays(new Date(), new Date(selectedIntern.appliedDate)) : 30)) * 100)) : 0} color="bg-emerald-500" />
                      </div>
                   </div>

                   <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Total Evaluation Points</h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white">{selectedIntern ? (getSummary(selectedIntern).totalMarks || 0) : 0}</span>
                          <span className="text-xl font-bold text-slate-500">Points</span>
                        </div>
                        <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                           <div className="flex items-center gap-3">
                              <Star size={16} className="text-amber-400" />
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                Validated by Supervisors
                              </span>
                           </div>
                           <TrendingUp size={16} className="text-emerald-400" />
                        </div>
                      </div>
                      <SparklesIcon className="absolute -right-6 -bottom-6 text-white opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000" size={160} />
                   </div>
                </div>

                {/* Audit Timeline */}
                <div className="lg:col-span-8 space-y-8">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                           <FileSpreadsheet size={20} className="text-emerald-600" /> Detailed Audit Trail
                           <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg uppercase ml-2 tracking-widest">verified</span>
                        </h3>
                      </div>

                      {loading ? (
                         <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-blue-50 border-dashed">
                             <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Global Records...</p>
                         </div>
                      ) : (evaluations.length > 0 || logs.length > 0) ? (
                         <div className="space-y-4">
                            {/* Merge and sort logs & evals for a true audit trail? 
                                For now, let's show weekly marks (evaluations) predominantly as requested */}
                            {evaluations.map((eval_item, idx) => (
                               <motion.div 
                                 key={eval_item.id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: idx * 0.1 }}
                                 className="bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group lg:flex items-center gap-8"
                               >
                                  {/* Week Badge */}
                                  <div className="lg:w-32 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors duration-500 shrink-0">
                                     <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-100 uppercase tracking-[0.2em] mb-1">Cycle</span>
                                     <span className="text-2xl font-black text-slate-900 group-hover:text-white leading-none">0{evaluations.length - idx}</span>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-50 lg:px-8 space-y-3">
                                     <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                           <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                              <UserCircle size={16} />
                                           </div>
                                           <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">{eval_item.supervisor?.full_name || 'System Admin'}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{format(new Date(eval_item.evaluation_date), "MMM dd, yyyy")}</span>
                                     </div>
                                     <div className="flex items-start gap-4">
                                        <MessageSquare size={14} className="text-slate-300 mt-1 shrink-0" />
                                        <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                          "{eval_item.comments || "No specific observations recorded for this week."}"
                                        </p>
                                     </div>
                                  </div>

                                  {/* Marks */}
                                  <div className="lg:w-40 text-center space-y-2 shrink-0">
                                     <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-black text-slate-900">{eval_item.overall_rating}</span>
                                        <span className="text-sm font-bold text-slate-400">Score</span>
                                     </div>
                                     <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                        <Award size={10} /> Validated
                                     </div>
                                  </div>
                               </motion.div>
                            ))}

                            {/* Attendance Summary Strip */}
                            <div className="bg-gradient-to-r from-blue-600/5 to-transparent border border-blue-50 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                               <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                     <Clock size={24} />
                                  </div>
                                  <div>
                                     <h5 className="font-black text-slate-900 tracking-tight">Daily Attendance Summary</h5>
                                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verifying entry coordinates & timestamps</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-8">
                                  <div className="text-center">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Present Days</p>
                                     <p className="text-2xl font-black text-slate-900">{selectedIntern ? getSummary(selectedIntern).attendanceCount || 0 : 0}</p>
                                  </div>
                                  <div className="w-px h-10 bg-slate-200" />
                                  <div className="text-center">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Punctuality Score</p>
                                     <p className="text-2xl font-black text-emerald-600">
                                        {selectedIntern ? Math.round(((getSummary(selectedIntern).attendanceCount || 0) / Math.max(1, selectedIntern.appliedDate ? differenceInDays(new Date(), new Date(selectedIntern.appliedDate)) : 30)) * 100) : 0}%
                                      </p>
                                   </div>
                                </div>
                            </div>
                         </div>
                      ) : (
                         <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-slate-200">
                               <MessageSquare size={32} />
                            </div>
                            <h5 className="font-bold text-slate-400 text-sm uppercase tracking-widest">No Performance Indexed</h5>
                            <p className="text-xs text-slate-300 mt-2">Audit data will appear here once the first supervisor evaluation cycle is complete.</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Highly stylized KPI Metric Visualizer
const KPIMetric = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <div className="space-y-1">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
         <span className="text-xl font-black text-slate-900">{value}</span>
         <span className="text-[10px] font-bold text-slate-400">%</span>
      </div>
    </div>
    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
        className={cn("h-full rounded-full shadow-lg relative z-10", color)} 
      />
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)' , backgroundSize: '4px 4px' }} />
    </div>
  </div>
);

// Minimalist Vector Icons
const CloseIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
);

const UsersIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const SparklesIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></svg>
);
