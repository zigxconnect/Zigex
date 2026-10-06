// components/NotificationDropdown.tsx
"use client";

import { Bell, Briefcase, Calendar, CheckCheck, GraduationCap, Inbox, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { listNotifications, markAllNotificationsRead, markNotificationsRead } from "@/lib/api/notifications-client";

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
      const mapped = (await listNotifications()) as Notification[];
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
      await markNotificationsRead([notificationId]);
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
      await markAllNotificationsRead();
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
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]",
          isOpen ? "bg-[#EEF3FF] text-[#155DFC]" : "text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
        )}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D92D20] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-[72px] z-[100] overflow-hidden rounded-xl border border-[#DCE5F5] bg-white shadow-[0_16px_40px_-12px_rgba(11,27,63,0.25)] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[380px]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF2FA] px-4 py-3">
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0B1B3F]">Notifications</h3>
              <p className="text-[13px] text-[#4A5670]">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-[#155DFC] hover:bg-[#F3F7FF]"
                >
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[min(440px,65vh)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Inbox className="mx-auto h-8 w-8 text-[#B9C8E6]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#0B1B3F]">No notifications yet</p>
                <p className="mt-1 text-[13px] text-[#4A5670]">Updates about your applications will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#EEF2FA]">
                {notifications.slice(0, 6).map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification.id, notification.referenceId, notification.type)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none",
                        !notification.read && "bg-[#F5F8FF]"
                      )}
                    >
                      <span
                        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", notification.read ? "bg-transparent" : "bg-[#155DFC]")}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-sm", notification.read ? "text-[#4A5670]" : "font-semibold text-[#0B1B3F]")}>
                          {notification.title}
                        </span>
                        {notification.content && (
                          <span className="mt-0.5 line-clamp-2 block text-[13px] text-[#4A5670]">{notification.content}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-[#7B869C]">{formatTime(notification.timestamp)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex h-11 items-center justify-center border-t border-[#EEF2FA] text-sm font-semibold text-[#155DFC] hover:bg-[#F8FAFF]"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};
