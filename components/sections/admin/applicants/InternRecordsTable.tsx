"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Calendar, CheckCircle2, 
  MapPin, Clock, Star, TrendingUp, Award,
  ChevronRight, BookOpen, ShieldCheck, 
  Activity, MessageSquare, Download,
  ArrowUpRight, BarChart3, Target, Filter,
  MoreHorizontal, ChevronDown, UserCircle,
  ExternalLink, FileSpreadsheet, Sparkles,
  Zap, BrainCircuit, LayoutDashboard,
  Users,
  FileText
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
        const studentIds = applicants.map(a => a.studentId).concat(applicants.map(a => a.userId)).filter(Boolean) as string[];
        const data = await getCompanyInternsPerformanceSummary(companyId, studentIds);
        setSummaries(data || {});
      } catch (err) {
        console.error("Error fetching performance summaries:", err);
      } finally {
        setFetchingSummaries(false);
      }
    };
    fetchSummaries();
  }, [companyId, applicants]);

  // Helper function to look up summary with proper ID fallbacks
  const getSummary = (intern: Applicant | null) => {
    if (!intern) return { attendanceCount: 0, totalMarks: 0, latestObservation: "", taskCount: 0, avgMark: null, performanceRating: null };
    
    // Base summary from application ID
    const baseSummary = summaries[intern.id] || summaries[intern.userId || ""] || summaries[intern.studentId || ""] || { attendanceCount: 0, totalMarks: 0, latestObservation: "", taskCount: 0, avgMark: null, performanceRating: null };
    
    // Extract V2 attendance which is keyed directly by studentId or userId
    const v2Summary = summaries[intern.studentId || ""] || summaries[intern.userId || ""];
    const attendanceCount = v2Summary?.attendanceCount !== undefined ? v2Summary.attendanceCount : baseSummary.attendanceCount;

    return { ...baseSummary, attendanceCount };
  };

  // Filter only active (accepted) interns
  const activeInterns = useMemo(() => {
    return applicants.filter(app => app.status === "accepted");
  }, [applicants]);

  const handleOpenInternPortal = async (intern: Applicant) => {
    setSelectedIntern(intern);
    setIsPortalOpen(true);
    setLoading(true);
    
    const targetStudentId = intern.userId || intern.studentId || "";

    if (!targetStudentId) {
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
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="h-12 px-5 rounded-2xl border-slate-100 hover:bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-widest gap-2 whitespace-nowrap"
          >
            <Download size={14} /> Export
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
                // Use robust getSummary to extract correct V2 attendance
                const summary = getSummary(intern);
                
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{intern.email}</p>
                          {intern.school && (
                             <div className="mt-1 flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100/50 truncate max-w-[180px]">
                                   {intern.school}
                                </span>
                             </div>
                          )}
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
                             <span className="text-[10px] font-bold text-slate-400">/ {parseInt(intern.duration || "1") * 20}</span>
                          </div>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                             <div 
                               className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                               style={{ width: `${Math.min(100, (summary.attendanceCount / (parseInt(intern.duration || "1") * 20)) * 100)}%` }} 
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
                <Users size={32} />
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
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border border-blue-100 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.1)] flex flex-col focus:outline-none">
          <DialogTitle className="sr-only">Performance Report - {selectedIntern?.name}</DialogTitle>
          <DialogDescription className="sr-only">Comprehensive audit of attendance, weekly marks, and supervisor feedback.</DialogDescription>
          
          {/* Close Button */}
          {/* <button 
            onClick={() => setIsPortalOpen(false)} 
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all z-50"
          >
             <CloseIcon size={20} />
          </button> */}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Header: Student Profile & School */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
               <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
                       <div className="bg-white h-full w-full rounded-[calc(2rem-2px)] flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden">
                          {selectedIntern?.avatarUrl && selectedIntern.avatarUrl !== "/default-avatar.svg" ? (
                             <Image src={selectedIntern.avatarUrl} alt="Avatar" width={80} height={80} className="object-cover h-full w-full" />
                          ) : selectedIntern?.name.charAt(0)}
                       </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedIntern?.name}</h2>
                    <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mt-2">{selectedIntern?.internshipTitle || "Intern"}</p>
                  </div>
               </div>
               
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affiliated Institution</p>
                  <p className="text-lg font-bold text-slate-600">{selectedIntern?.school || "Zigex Academy"}</p>
               </div>
            </div>

            {/* Premium Stats Row */}
             {(() => {
                const targetDays = parseInt(selectedIntern?.duration || "1") * 20;
                const summary = selectedIntern ? getSummary(selectedIntern) : { attendanceCount: 0, totalMarks: 0, taskCount: 0, avgMark: null, performanceRating: null };
                
                return (
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                      <StatBox label="Tasks Done" value={summary.taskCount || 0} icon={CheckCircle2} color="bg-[#155DFC]" />
                      <StatBox label="Attendance" value={`${summary.attendanceCount || 0} / ${targetDays} Days`} icon={Calendar} color="bg-emerald-500" />
                      <StatBox label="Avg Mark" value={summary.avgMark ? `${summary.avgMark}/5` : "---"} icon={TrendingUp} color="bg-amber-500" trend={summary.avgMark >= 4 ? "+High" : undefined} />
                      <StatBox label="Performance" value={summary.performanceRating || "---"} icon={Award} color="bg-purple-600" />
                   </div>
                );
             })()}

            {/* Weekly Remarks Section */}
            <div className="space-y-4 px-4 pb-4">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity size={14} className="text-blue-500" /> performance audit timeline
               </h3>
               
               <div className="space-y-3">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                       <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling feedback data...</p>
                    </div>
                  ) : evaluations.length > 0 ? (
                    evaluations.map((eval_item, idx) => (
                      <motion.div 
                        key={eval_item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-blue-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                         <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                               W{evaluations.length - idx}
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                  Remark by {eval_item.supervisor?.full_name || "Supervisor"}
                               </p>
                               <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                                  "{eval_item.comments || "Exceptional performance observed during this cycle."}"
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <Badge className="bg-blue-500/10 text-blue-600 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase">
                               {eval_item.overall_rating} pts
                            </Badge>
                         </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                      <FileText className="mx-auto h-16 w-16 text-slate-200 mb-6 drop-shadow-sm" />
                      <h4 className="text-slate-900 font-bold text-lg mb-1">No Records Found</h4>
                      <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                        We couldn't find any detailed supervisor observations or record history for this intern yet.
                      </p>
                    </div>
                  )}
               </div>
            </div>
          </div>

           {/* AI Footer Action */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
             <Button 
               className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 border-none group"
             >
                <BrainCircuit size={20} className="group-hover:scale-110 transition-transform" />
                Analyze student profile
                <Zap size={16} className="text-amber-300 fill-amber-300" />
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

 // Stats Box Component
const StatBox = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden group hover:border-[#155DFC]/20 transition-all duration-300">
    <div className={`absolute top-0 left-0 w-1.5 h-full ${color} opacity-10 group-hover:opacity-100 transition-opacity`} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-black text-black leading-none tracking-tight">{value}</p>
          {trend && (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
               {trend}
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
  </div>
);

// Minimalist Vector Icons
const CloseIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
);
