"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Briefcase, Calendar, CheckCircle2, Clock, 
  Layout, MapPin, MessageSquare, ShieldCheck, 
  Sparkles, Star, TrendingUp, Trophy, User,
  Loader2, ArrowRight, BookOpen, Zap, Target,
  ChevronRight, ExternalLink, Play, Lock, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";

export default function InternWorkspace() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [learningLog, setLearningLog] = useState("");
  const [rating, setRating] = useState(5);
  const [activeCurriculumId, setActiveCurriculumId] = useState<string | null>(null);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      const resp = await fetch("/api/interns/workspace/log");
      const json = await resp.json();
      setData(json);
    } catch (err) {
      toast.error("Failed to sync your workspace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setIsCheckingIn(true);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const resp = await fetch("/api/interns/workspace/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            internshipId: data.internship.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            learningLog: learningLog || "Daily Check-in",
            experienceRating: rating
          })
        });

        const result = await resp.json();
        if (result.success) {
          if (result.locationVerified) {
            toast.success("Attendance Verified!", { description: "You are within the office perimeter." });
          } else {
            toast.warning("Check-in Logged", { description: "Location couldn't be verified within office zone." });
          }
          fetchWorkspaceData();
          setLearningLog("");
        } else {
          throw new Error(result.error);
        }
      } catch (err: any) {
        toast.error("Check-in failed", { description: err.message });
      } finally {
        setIsCheckingIn(false);
      }
    }, (err) => {
      toast.error("Location access denied", { description: "We need your location to verify attendance." });
      setIsCheckingIn(false);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-50 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
               <Zap className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  // --- RENDER: NO APPLICATIONS ---
  if (data?.phase === 'none' || !data?.currentApp) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center space-y-8 border border-blue-50 shadow-2xl shadow-blue-900/5">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto transition-transform hover:rotate-12 duration-500">
              <Briefcase size={48} />
           </div>
           <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 leading-tight">Ready to Start?</h1>
              <p className="text-slate-500 font-medium leading-relaxed">You haven't applied for any internships yet. Your journey to professional excellence begins with a single application.</p>
           </div>
           <button 
             onClick={() => window.location.href = '/feed'}
             className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             Browse Vacancies
             <ArrowRight size={20} />
           </button>
        </div>
      </div>
    );
  }

  const { phase, currentApp, internship, logs, curriculum, tasks } = data;
  const todayLog = logs.find((l: any) => l.log_date === new Date().toISOString().split('T')[0]);

  // --- RENDER: SCREENING / REVIEWING ---
  if (phase === 'screening' || phase === 'reviewing') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                 <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Application Radar</div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Tracking</h1>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                   <Clock size={20} className="text-slate-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Average Decision Time</p>
                    <p className="text-sm font-bold text-slate-900">4-7 Working Days</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 {/* Live Status Card */}
                 <div className="bg-white rounded-[3rem] p-12 border border-blue-50 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                       <Target size={200} className="text-blue-600" />
                    </div>
                    
                    <div className="relative z-10 space-y-12">
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shrink-0 shadow-2xl">
                             {internship?.company?.company_name?.[0] || 'Z'}
                          </div>
                          <div>
                             <h2 className="text-2xl font-black text-slate-900">{internship?.title || 'Internship Role'}</h2>
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{internship?.company?.company_name}</p>
                          </div>
                       </div>

                       {/* Progress Radar */}
                       <div className="flex flex-col md:flex-row gap-4 items-center">
                          {[
                            { label: 'Screening', active: true, done: phase === 'reviewing' },
                            { label: 'Reviewing', active: phase === 'reviewing', done: false },
                            { label: 'Decision', active: false, done: false }
                          ].map((step, i) => (
                            <div key={i} className="flex-1 w-full flex items-center gap-3">
                               <div className={cn(
                                 "flex-1 h-20 rounded-2xl flex items-center px-6 gap-4 border transition-all",
                                 step.done ? "bg-emerald-50 border-emerald-100" : 
                                 step.active ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" : 
                                 "bg-slate-50 border-slate-100 text-slate-300"
                               )}>
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                                    step.done ? "bg-emerald-500 text-white" : step.active ? "bg-white/20" : "bg-slate-200"
                                  )}>
                                     {step.done ? <CheckCircle2 size={16} /> : i+1}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
                               </div>
                               {i < 2 && <ArrowRight className="hidden md:block text-slate-200" size={16} />}
                            </div>
                          ))}
                       </div>
                       
                       <p className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 border-dashed">
                          <Sparkles className="inline mr-2 text-blue-500" size={16} />
                          We are currently processing your application. Your profile looks professional and is being matched with the requirements for <strong>{internship?.title}</strong>.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
                    <h3 className="text-xl font-black mb-4 tracking-tight">Stay Competitive</h3>
                    <p className="text-sm text-blue-100 leading-relaxed font-medium mb-6">While you wait, keep exploring our feed to find more roles that match your skill set.</p>
                    <button 
                      onClick={() => window.location.href = '/feed'}
                      className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                    >
                      Browse More Roles
                    </button>
                 </div>
                 
                 <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-900/5 text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"><ShieldCheck size={24} /></div>
                    <h4 className="font-black text-slate-900 tracking-tight">Profile Verified</h4>
                    <p className="text-xs text-slate-400 font-medium">Your credentials have been securely verified and shared with the recruitment team.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: REJECTED ---
  if (phase === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
           <div className="bg-white rounded-[3rem] p-12 border border-rose-100 shadow-2xl shadow-rose-900/5 text-center space-y-8">
              <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto">
                 <AlertTriangle size={48} />
              </div>
              <div className="space-y-4">
                 <h1 className="text-3xl font-black text-slate-900 leading-tight">Thank You for Your Interest</h1>
                 <p className="text-slate-500 font-medium leading-relaxed">Unfortunately, the team at <strong>{internship?.company?.company_name}</strong> has decided not to proceed with your application for the <strong>{internship?.title}</strong> role at this time.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Step</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">Refine your portfolio and apply for different sectors to broaden your reach.</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keep Growing</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">Most successful professionals receive multiple rejections before their breakout role.</p>
                 </div>
              </div>
              <button 
                onClick={() => window.location.href='/feed'}
                className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95"
              >
                Find Your Next Role
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ENROLLED (WORKSPACE) ---
  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-8 md:p-12 pb-40 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -ml-20 -mb-20" />
         
         <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                >
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">Live Mission Control</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-2">{internship.title}</h1>
                <div className="flex items-center gap-4 text-blue-100/70 font-bold">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                     <Layout size={20} />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Organization</p>
                      <p className="text-lg">{internship.company?.company_name}</p>
                   </div>
                </div>
            </div>

            <div className="flex gap-6">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] text-center min-w-[140px] shadow-2xl">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-2 opacity-60">Completion</p>
                  <p className="text-4xl font-black">{Math.min(Math.round((logs.length / 90) * 100), 100)}%</p>
               </div>
               <div className="bg-blue-600 border border-white/10 p-6 rounded-[2.5rem] text-center min-w-[140px] shadow-2xl">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest mb-2 opacity-80">Skill XP</p>
                  <p className="text-4xl font-black">{logs.length * 520}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24">
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Center Column */}
            <div className="lg:col-span-3 space-y-8">
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="md:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 p-10 border border-blue-50 relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Today's Protocol</h2>
                              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{format(new Date(), 'EEEE, MMM do')}</p>
                           </div>
                           {todayLog && (
                              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
                                <CheckCircle2 size={16} /> Verified Active
                              </div>
                           )}
                        </div>

                        {!todayLog ? (
                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <textarea 
                                   value={learningLog}
                                   onChange={(e) => setLearningLog(e.target.value)}
                                   placeholder="Describe your achievements today..."
                                   className="w-full min-h-[160px] rounded-3xl bg-slate-50 border border-slate-100 p-8 focus:bg-white focus:ring-8 focus:ring-blue-50 focus:border-blue-300 transition-all font-semibold text-slate-700 text-base"
                                 />
                                 <div className="flex items-center justify-between px-2">
                                    <div className="flex gap-2">
                                       {[1,2,3,4,5].map(star => (
                                          <button key={star} onClick={() => setRating(star)} className={cn("transition-all", rating >= star ? "text-amber-400" : "text-slate-200")}>
                                             <Star size={14} fill={rating >= star ? 'currentColor' : 'none'} />
                                          </button>
                                       ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality of Session</span>
                                 </div>
                              </div>
                              <button 
                                onClick={handleCheckIn}
                                disabled={isCheckingIn || !learningLog}
                                className="w-full h-16 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-200 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-200 disabled:shadow-none"
                              >
                                 {isCheckingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                 Verify Office Perimeter & Log Done
                              </button>
                           </div>
                        ) : (
                           <div className="p-10 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-4">
                              <Zap className="mx-auto text-amber-400 fill-amber-400 animate-pulse" size={32} />
                              <h4 className="text-xl font-black text-slate-900 tracking-tight">Mission Completed</h4>
                              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Your productivity log has been synced with the company lead. Keep pushing!</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Tasks Summary */}
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CheckCircle2 size={120} />
                     </div>
                     <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                           <Trophy size={20} className="text-blue-300" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-tight">Current Priorities</h3>
                        <div className="space-y-4">
                           {tasks.length > 0 ? tasks.slice(0, 3).map((task: any) => (
                              <div key={task.id} className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                                 <span className="text-xs font-bold text-blue-100/80 truncate">{task.title}</span>
                              </div>
                           )) : (
                              <p className="text-xs text-slate-500">No active tasks assigned yet. Check in with your lead.</p>
                           )}
                        </div>
                     </div>
                     <button className="relative z-10 w-full h-14 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-colors">
                        View All Tasks
                     </button>
                  </div>
               </div>

               {/* Tabs View (Curriculum & History) */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Curriculum Hub */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                           <BookOpen className="text-blue-600" size={24} /> Learning Path
                        </h3>
                     </div>
                     <div className="space-y-4">
                        {curriculum.length > 0 ? curriculum.map((module: any, idx: number) => (
                           <motion.div 
                             key={module.id} 
                             whileHover={{ x: 6 }}
                             className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                             onClick={() => setActiveCurriculumId(activeCurriculumId === module.id ? null : module.id)}
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {module.week_number || idx + 1}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">{module.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Training • 15 Mins</p>
                                 </div>
                                 <ChevronRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                              </div>
                              <AnimatePresence>
                                {activeCurriculumId === module.id && (
                                   <motion.div 
                                     initial={{ height: 0, opacity: 0 }}
                                     animate={{ height: 'auto', opacity: 1 }}
                                     exit={{ height: 0, opacity: 0 }}
                                     className="overflow-hidden"
                                   >
                                      <div className="pt-6 space-y-4 border-t border-slate-100 mt-6">
                                         <p className="text-sm text-slate-500 font-medium leading-relaxed">{module.description}</p>
                                         <button className="w-full h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Play size={14} fill="currentColor" /> Start Module
                                         </button>
                                      </div>
                                   </motion.div>
                                )}
                              </AnimatePresence>
                           </motion.div>
                        )) : (
                           <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                              Roadmap Under Construction
                           </div>
                        )}
                     </div>
                  </div>

                  {/* History List */}
                  <div className="space-y-6">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight px-4 flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" size={24} /> Growth History
                     </h3>
                     <div className="space-y-4">
                        {logs.slice(0, 5).map((log: any, idx: number) => (
                           <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm flex gap-6">
                              <div className="shrink-0 flex flex-col items-center gap-2">
                                 <div className="w-4 h-4 rounded-full border-4 border-blue-50 bg-blue-600" />
                                 <div className="w-0.5 h-full bg-slate-50" />
                              </div>
                              <div className="space-y-2 flex-1">
                                 <div className="flex justify-between items-center">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{format(new Date(log.log_date), 'MMM d')}</p>
                                    <div className="flex gap-0.5">
                                       {Array.from({ length: 5 }).map((_, i) => (
                                          <div key={i} className={cn("w-1 h-1 rounded-full", i < log.experience_rating ? "bg-amber-400" : "bg-slate-100")} />
                                       ))}
                                    </div>
                                 </div>
                                 <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic">{log.learning_log}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
               {/* Financial Status */}
               <div className="bg-white rounded-[3rem] p-10 border border-blue-50 shadow-2xl shadow-blue-900/5 space-y-8 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner"><Lock size={32} /></div>
                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Access</p>
                     <h3 className="text-xl font-black text-slate-900">Tuition Secured</h3>
                     <p className="text-sm text-slate-500 font-medium">Your financial status is confirmed. You have full access to all curriculum modules.</p>
                  </div>
                  <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                     <ExternalLink size={14} />
                     Access Finances
                  </button>
               </div>

               {/* Mentorship / Supervisor Feedback */}
               <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><User size={24} /></div>
                  <h4 className="text-2xl font-black tracking-tight leading-tight">Lead Feedback</h4>
                  <p className="text-sm text-white/70 font-medium italic">"Keep documenting your refactors, they are invaluable for the team's codebase review."</p>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center font-black text-xs uppercase">ML</div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Mentor Lead</span>
                  </div>
               </div>

               {/* Location Geofence Status */}
               <div className="p-10 rounded-[3rem] bg-white border border-blue-100 shadow-xl text-center space-y-4">
                  <div className="flex justify-center -space-x-4">
                     <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-blue-600 z-10"><MapPin size={20} /></div>
                     <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center text-white"><CheckCircle2 size={20} /></div>
                  </div>
                  <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Office Proximity</h5>
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.1em]">Inside Perimeter</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Geofence (200m) active</p>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
