"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Bell, 
  Clock, 
  ExternalLink, 
  CheckCheck, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Sparkles,
  Filter,
  Inbox,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  content: string;
  referenceId: string;
  type: "program" | "event" | "internship";
  read: boolean;
  timestamp: string;
}

// Get icon based on notification type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "internship":
      return <Briefcase className="w-5 h-5" />;
    case "event":
      return <Calendar className="w-5 h-5" />;
    case "program":
    default:
      return <GraduationCap className="w-5 h-5" />;
  }
};

// Get gradient based on notification type
const getTypeGradient = (type: string, read: boolean) => {
  if (read) return "from-slate-100 to-slate-50";
  switch (type) {
    case "internship":
      return "from-emerald-500/10 to-teal-500/5";
    case "event":
      return "from-violet-500/10 to-purple-500/5";
    case "program":
    default:
      return "from-blue-500/10 to-indigo-500/5";
  }
};

// Get accent color based on type
const getTypeAccent = (type: string) => {
  switch (type) {
    case "internship":
      return "bg-gradient-to-br from-emerald-500 to-teal-600 text-white";
    case "event":
      return "bg-gradient-to-br from-violet-500 to-purple-600 text-white";
    case "program":
    default:
      return "bg-gradient-to-br from-blue-500 to-indigo-600 text-white";
  }
};

// Get badge style based on type
const getTypeBadge = (type: string) => {
  switch (type) {
    case "internship":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "event":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "program":
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

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
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationLink = (type: string, referenceId: string) => {
    // All notifications now go to /feed/ for consistency
    return `/feed/${referenceId}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* Hero Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse mb-3" />
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          {/* Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 border-0 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-6 sm:py-10 px-4">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Premium Hero Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Stay updated on your opportunities
                  </p>
                </div>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all",
                filter === "all" 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
              onClick={() => setFilter("all")}
            >
              <Inbox className="w-4 h-4 mr-2" />
              All ({notifications.length})
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all",
                filter === "unread" 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              )}
              onClick={() => setFilter("unread")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Unread ({unreadCount})
            </Badge>
          </div>
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-white p-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {filter === "unread" 
                  ? "You've read all your notifications. Check back later for new updates."
                  : "When you receive notifications about opportunities, they'll appear here."}
              </p>
              {filter === "unread" && notifications.length > 0 && (
                <button 
                  onClick={() => setFilter("all")}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  View all notifications →
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((n, index) => (
              <Card
                key={n.id}
                className={cn(
                  "border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group",
                  !n.read && "ring-2 ring-blue-500/20"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-5 sm:p-6 bg-gradient-to-r transition-all duration-300",
                  getTypeGradient(n.type, n.read),
                  !n.read && "hover:from-blue-500/15"
                )}>
                  <div className="flex gap-4">
                    {/* Type Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110",
                      getTypeAccent(n.type)
                    )}>
                      {getTypeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={cn(
                            "font-bold text-base sm:text-lg leading-tight",
                            !n.read ? "text-slate-900" : "text-slate-700"
                          )}>
                            {n.title}
                          </h2>
                          {!n.read && (
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-medium capitalize flex-shrink-0",
                            getTypeBadge(n.type)
                          )}
                        >
                          {n.type}
                        </Badge>
                      </div>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-2 mb-4">
                        {n.content}
                      </p>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(n.timestamp)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {!n.read && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                markAsRead(n.id);
                              }}
                              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <Link
                            href={getNotificationLink(n.type, n.referenceId)}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group/btn"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Spacing for Mobile Nav */}
        <div className="h-20 sm:h-0" />
      </div>
    </div>
  );
}
