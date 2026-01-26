"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Briefcase, Calendar, CheckCircle2, Clock, 
  Layout, MapPin, MessageSquare, ShieldCheck, 
  Sparkles, Star, TrendingUp, Trophy, User,
  Loader2, ArrowRight, BookOpen, Zap
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Entering Workspace...</p>
        </div>
      </div>
    );
  }

  if (!data?.internship) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-20 text-center space-y-6">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto border border-slate-100">
            <Briefcase size={40} className="text-slate-200" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">No Active Internship</h1>
        <p className="text-slate-500 max-w-md mx-auto">Your accepted internship details will appear here once the recruitment team confirms your start date.</p>
        <button onClick={() => window.location.href = '/feed'} className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Browse Opportunities</button>
      </div>
    );
  }

  const { internship, logs } = data;
  const todayLog = logs.find((l: any) => l.log_date === new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-20">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-8 md:p-12 pb-32 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20" />
         
         <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                   <Sparkles size={14} className="text-blue-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Active Workspace</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{internship.title}</h1>
                <div className="flex items-center gap-3 text-blue-100/70 font-semibold">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                     <Layout size={18} />
                   </div>
                   <span>at {internship.company?.company_name || 'Organization'}</span>
                </div>
            </div>

            <div className="flex gap-4">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-center min-w-[120px]">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Days Logged</p>
                  <p className="text-3xl font-black">{logs.length}</p>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-center min-w-[120px]">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">XP Points</p>
                  <p className="text-3xl font-black">{logs.length * 50}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 space-y-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Log Center */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Daily Actions Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 border border-blue-50 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8">
                     <Calendar className="text-slate-50" size={100} />
                  </div>

                  <div className="relative z-10 space-y-8">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-slate-900">Today's Log</h2>
                           <p className="text-slate-400 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
                        </div>
                        {todayLog && (
                           <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest">
                             <CheckCircle2 size={14} /> Completed
                           </div>
                        )}
                     </div>

                     {!todayLog ? (
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 flex items-center gap-2">
                                <BookOpen size={12} /> What did you learn today?
                              </label>
                              <textarea 
                                value={learningLog}
                                onChange={(e) => setLearningLog(e.target.value)}
                                placeholder="E.g. Refactored the authentication flow using Next.js Middleware and Supabase Auth..."
                                className="w-full min-h-[160px] rounded-3xl bg-slate-50 border border-slate-200 p-6 focus:bg-white focus:ring-8 focus:ring-blue-50 focus:border-blue-300 transition-all font-medium text-slate-700"
                              />
                           </div>

                           <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1 space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 flex items-center gap-2">
                                  <Star size={12} /> Daily Rating
                                </label>
                                <div className="flex gap-2">
                                   {[1,2,3,4,5].map(star => (
                                      <button 
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={cn(
                                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                          rating >= star ? "bg-amber-400 text-white shadow-lg shadow-amber-200" : "bg-slate-100 text-slate-300"
                                        )}
                                      >
                                        <Trophy size={18} />
                                      </button>
                                   ))}
                                </div>
                              </div>

                              <div className="flex-[2] flex items-end">
                                 <button 
                                   onClick={handleCheckIn}
                                   disabled={isCheckingIn || !learningLog}
                                   className={cn(
                                      "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3",
                                      "bg-blue-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                   )}
                                 >
                                    {isCheckingIn ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                                    Verify Presence & Log Done
                                 </button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="p-8 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-4">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                              <Zap size={24} className="text-amber-500 fill-amber-500" />
                           </div>
                           <h4 className="text-xl font-black text-slate-900 tracking-tight">System Fully Updated</h4>
                           <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">You've successfully completed your log for today. Enjoy the rest of your session!</p>
                        </div>
                     )}
                  </div>
               </motion.div>

               {/* Timeline of Logs */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 ml-4">
                     <TrendingUp className="text-blue-500" size={20} />
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Timeline</h3>
                  </div>

                  <div className="space-y-4">
                     {logs.map((log: any, idx: number) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex gap-6"
                        >
                           <div className="flex flex-col items-center gap-2 pt-1">
                              <div className="w-5 h-5 rounded-full border-4 border-blue-50 bg-blue-600 shadow-lg shadow-blue-200" />
                              <div className="flex-1 w-0.5 bg-slate-50 group-last:bg-transparent" />
                           </div>
                           <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{format(new Date(log.log_date), 'MMMM d, yyyy')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                          <Clock size={10} /> {format(new Date(log.check_in), 'hh:mm aaa')}
                                       </span>
                                       {log.is_location_verified && (
                                          <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                                             <MapPin size={8} /> Verified
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex gap-1">
                                    {Array.from({ length: log.experience_rating || 5 }).map((_, i) => (
                                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                                    ))}
                                 </div>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic pr-8 relative">
                                 {log.learning_log}
                                 <MessageSquare className="absolute bottom-4 right-4 text-slate-100" size={24} />
                              </p>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right Column: Sidebar Stats */}
            <div className="space-y-8">
               {/* Financial Status */}
               <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-xl shadow-blue-900/5 space-y-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Finances</h3>
                  <div className="p-6 rounded-3xl bg-slate-50 space-y-4">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuition Rate</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{(internship.monthly_rate || 0).toLocaleString()} <span className="text-sm font-bold text-slate-400">XAF / mo</span></p>
                     </div>
                     <div className="h-px bg-slate-200" />
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Duration</span>
                        <span className="text-xs font-black text-slate-900">{internship.duration || '3 Months'}</span>
                     </div>
                  </div>
                  <button className="w-full h-12 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                     Download Invoice
                  </button>
               </div>

               {/* Mentorship Support Card */}
               <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                     <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center"><User size={28}/></div>
                     <div>
                        <h4 className="text-xl font-black tracking-tight mb-2">Need Help?</h4>
                        <p className="text-sm text-indigo-100 leading-relaxed font-medium mb-6">Connect with your supervisor or the Zigex community if you encounter any roadblocks.</p>
                        <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                           Open Support Chat <ArrowRight size={14} />
                        </button>
                     </div>
                  </div>
                  <User className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000" size={200} />
               </div>

               {/* Office Location Geofence Check */}
               <div className="p-8 rounded-[2.5rem] bg-white border border-blue-50 shadow-lg text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                     <MapPin size={24} />
                  </div>
                  <h5 className="font-black text-slate-900">Office Perimeter</h5>
                  <p className="text-xs text-slate-400 font-medium">Automatic verification active for security and attendance integrity.</p>
                  <div className="flex items-center justify-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Online</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
