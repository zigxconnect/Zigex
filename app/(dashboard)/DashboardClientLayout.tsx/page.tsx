"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/app/_components/layout/dashboard/DashboardHeader";
import { Sidebar } from "@/app/_components/layout/dashboard/Sidebar";

// Define a type for the user data we expect
type UserData = {
  name: string;
  university: string;
  initials: string;
  skills: string[];
};

/**
 * This is a CLIENT layout that wraps the main dashboard.
 * It receives the user data from its server parent and handles all
 * interactive state, such as toggling the sidebar.
 */
export const DashboardClientLayout = ({
  user,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="relative h-screen bg-[#F8FAFC]">
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div
        className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <DashboardHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
