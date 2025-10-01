// components/NotificationDropdown.tsx
"use client";

import { Bell, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import Link from "next/link"; // For accessible navigation

// Define a type for your notification structure
interface Notification {
  id: string;
  title: string;
  content: string; // A short snippet for the dropdown
  referenceId: string; // The ID of the related entity
  type: 'program' | 'event' | 'internship';
  read: boolean;
  timestamp: string; // Or a Date object
}

interface NotificationDropdownProps {
  initialNotifications?: Notification[]; // Optional: if you pre-fetch on server
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
      // Map backend fields to frontend expected fields
      const mapped = (data.notifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.message, // backend: message
        referenceId: n.reference_id, // backend: reference_id
        type: n.type || 'program', // backend: type (default to program if missing)
        read: n.is_read, // backend: is_read
        timestamp: n.created_at, // backend: created_at
      }));
      setNotifications(mapped);
    } catch (e) {
      setNotifications([]);
    }
  };

  // Fetch unread count from backend
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/students/notifications/unread-count");
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Add event listener for clicks outside the dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const handleNotificationClick = async (notificationId: string, referenceId: string, type: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch("/api/students/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: [notificationId] })
    });
    setIsOpen(false);
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
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/students/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true })
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-down">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 text-sm hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No new notifications.</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      !notification.read ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Link
                      href={
                        notification.type === "internship"
                          ? `/internships/${notification.referenceId}?from=notification`
                          : notification.type === "event"
                          ? `/events/${notification.referenceId}?from=notification`
                          : `/programs/${notification.referenceId}?from=notification`
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notification.id, notification.referenceId, notification.type);
                      }}
                      className="block p-4"
                    >
                      <p className={`font-medium ${!notification.read ? "text-blue-800" : "text-gray-800"}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link href="/notifications" className="text-blue-600 text-sm hover:underline">
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};