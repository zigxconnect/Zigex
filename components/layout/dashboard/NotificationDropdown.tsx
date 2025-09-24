// components/NotificationDropdown.tsx
"use client";

import { Bell, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import Link from "next/link"; // For accessible navigation
import ProgramDetailsPage from "@/app/(dashboard)/programs/[id]/page";

// Define a type for your notification structure
interface Notification {
  id: string;
  title: string;
  content: string; // A short snippet for the dropdown
  programId: string; // The ID of the program to navigate to
  read: boolean;
  timestamp: string; // Or a Date object
}

interface NotificationDropdownProps {
  initialNotifications?: Notification[]; // Optional: if you pre-fetch on server
}

export const NotificationDropdown = ({ initialNotifications = [] }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Initialize useRouter

  // Function to fetch notifications (simulate an API call)
  const fetchNotifications = async () => {
    // In a real application, you'd make an API call here:
    // const response = await fetch('/api/notifications');
    // const data: Notification[] = await response.json();
    // setNotifications(data);

    // Mock data for demonstration
    const mockData: Notification[] = [
      {
        id: "1",
        title: "New Program Available",
        content: "Exciting new AI program just launched! Check it out.",
        programId: "ai-fundamentals",
        read: false,
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      },
      {
        id: "2",
        title: "Your Application Status",
        content: "Your application for the Web Dev bootcamp has been reviewed.",
        programId: "web-dev-bootcamp",
        read: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: "3",
        title: "Upcoming Deadline",
        content: "Reminder: Machine Learning program application closes soon.",
        programId: "ml-specialization",
        read: true,
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
      },
    ];
    setNotifications(mockData);
  };

  useEffect(() => {
    fetchNotifications(); // Fetch notifications on component mount

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
  }, []); // Empty dependency array means this runs once on mount

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: string, programId: string) => {
    // Mark as read (optimistically update UI, then send to backend)
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    // In a real app, you'd also send an API call to mark as read on the server.
    // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });

    setIsOpen(false); // Close dropdown after clicking
    // Navigate to the program details page, passing a query param to indicate notification
    router.push(`/programs/${programId}?from=notification`);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // In a real app, send API call to mark all as read.
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
                    {/* Using Link for better accessibility and pre-fetching */}
                    <Link
                      href={`/programs/${notification.programId}?from=notification`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default Link navigation for custom handling
                        handleNotificationClick(notification.id, notification.programId);
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