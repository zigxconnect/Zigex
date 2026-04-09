// components/NotificationDropdown.tsx
"use client";

import { 
  Bell, 
  X, 
  CheckCheck, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  ChevronRight,
  Inbox,
  Clock
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

// Get icon based on notification type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "internship":
      return <Briefcase className="w-4 h-4" />;
    case "event":
      return <Calendar className="w-4 h-4" />;
    case "program":
    default:
      return <GraduationCap className="w-4 h-4" />;
  }
};

// Get gradient based on notification type
const getTypeAccent = (type: string) => {
  switch (type) {
    case "internship":
      return "bg-emerald-500";
    case "event":
      return "bg-violet-500";
    case "program":
    default:
      return "bg-blue-600";
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
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
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

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300 active:scale-90 flex items-center justify-center",
          isOpen 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
            : "bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 border border-slate-100 shadow-sm"
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} className={cn(isOpen && "animate-bounce")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white ring-1 ring-red-500/20">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed inset-x-4 top-20 mx-auto w-auto max-w-sm md:absolute md:right-0 md:left-auto md:top-full md:mt-3 md:w-[400px] md:mx-0 md:inset-x-auto bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-br from-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Bell size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight leading-none mb-1">Alerts</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {unreadCount} UNREAD UPDATES
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                    title="Mark all as read"
                  >
                    <CheckCheck size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[min(480px,70vh)] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-10 py-16 text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto ring-1 ring-slate-100">
                      <Inbox className="w-8 h-8 text-slate-200" />
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black tracking-tight">Zero distractions!</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Nothing new to show</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification, index) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification.id, notification.referenceId, notification.type)}
                      className={cn(
                        "w-full text-left p-6 transition-all relative group",
                        !notification.read ? "bg-white" : "bg-slate-50/30 grayscale-[0.5] opacity-80"
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute top-6 left-0 w-1 h-10 bg-blue-600 rounded-r-full shadow-[2px_0_8px_rgba(37,99,235,0.4)]" />
                      )}
                      
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-[1rem] flex-shrink-0 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 duration-300",
                          getTypeAccent(notification.type)
                        )}>
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className={cn(
                              "text-sm font-black tracking-tight line-clamp-1 transition-colors group-hover:text-blue-600",
                              !notification.read ? "text-slate-900" : "text-slate-500"
                            )}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-0.5 uppercase">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mb-3">
                            {notification.content}
                          </p>

                          <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <span>DETAILS</span>
                            <ChevronRight size={10} strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                >
                  <span>View All Notifications</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};