"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Clock, ExternalLink, CheckCheck } from "lucide-react";
import { NotificationSkeleton } from "@/components/LoadingSkeleton";

// UPDATED: The Notification interface is now more flexible.
interface Notification {
  id: string;
  title: string;
  content: string;
  referenceId: string; // Generic ID for program, event, or internship
  type: "program" | "event" | "internship"; // Type to determine the link
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
        // UPDATED: Mapping now includes the 'type' field.
        const mapped = (data.notifications || []).map(
          (n: any): Notification => ({
            id: n.id,
            title: n.title,
            content: n.message,
            referenceId: n.reference_id,
            type: n.type, // Make sure to get the type from the API response
            read: n.is_read,
            timestamp: n.created_at,
          })
        );
        setNotifications(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Mark as read functions (unchanged)
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
      fetchNotifications(); // Revert on error
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

  // Time formatting (unchanged)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // NEW: Helper function to generate the correct link and text.
  const getNotificationLinkDetails = (type: string, referenceId: string) => {
    switch (type) {
      case "internship":
        return {
          href: `/internships/${referenceId}?from=notification`,
          text: "View Internship",
        };
      case "event":
        return {
          href: `/events/${referenceId}?from=notification`,
          text: "View Event",
        };
      case "program":
      default:
        return {
          href: `/programs/${referenceId}?from=notification`,
          text: "View Program",
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto w-full">
          <NotificationSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header (unchanged) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications.`
              : "You're all caught up!"}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">
              No notifications yet
            </h3>
            <p className="text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              // UPDATED: Call the helper to get dynamic link details.
              const linkDetails = getNotificationLinkDetails(
                n.type,
                n.referenceId
              );
              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-lg shadow-sm border p-5 transition-all ${!n.read ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2
                        className={`font-semibold text-lg ${!n.read ? "text-blue-900" : "text-gray-800"}`}
                      >
                        {n.title}
                      </h2>
                      <p className="text-gray-600 mt-1">{n.content}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(n.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      {/* UPDATED: Use the dynamic link and text */}
                      <Link
                        href={linkDetails.href}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        <span>{linkDetails.text}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
