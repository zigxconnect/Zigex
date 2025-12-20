// components/NotificationDropdown.tsx
"use client";

import { Bell, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export const NotificationDropdown = ({ initialNotifications = [] }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications from backend
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
      // Calculate unread count from actual notifications
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
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Handle clicks outside dropdown
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
    // Find if notification is already read
    const notification = notifications.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.read;

    // Optimistically update UI
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    
    // Only decrease count if it was unread
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Mark as read in backend
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
    
    // Navigate to appropriate page
    let route = "/";
    if (type === "internship") route = `/internships/${referenceId}?from=notification`;
    else if (type === "event") route = `/events/${referenceId}?from=notification`;
    else route = `/programs/${referenceId}?from=notification`;
    router.push(route);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    // Only proceed if there are unread notifications
    if (unreadNotifications.length === 0) return;
    
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    // Send to backend
    try {
      await fetch("/api/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Refetch on error
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
        className="relative p-2.5 text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-down">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No notifications yet</p>
                <p className="text-muted-foreground text-sm mt-1">We'll notify you when something arrives!</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-border last:border-b-0 transition-colors ${
                      !notification.read ? "bg-blue-50 hover:bg-blue-100" : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <button
                      onClick={() => handleNotificationClick(notification.id, notification.referenceId, notification.type)}
                      className="block p-4 w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm ${!notification.read ? "text-blue-800" : "text-foreground"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-border text-center bg-muted/30">
              <Link 
                href="/notifications" 
                onClick={() => setIsOpen(false)}
                className="text-blue-600 text-sm hover:underline font-medium"
              >
                View All Notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};