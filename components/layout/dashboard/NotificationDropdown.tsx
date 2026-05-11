// components/NotificationDropdown.tsx
"use client";

import { 
  Bell, 
  X, 
  CheckCheck, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Inbox,
  Clock,
  Circle,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  content: string;
  referenceId: string;
  type: 'program' | 'event' | 'internship';
  read: boolean;
  timestamp: string;
}

interface NotificationDropdownProps {
  initialNotifications?: Notification[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "internship":
      return <Briefcase className="w-5 h-5" strokeWidth={2.5} />;
    case "event":
      return <Calendar className="w-5 h-5" strokeWidth={2.5} />;
    case "program":
    default:
      return <GraduationCap className="w-5 h-5" strokeWidth={2.5} />;
  }
};

const getTypeAccent = (type: string) => {
  switch (type) {
    case "internship":
      return "bg-emerald-500 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)]";
    case "event":
      return "bg-violet-500 shadow-[0_10px_30px_-5px_rgba(139,92,246,0.3)]";
    case "program":
    default:
      return "bg-[#155DFC] shadow-[0_10px_30px_-5px_rgba(21,93,252,0.3)]";
  }
};

export const NotificationDropdown = ({ initialNotifications = [] }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/students/notifications");
      const data = await res.json();
      const mapped = (data.notifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.message,
        referenceId: n.reference_id,
        type: n.type || 'program',
        read: n.is_read,
        timestamp: n.created_at,
      }));
      setNotifications(mapped);
      const unread = mapped.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error("Error fetching notifications:", e);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = async (notificationId: string, referenceId: string, type: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.read;

    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }

    setIsOpen(false);
    router.push(`/feed/${referenceId}`);
    
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    if (!isOpen && window.navigator.vibrate) window.navigator.vibrate(5);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
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

    if (diffInMinutes < 1) return "Now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d";
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={cn(
          "relative w-10 h-10 transition-all duration-300 active:scale-90 flex items-center justify-center group outline-none",
          isOpen ? "text-[#155DFC]" : "text-slate-400 hover:text-[#155DFC]"
        )}
      >
        <Bell size={20} className={cn("transition-all duration-500", isOpen ? "scale-110" : "group-hover:rotate-12")} strokeWidth={3} />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 border-2 border-white dark:border-slate-950 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg" 
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 top-[73px] mx-auto w-full md:absolute md:right-[-20px] md:left-auto md:top-full md:mt-0 md:w-[420px] md:mx-0 md:inset-x-auto bg-white dark:bg-slate-950 border-x md:border-l border-b border-slate-100 dark:border-slate-800 shadow-[20px_40px_80px_rgba(0,0,0,0.15)] z-[100] overflow-hidden rounded-none"
          >
            {/* Glossy Header */}
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-900/50">
               <div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Notifications</h3>
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">
                   {unreadCount} UNREAD SIGNAL{(unreadCount > 1 || unreadCount === 0) ? 'S' : ''}
                 </p>
               </div>
               <div className="flex items-center gap-2 relative z-10">
                 {unreadCount > 0 && (
                   <button
                     onClick={markAllAsRead}
                     className="p-3.5 text-slate-400 hover:text-[#155DFC] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all"
                     title="Mark all as read"
                   >
                     <CheckCheck size={20} strokeWidth={2.5} />
                   </button>
                 )}
                 <button
                   onClick={() => setIsOpen(false)}
                   className="p-3.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                 >
                   <X size={20} strokeWidth={2.5} />
                 </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[min(520px,70vh)] overflow-y-auto hide-scrollbar px-4 pb-4">
              {notifications.length === 0 ? (
                <div className="px-12 py-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800/50">
                    <Inbox className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Pure Silence</h4>
                  <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">No activities to show</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {notifications.map((notification, index) => (
                      <motion.button
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: "spring", damping: 25 }}
                        onClick={() => handleNotificationClick(notification.id, notification.referenceId, notification.type)}
                        className={cn(
                          "w-full text-left p-5 transition-all duration-300 relative flex items-start gap-4 group outline-none border-b border-slate-50 dark:border-slate-900/50 last:border-0",
                          !notification.read 
                            ? "bg-blue-50/30 dark:bg-blue-900/5" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-900/30"
                        )}
                      >
                        {/* Status Dot */}
                        <div className="pt-1.5 shrink-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500",
                            !notification.read ? "bg-[#155DFC] shadow-[0_0_10px_rgba(21,93,252,0.8)]" : "bg-slate-200 dark:bg-slate-800"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-0.5">
                            <h4 className={cn(
                              "text-[13px] font-black tracking-tight truncate group-hover:text-[#155DFC] transition-colors uppercase",
                              !notification.read ? "text-slate-900 dark:text-white" : "text-slate-400"
                            )}>
                              {notification.title}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 italic">
                            {notification.content}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#155DFC] dark:hover:bg-[#155DFC] dark:hover:text-white group/footer"
              >
                <span>Full Activity History</span>
                <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArrowRight = ({ className, size = 16 }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);