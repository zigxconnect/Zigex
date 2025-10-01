"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

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
    fetch("/api/students/notifications")
      .then((res) => res.json())
      .then((data) => {
        // Map backend fields to frontend expected fields
        const mapped = (data.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.message, // backend: message
          programId: n.reference_id, // backend: reference_id
          read: n.is_read, // backend: is_read
          timestamp: n.created_at, // backend: created_at
        }));
        setNotifications(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-gray-500 text-center">No notifications found.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 flex flex-col gap-2 border-l-4 ${n.read ? 'border-gray-200' : 'border-blue-500 bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-semibold text-lg ${n.read ? 'text-gray-800' : 'text-blue-900'}`}>{n.title}</h2>
                <span className="text-xs text-gray-400">{new Date(n.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 text-sm">{n.content}</p>
              <div className="flex gap-2 mt-2">
                <Link
                  href={`/programs/${n.programId}?from=notification`}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View Program
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
