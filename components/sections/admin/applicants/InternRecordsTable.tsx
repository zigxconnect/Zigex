"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, Users, Calendar, CheckCircle2, 
  MapPin, Clock, Star, TrendingUp, Award,
  ChevronRight, BookOpen, ShieldCheck, 
  Activity, MessageSquare, Filter, Download,
  ArrowUpRight, BarChart3, Target, LayoutDashboard,
  X, Sparkles
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { getEvaluationsForIntern, getInternLogsForAdmin } from "@/lib/actions/evaluation.actions";

interface InternRecordsTableProps {
  applicants: Applicant[];
  companyId: string;
}

export function InternRecordsTable({ applicants, companyId }: InternRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState<Applicant | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const activeInterns = useMemo(() => {
    return applicants.filter(app => 
      app.status === "accepted" && 
      (app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applicants, searchTerm]);

  const handleViewRecords = async (intern: Applicant) => {
    setSelectedIntern(intern);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    
    try {
      const [evals, internLogs] = await Promise.all([
        getEvaluationsForIntern(intern.userId || ""),
        getInternLogsForAdmin(intern.userId || "", intern.internshipId)
      ]);
      setEvaluations(evals || []);
      setLogs(internLogs || []);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Search & Tool Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-blue-100/50 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <Input
            placeholder="Search academic records by intern name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-14 rounded-[1.5rem] border-none bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Badge className="bg-blue-50 text-blue-600 border-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
             Tracking {activeInterns.length} Active Records
          </Badge>
          <Button variant="outline" className="h-14 px-6 rounded-[1.5rem] border-blue-100 hover:bg-blue-50 text-blue-600 font-bold uppercase text-[10px] tracking-widest gap-2">
            <Download size={16} /> Export Reports
          </Button>
        </div>
      </div>

      {/* Grid of Minimalist Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {activeInterns.map((intern, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              key={intern.id}
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 cursor-pointer overflow-hidden"
              onClick={() => handleViewRecords(intern)}
            >
              <div className="relative z-10">
                {/* Header: Intern Branding */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 ring-4 ring-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                        {intern.avatarUrl && intern.avatarUrl !== "/default-avatar.svg" ? (
                          <Image src={intern.avatarUrl} alt={intern.name} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-black">
                            {intern.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{intern.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{intern.internshipTitle || 'Intern'}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock size={12} className="text-amber-500" /> Attendance
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">92</span>
                      <span className="text-[10px] font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Star size={12} className="text-indigo-500" /> Avg. Rating
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">4.8</span>
                      <span className="text-[10px] font-bold text-slate-400">/5</span>
                    </div>
                  </div>
                </div>

                {/* Supervisor Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                      <ShieldCheck size={16} />
                    </div>
                    <div className="text-[10px] font-bold">
                       <p className="text-blue-400 group-hover:text-blue-100 uppercase tracking-widest font-black leading-tight">Supervisor</p>
                       <p className="text-slate-700 group-hover:text-white truncate max-w-[120px]">{intern.supervisor?.full_name || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white/20 text-blue-600 group-hover:text-white group-hover:bg-white/10 uppercase tracking-widest">
                    Records
                  </div>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 group-hover:opacity-[0.05] transition-all duration-1000">
                 <Award size={180} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detailed Records Portal (Dialog) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 bg-slate-50 border-none rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
          <DialogTitle className="sr-only">Intern Records - {selectedIntern?.name}</DialogTitle>
          <DialogDescription className="sr-only">Full breakdown of attendance, evaluations, and performance metrics.</DialogDescription>
          
          {/* Custom Header */}
          <div className="bg-white border-b border-blue-50 p-8 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-2xl shadow-blue-200">
                    <div className="bg-white h-full w-full rounded-[calc(2rem-2px)] flex items-center justify-center text-3xl font-black text-blue-600">
                      {selectedIntern?.avatarUrl ? (
                         <Image src={selectedIntern.avatarUrl} alt="Avatar" width={80} height={80} className="object-cover h-full w-full rounded-[calc(2rem-2px)]" />
                      ) : selectedIntern?.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedIntern?.name}</h2>
                   <div className="flex items-center gap-3 mt-1">
                      <Badge className="bg-blue-600 text-white rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-none hover:bg-blue-700 transition-colors">
                        {selectedIntern?.internshipTitle || 'Candidate'}
                      </Badge>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 border-l border-slate-200 pl-3">
                         <MapPin size={12} className="text-blue-500" /> {selectedIntern?.school || 'Zigex Academy'}
                      </span>
                   </div>
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 uppercase text-[10px] font-black tracking-widest px-6 shadow-sm hover:shadow-md transition-all">
                   <Download size={14} className="mr-2" /> PDF Archive
                </Button>
                <Button onClick={() => setIsDetailOpen(false)} variant="ghost" className="h-12 w-12 p-0 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                   <X size={20} />
                </Button>
             </div>
          </div>

          {/* Main Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Sidebar: Performance Stats */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white rounded-[2rem] p-8 border border-blue-50 shadow-xl shadow-blue-500/5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <BarChart3 size={14} className="text-blue-500" /> Analytics Summary
                      </h4>
                      <div className="space-y-6">
                         <StatLine label="Technical Proficiency" value={85} color="bg-blue-600" />
                         <StatLine label="Communication Skills" value={92} color="bg-indigo-600" />
                         <StatLine label="System Dependability" value={78} color="bg-rose-500" />
                         <StatLine label="Creativity & Logic" value={95} color="bg-emerald-500" />
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Evaluation Index</h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white">4.8</span>
                          <span className="text-xl font-bold text-slate-500">/ 5.0</span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                           <TrendingUp size={12} /> Exceptional Performance
                        </p>
                      </div>
                      <Sparkles className="absolute -right-6 -bottom-6 text-white opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000" size={140} />
                   </div>
                </div>

                {/* Right Area: Timelines & Reviews */}
                <div className="lg:col-span-8 space-y-8">
                   
                   {/* Periodic Evaluations Section */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <BookOpen size={20} className="text-blue-600" /> Supervisor Reviews
                            <span className="text-xs font-bold text-slate-300 ml-1">({evaluations.length})</span>
                         </h4>
                         <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:bg-blue-50 rounded-xl">
                            All Evaluations <ChevronRight size={14} className="ml-1" />
                         </Button>
                      </div>

                      {loadingDetails ? (
                         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-blue-50 border-dashed">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Records...</p>
                         </div>
                      ) : evaluations.length > 0 ? (
                         <div className="space-y-4">
                            {evaluations.map((eval_item, idx) => (
                               <motion.div 
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: idx * 0.1 }}
                                 key={eval_item.id} 
                                 className="bg-white rounded-[2rem] p-6 border border-blue-50 shadow-md hover:shadow-xl hover:border-blue-100 transition-all group"
                               >
                                  <div className="flex items-start justify-between mb-4">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                           <Calendar size={18} />
                                        </div>
                                        <div>
                                           <h5 className="font-black text-slate-900 text-sm">Review Cycle - {format(new Date(eval_item.evaluation_date), "MMM dd, yyyy")}</h5>
                                           <div className="flex items-center gap-2 mt-1">
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisor: {eval_item.supervisor?.full_name}</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        Rating: {eval_item.overall_rating}/5
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                     <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                           <TrendingUp size={12} /> Key Strengths
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed italic">"{eval_item.strengths || 'Consistent progress across technical domains.'}"</p>
                                     </div>
                                     <div>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                           <Target size={12} /> Observations
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed italic">"{eval_item.comments || 'Exceeded expectations for this period.'}"</p>
                                     </div>
                                  </div>
                               </motion.div>
                            ))}
                         </div>
                      ) : (
                         <div className="bg-white rounded-[2rem] p-20 text-center border border-blue-50 shadow-sm border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-slate-200">
                               <MessageSquare size={32} />
                            </div>
                            <h5 className="font-bold text-slate-400 text-sm uppercase tracking-widest">No Evaluations Recorded Yet</h5>
                            <p className="text-xs text-slate-300 mt-2">Evaluation cycles will appear here once submitted by supervisors.</p>
                         </div>
                      )}
                   </div>

                   {/* Attendance Log Preview Section */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-xl shadow-blue-500/5">
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Activity size={20} className="text-indigo-600" /> Attendance Ledger
                         </h4>
                         <div className="flex items-center gap-2">
                           <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1.5 text-[10px] font-black tracking-widest">
                             {logs.length > 0 ? "Tracking" : "No Logs"}
                           </Badge>
                         </div>
                      </div>
                      <div className="space-y-3">
                         {loadingDetails ? (
                           <div className="py-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">Loading Logs...</div>
                         ) : logs.length > 0 ? (
                           logs.slice(0, 5).map((log, i) => (
                             <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group/item">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover/item:scale-110 transition-transform">
                                      <Clock size={16} />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-900">{format(new Date(log.log_date), "MMM dd, yyyy")}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Verified: {log.is_location_verified ? "YES" : "NO"}
                                      </p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                     log.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                   )}>
                                      {log.status === "approved" ? <ShieldCheck size={12} /> : <Activity size={12} />}
                                      {log.status}
                                   </div>
                                   <ChevronRight size={16} className="text-slate-200 group-hover/item:text-indigo-400 group-hover/item:translate-x-1 transition-all" />
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No attendance records found</div>
                         )}
                      </div>
                      <Button variant="ghost" className="w-full mt-6 h-14 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all">
                        Access Full Historical Logbook
                      </Button>
                   </div>

                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components for cleaner code
const StatLine = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-900 underline underline-offset-4 decoration-blue-500/30">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50/50">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn("h-full rounded-full shadow-lg", color)} 
      />
    </div>
  </div>
);
