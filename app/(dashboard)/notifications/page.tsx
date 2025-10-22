"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Clock, ExternalLink, CheckCheck } from "lucide-react";
import { LoadingSkeleton, NotificationSkeleton } from "@/components/LoadingSkeleton";

interface Notification {
  id: string;
  title: string;
  content: string;
  programId: string;
  read: boolean;
  timestamp: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    fetch("/api/students/notifications")
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.message,
          programId: n.reference_id,
          read: n.is_read,
          timestamp: n.created_at,
        }));
        setNotifications(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markAsRead = async (notificationId: string) => {
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    // Send to backend
    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Send to backend
    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          {/* Use a notification-specific skeleton for loading state */}
          <NotificationSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Notifications
              </h1>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium w-full sm:w-auto justify-center"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
          <p className="text-slate-600 ml-0 sm:ml-13">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications yet</h3>
            <p className="text-slate-500">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="block group">
                <div
                  className={`relative bg-white rounded-2xl shadow-sm border-2 p-4 md:p-5 transition-all duration-300 ease-out ${n.read ? 'border-slate-200' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'}`}
                >
                  {/* Unread indicator */}
                  {!n.read && (
                    <div className="absolute top-6 right-6">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-400"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col gap-3">
                    {/* Title and timestamp */}
                    <div className="flex items-start justify-between gap-4 pr-6">
                      <h2 className={`
                        font-semibold text-lg sm:text-xl leading-tight
                        ${n.read ? 'text-slate-800' : 'text-blue-900'}
                      `}>
                        {n.title}
                      </h2>
                    </div>

                    {/* Message content */}
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {n.content}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(n.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              markAsRead(n.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors w-full sm:w-auto justify-center"
                            aria-label={`Mark notification ${n.id} as read`}
                          >
                            <CheckCheck className="w-3 h-3" />
                            Mark read
                          </button>
                        )}

                        <Link
                          href={`/programs/${n.programId}?from=notification`}
                          onClick={() => !n.read && markAsRead(n.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all hover:gap-3 hover:shadow-lg w-full sm:w-auto justify-center"
                        >
                          <span>View Program</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}