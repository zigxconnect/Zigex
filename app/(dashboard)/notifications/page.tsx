// app/(dashboard)/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Bell, 
  Clock, 
  CheckCheck, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Inbox,
  ArrowRight,
  Circle,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  content: string;
  referenceId: string;
  type: "program" | "event" | "internship";
  read: boolean;
  timestamp: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "internship":
      return <Briefcase className="w-6 h-6" strokeWidth={2.5} />;
    case "event":
      return <Calendar className="w-6 h-6" strokeWidth={2.5} />;
    case "program":
    default:
      return <GraduationCap className="w-6 h-6" strokeWidth={2.5} />;
  }
};

const getTypeAccent = (type: string) => {
  switch (type) {
    case "internship":
      return "bg-emerald-500 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)]";
    case "event":
      return "bg-violet-500 shadow-[0_20px_50px_-10px_rgba(139,92,246,0.3)]";
    case "program":
    default:
      return "bg-[#155DFC] shadow-[0_20px_50px_-10px_rgba(21,93,252,0.3)]";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    fetch("/api/students/notifications")
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data.notifications || []).map(
          (n: any): Notification => ({
            id: n.id,
            title: n.title,
            content: n.message,
            referenceId: n.reference_id,
            type: n.type || "program",
            read: n.is_read,
            timestamp: n.created_at,
          })
        );
        setNotifications(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      fetchNotifications();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const filteredNotifications = notifications
    .filter(n => filter === "unread" ? !n.read : true)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[3rem] animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-12 w-64 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
              <div className="h-6 w-40 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950/50 py-12 sm:py-24 px-6 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] -ml-72 -mb-72 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Premium Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="flex items-start gap-8"
          >
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-[#155DFC] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="relative w-28 h-28 bg-[#155DFC] rounded-[3rem] flex items-center justify-center text-white shadow-[0_30px_60px_-15px_rgba(21,93,252,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-700">
                <Bell size={44} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-700" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center border-4 border-[#155DFC] shadow-xl"
                >
                  <Sparkles size={16} className="text-[#155DFC]" />
                </motion.div>
              </div>
            </div>
            <div className="pt-2">
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">Updates</h1>
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-blue-500/10 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#155DFC] animate-pulse" />
                  <span className="text-[11px] font-black text-[#155DFC] uppercase tracking-[0.25em]">
                    {unreadCount} Priority Notifications
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="h-20 px-12 bg-white dark:bg-slate-900 hover:bg-[#155DFC] hover:text-white text-slate-900 dark:text-white rounded-[2rem] flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 group"
            >
              <CheckCheck size={22} strokeWidth={2.5} className="group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              <span>Resolve All</span>
            </motion.button>
          )}
        </div>

        {/* Discovery & Navigation Bar */}
        <div className="mb-16 flex flex-col sm:flex-row gap-6 p-3 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-3xl rounded-[2.5rem] border border-white dark:border-slate-800/50">
          <div className="flex-1 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#155DFC] transition-colors" size={20} strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Search activity history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-16 pr-8 bg-white dark:bg-slate-950/50 border-2 border-transparent focus:border-[#155DFC]/20 rounded-[2rem] text-sm font-black outline-none transition-all shadow-sm focus:shadow-xl focus:shadow-blue-500/5 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>
          <div className="flex gap-3">
            {[
              { id: "all", label: "Discovery", icon: Inbox },
              { id: "unread", label: "Active", icon: Bell }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={cn(
                  "h-16 px-10 rounded-[2rem] flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-700 border-2",
                  filter === t.id 
                    ? "bg-[#155DFC] text-white border-[#155DFC] shadow-[0_20px_40px_-10px_rgba(21,93,252,0.3)]" 
                    : "bg-white dark:bg-slate-950/50 text-slate-400 dark:text-slate-600 border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                )}
              >
                <t.icon size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Notification Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="py-48 text-center bg-white/50 dark:bg-slate-900/20 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800/50"
              >
                <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100 dark:ring-slate-800">
                  <Inbox size={48} strokeWidth={1} className="text-slate-200 dark:text-slate-800" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Void Detected</h3>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] max-w-xs mx-auto opacity-60">No activity data found matching your current parameters</p>
              </motion.div>
            ) : (
              filteredNotifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  layout
                >
                  <Card className={cn(
                    "relative overflow-hidden border-2 transition-all duration-700 group rounded-[4rem] p-8 sm:p-14",
                    !n.read 
                      ? "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] hover:border-[#155DFC]/20" 
                      : "bg-slate-50/30 dark:bg-slate-950/20 border-transparent opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                  )}>
                    <div className="flex flex-col sm:flex-row gap-12 sm:items-center">
                      <div className={cn(
                        "w-28 h-28 rounded-[3rem] flex items-center justify-center text-white shrink-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-6",
                        getTypeAccent(n.type)
                      )}>
                        {getTypeIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                          <div className="flex items-center gap-6">
                             {!n.read && (
                               <div className="w-4 h-4 bg-[#155DFC] rounded-full animate-pulse shadow-[0_0_20px_rgba(21,93,252,0.8)]" />
                             )}
                             <h2 className={cn(
                               "text-2xl sm:text-3xl font-black tracking-tight transition-all duration-700 group-hover:text-[#155DFC] group-hover:translate-x-1",
                               !n.read ? "text-slate-900 dark:text-white" : "text-slate-500"
                             )}>
                               {n.title}
                             </h2>
                          </div>
                          <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <Clock size={14} className="text-slate-400" strokeWidth={2.5} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
                              {formatTime(n.timestamp)}
                            </span>
                          </div>
                        </div>

                        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-700">
                          {n.content}
                        </p>

                        <div className="flex items-center justify-between gap-8 pt-4">
                           <div className="flex gap-4">
                             {!n.read && (
                               <button 
                                 onClick={() => markAsRead(n.id)}
                                 className="h-14 px-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#155DFC] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-500"
                               >
                                 Resolve
                               </button>
                             )}
                           </div>
                           
                           <Link 
                            href={`/feed/${n.referenceId}`}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.4em] text-[#155DFC] group/link relative overflow-hidden h-14 px-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 hover:bg-[#155DFC] hover:text-white transition-all duration-700"
                           >
                             <span className="relative z-10 group-hover/link:scale-105 transition-transform">Inspect</span>
                             <ArrowRight size={18} strokeWidth={3} className="relative z-10 group-hover/link:translate-x-2 transition-transform duration-700" />
                           </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer Spacing */}
        <div className="h-48" />
      </div>
    </div>
  );
}
