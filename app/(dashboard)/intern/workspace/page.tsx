"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Briefcase, Calendar, CheckCircle2, Clock, 
  Layout, MapPin, MessageSquare, ShieldCheck, 
  Sparkles, Star, TrendingUp, Trophy, User,
  Loader2, ArrowRight, BookOpen, Zap, Target,
  ChevronRight, ExternalLink, Play, Lock, AlertTriangle,
  Notebook, CheckSquare, Settings, Users, PenTool,
  Hash, Search, Plus, Pin, Trash2, Save
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";

export default function InternWorkspace() {
  // Navigation State
  const [activeView, setActiveView] = useState<"overview" | "notebook" | "tasks" | "attendance">("overview");
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Checking in state
  const [learningLog, setLearningLog] = useState("");
  const [rating, setRating] = useState(5);

  // Notebook state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

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

  // Handle Note Update
  const handleSaveNote = async () => {
    if (!noteTitle || !noteContent) return toast.error("Please provide a title and content");
    setIsActionLoading(true);
    try {
        const resp = await fetch("/api/interns/workspace/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "save-note",
                internshipId: data.internship.id,
                title: noteTitle,
                content: noteContent,
                category: noteCategory,
                noteId: editingNoteId
            })
        });
        const result = await resp.json();
        if (result.success) {
            toast.success("Notebook entry updated");
            fetchWorkspaceData();
            setEditingNoteId(null);
            setNoteTitle("");
            setNoteContent("");
        }
    } catch (e) {
        toast.error("Failed to save note");
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setIsActionLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const resp = await fetch("/api/interns/workspace/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "check-in",
            internshipId: data.internship.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            learningLog,
            experienceRating: rating
          })
        });
        const result = await resp.json();
        if (result.success) {
          toast.success(result.locationVerified ? "Presence Verified!" : "Check-in Logged (Outside Area)");
          fetchWorkspaceData();
          setLearningLog("");
        }
      } catch (err) {
        toast.error("Check-in failed");
      } finally {
        setIsActionLoading(false);
      }
    });
  };

  // Task organization
  const groupedTasks = useMemo(() => {
    if (!data?.tasks) return {};
    return data.tasks.reduce((acc: any, task: any) => {
        const dept = task.department || "General";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(task);
        return acc;
    }, {});
  }, [data?.tasks]);

  if (isLoading) return (
     <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-6">
           <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Portal</p>
        </div>
     </div>
  );

  if (data?.phase === 'none') return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-blue-500/5">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto hover:scale-110 transition-transform"><Briefcase size={40} /></div>
           <div><h1 className="text-2xl font-black text-slate-900">Career Hub Empty</h1><p className="text-slate-400 mt-2 font-medium">Explore opportunities to start your journey.</p></div>
           <button onClick={() => window.location.href='/feed'} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700">Browse Vacancies</button>
        </div>
    </div>
  );

  const { internship, logs, tasks, notes, phase } = data;
  const todayLog = logs.find((l: any) => l.log_date === new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-10">
         <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
               <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="font-black text-slate-900 uppercase tracking-tighter text-xl">Intern OS</span>
         </div>

         <div className="flex flex-col gap-2">
            {[
               { id: 'overview', icon: Layout, label: 'Mission Control' },
               { id: 'notebook', icon: Notebook, label: 'Digital Notebook' },
               { id: 'tasks', icon: CheckSquare, label: 'Task Board' },
               { id: 'attendance', icon: Calendar, label: 'Logs & Metrics' },
            ].map(item => (
               <button 
                 key={item.id} 
                 onClick={() => setActiveView(item.id as any)}
                 className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm",
                    activeView === item.id ? "bg-blue-50 text-blue-600 shadow-sm" : "hover:bg-slate-50 text-slate-400"
                 )}
               >
                  <item.icon size={18} />
                  {item.label}
                  {activeView === item.id && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
               </button>
            ))}
         </div>

         <div className="mt-auto bg-slate-900 rounded-[2rem] p-6 text-white text-center space-y-4 relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
               <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Active Level</p>
               <h4 className="text-3xl font-black">Lvl {Math.floor(logs.length / 5) + 1}</h4>
               <p className="text-[10px] font-bold text-slate-400">Internship Protocol Active</p>
            </div>
            <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-screen overflow-y-auto">
         
         {/* Top Header Bar */}
         <header className="px-8 py-6 bg-white/50 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div>
                  <h1 className="text-lg font-black text-slate-900 leading-none">{internship?.title}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">at {internship?.company?.company_name}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
               </div>
               <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden"><User className="w-full h-full p-2 text-slate-300" /></div>
            </div>
         </header>

         <main className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
               {activeView === "overview" && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                           {/* Quick Action: Log of the day */}
                           <div className="bg-white rounded-[2.5rem] p-10 border border-blue-50 shadow-2xl shadow-blue-500/5 relative group bg-gradient-to-br from-white to-blue-50/20">
                              <div className="relative z-10 space-y-6">
                                 <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Sync Your Progress</h3>
                                    <p className="text-slate-400 font-medium">Verify your presence and record today's major achievements.</p>
                                 </div>

                                 {!todayLog ? (
                                    <div className="space-y-6">
                                       <textarea 
                                          value={learningLog}
                                          onChange={e => setLearningLog(e.target.value)}
                                          placeholder="What significant thing did you build or learn today? (e.g., Integrated ML model using FastAPI...)"
                                          className="w-full min-h-[140px] rounded-3xl bg-white border border-slate-200 p-6 focus:ring-8 focus:ring-blue-100/50 transition-all font-medium text-slate-700"
                                       />
                                       <div className="flex flex-col md:flex-row gap-4">
                                          <div className="flex-1 flex gap-1">
                                             {[1,2,3,4,5].map(s => (
                                                <button key={s} onClick={() => setRating(s)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", rating >= s ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-300")}><Trophy size={14} /></button>
                                             ))}
                                          </div>
                                          <button 
                                            onClick={handleCheckIn}
                                            disabled={isActionLoading || !learningLog}
                                            className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-200 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:bg-slate-100"
                                          >
                                             {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                                             Engage Portal & Verify Presence
                                          </button>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="p-8 rounded-3xl bg-blue-600 space-y-4 text-center">
                                       <Zap size={32} className="text-amber-400 mx-auto fill-amber-400" />
                                       <h4 className="text-xl font-black text-white">Daily Log Finalized</h4>
                                       <p className="text-blue-100/80 text-sm font-medium">You've successfully secured your XP and attendance for today.</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Task Pulse */}
                               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                  <div className="absolute top-0 right-0 p-8 opacity-10"><CheckSquare size={100} /></div>
                                  <div className="space-y-6">
                                     <h3 className="text-2xl font-black tracking-tight">Active Sprints</h3>
                                     <div className="space-y-4">
                                        {tasks.slice(0,2).map((t: any) => (
                                           <div key={t.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                              <div>
                                                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t.department}</p>
                                                 <p className="text-xs font-bold text-white leading-relaxed">{t.title}</p>
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                                  <button onClick={() => setActiveView("tasks")} className="h-12 w-full bg-white text-slate-900 rounded-xl mt-8 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">Go to Board</button>
                               </div>

                               {/* XP Tracker */}
                               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl flex flex-col justify-between">
                                  <div className="space-y-6">
                                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Skill XP</h3>
                                     <div className="relative h-24 bg-slate-50 rounded-2xl flex items-end p-4 gap-2 overflow-hidden">
                                        {logs.slice(0, 10).map((l: any, i: number) => (
                                           <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-indigo-600" style={{ height: `${(l.experience_rating || 5) * 20}%` }} />
                                        ))}
                                        <div className="absolute top-4 right-4 text-3xl font-black text-slate-200">{(logs.length * 520).toLocaleString()}</div>
                                     </div>
                                  </div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-6">Consistency multiplier: 1.2x active</p>
                               </div>
                           </div>
                        </div>

                        {/* Recent Notes sidebar */}
                        <div className="space-y-8">
                           <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-xl shadow-blue-500/5 space-y-6">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-lg font-black text-slate-900 tracking-tight">Notebook</h4>
                                 <button onClick={() => { setActiveView("notebook"); setEditingNoteId(null); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Plus size={16} /></button>
                              </div>
                              <div className="space-y-3">
                                 {notes.slice(0, 4).map((n: any) => (
                                    <div key={n.id} onClick={() => { setActiveView("notebook"); setEditingNoteId(n.id); setNoteTitle(n.title); setNoteContent(n.content); setNoteCategory(n.category); }} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group">
                                       <div className="flex justify-between items-start mb-1">
                                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{n.category}</p>
                                          {n.is_pinned && <Pin size={10} className="text-blue-500 fill-blue-500" />}
                                       </div>
                                       <h5 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{n.title}</h5>
                                    </div>
                                 ))}
                              </div>
                              <button onClick={() => setActiveView("notebook")} className="w-full h-10 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">View All Entries</button>
                           </div>

                           <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                              <MapPin className="absolute -right-8 -bottom-8 opacity-10" size={150} />
                              <div className="relative z-10 space-y-4">
                                 <h4 className="text-xl font-black tracking-tight leading-tight">Institutional Hub</h4>
                                 <p className="text-blue-100/70 text-sm font-medium">Automatic attendance verification active for the <strong>Zigex HQ Perimeter</strong>.</p>
                                 <div className="flex gap-2 items-center text-[9px] font-black uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Active Beacon Detection
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* Notebook View */}
               {activeView === "notebook" && (
                  <motion.div 
                    key="notebook"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                  >
                     {/* Note List */}
                     <div className="lg:col-span-1 space-y-6">
                        <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-black text-slate-900">Archive</h2>
                           <button onClick={() => { setEditingNoteId(null); setNoteTitle(""); setNoteContent(""); setNoteCategory("General"); }} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Plus size={20} /></button>
                        </div>
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input type="text" placeholder="Search archive..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-medium focus:ring-4 focus:ring-blue-50 transition-all" />
                        </div>
                        <div className="space-y-4">
                           {notes.map((n: any) => (
                              <div 
                                key={n.id} 
                                onClick={() => { setEditingNoteId(n.id); setNoteTitle(n.title); setNoteContent(n.content); setNoteCategory(n.category); }}
                                className={cn(
                                   "p-6 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl",
                                   editingNoteId === n.id ? "bg-white border-blue-200 shadow-2xl scale-[1.02]" : "bg-white border-slate-100 shadow-sm"
                                )}
                              >
                                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{n.category}</p>
                                 <h4 className="font-bold text-slate-900 mb-2 leading-tight">{n.title}</h4>
                                 <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{n.content}</p>
                                 <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                    <span>{format(new Date(n.updated_at), 'MMM d, yyyy')}</span>
                                    <span>{n.content.split(' ').length} words</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Editor View */}
                     <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[3rem] p-10 border border-blue-50 shadow-2xl shadow-blue-900/5 min-h-[600px] flex flex-col bg-[url('/notebook-line.svg')] bg-repeat-y">
                           <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
                              <div className="flex-1 space-y-2 w-full">
                                 <input 
                                   type="text" 
                                   value={noteTitle}
                                   onChange={e => setNoteTitle(e.target.value)}
                                   placeholder="Untitled Thought" 
                                   className="text-4xl font-black text-slate-900 tracking-tight w-full placeholder:opacity-20 border-none p-0 focus:ring-0"
                                 />
                                 <div className="flex gap-3">
                                    {['Frontend', 'Backend', 'DevOps', 'General'].map(cat => (
                                       <button 
                                         key={cat} 
                                         onClick={() => setNoteCategory(cat)}
                                         className={cn(
                                           "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                           noteCategory === cat ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                         )}
                                       >{cat}</button>
                                    ))}
                                 </div>
                              </div>
                              <button 
                                onClick={handleSaveNote}
                                disabled={isActionLoading || !noteTitle}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                              >
                                {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Secure Entry
                              </button>
                           </div>
                           <textarea 
                             value={noteContent}
                             onChange={e => setNoteContent(e.target.value)}
                             placeholder="Capture the technical details, implementation steps, and architectural decisions..."
                             className="flex-1 w-full border-none p-0 focus:ring-0 text-slate-700 font-medium leading-loose text-lg resize-none min-h-[400px] placeholder:opacity-20"
                           />
                           <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-[11px] font-black text-slate-300 uppercase tracking-widest italic">
                              <div className="flex items-center gap-2"><PenTool size={14} /> Drafting in Realtime</div>
                              <div>Auto-save active</div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* Tasks Board View */}
               {activeView === "tasks" && (
                  <motion.div 
                    key="tasks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-10"
                  >
                     <div className="flex justify-between items-center">
                        <div className="space-y-1">
                           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Priority Grid</h2>
                           <p className="text-slate-400 font-medium italic">Managed by mentor leads across departments.</p>
                        </div>
                        <div className="bg-white p-2 rounded-2xl border border-slate-100 flex shadow-sm">
                           <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">Active Sprint</button>
                           <button className="px-4 py-2 hover:bg-slate-50 text-slate-400 rounded-xl text-xs font-bold transition-colors">Archive</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Object.entries(groupedTasks).map(([dept, deptTasks]: any) => (
                           <div key={dept} className="space-y-6">
                              <div className="flex items-center justify-between px-2">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm"><Hash size={14} className="text-blue-500" /></div>
                                    <h4 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">{dept}</h4>
                                 </div>
                                 <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{deptTasks.length}</span>
                              </div>
                              <div className="space-y-4">
                                 {deptTasks.map((task: any) => (
                                    <motion.div 
                                      whileHover={{ scale: 1.02 }}
                                      key={task.id} 
                                      className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-2xl transition-all group"
                                    >
                                       <div className="flex justify-between items-start mb-4">
                                          <div className={cn(
                                             "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                             task.priority === 'critical' ? "bg-rose-50 text-rose-500" :
                                             task.priority === 'high' ? "bg-amber-50 text-amber-500" :
                                             "bg-emerald-50 text-emerald-500"
                                          )}>{task.priority}</div>
                                          <div className="w-6 h-6 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-100 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors"><CheckCircle2 size={12} /></div>
                                       </div>
                                       <h5 className="font-bold text-slate-800 mb-3 leading-snug">{task.title}</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3 mb-6">{task.description}</p>
                                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4 border-t border-slate-50 text-slate-300">
                                          <div className="flex items-center gap-1.5"><Clock size={12} /> {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No due date'}</div>
                                          <div className="flex -space-x-2">
                                             <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />
                                             <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"><User size={10} className="text-blue-600" /></div>
                                          </div>
                                       </div>
                                    </motion.div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {/* Attendance View */}
               {activeView === "attendance" && (
                  <motion.div 
                    key="attendance"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-10"
                  >
                     <div className="bg-white rounded-[3rem] p-12 border border-blue-50 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><Calendar size={200} /></div>
                        <div className="relative z-10 space-y-10">
                           <div className="flex justify-between items-center">
                              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Persistence Log</h2>
                              <div className="flex gap-4 items-center">
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Attendance</p>
                                    <h4 className="text-xl font-black text-slate-900">{(logs.length / 90 * 100).toFixed(1)}%</h4>
                                 </div>
                                 <div className="w-px h-8 bg-slate-100" />
                                 <button className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><TrendingUp size={20} /></button>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                              {/* Mock heatmap of the week */}
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                 <div key={day} className="space-y-3">
                                    <p className="text-[9px] font-black text-slate-300 uppercase text-center tracking-widest">{day}</p>
                                    <div className="h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                       <div className="w-8 h-8 rounded-full bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center text-white"><CheckCircle2 size={16} /></div>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="space-y-4">
                              {logs.map((log: any) => (
                                 <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-50 border-dashed">
                                    <div className="flex items-center gap-6">
                                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 font-bold">{format(new Date(log.log_date), 'dd')}</div>
                                       <div>
                                          <p className="font-black text-slate-900">{format(new Date(log.log_date), 'MMMM yyyy')}</p>
                                          <div className="flex gap-4 mt-1">
                                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10} /> {format(new Date(log.check_in), 'hh:mm aaa')}</span>
                                             {log.is_location_verified && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full"><MapPin size={8} /> Onsite Verified</span>}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 max-w-md text-right">
                                       <p className="text-xs text-slate-500 font-medium italic line-clamp-1">"{log.learning_log}"</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </main>
      </div>
    </div>
  );
}
