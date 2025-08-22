"use client";

import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/layout/dashboard/Footer";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";

import { useState, useEffect } from "react";

/**
 * The main layout for the student dashboard.
 * This component is responsible for the overall page structure and managing the
 * state of the universally toggleable sidebar.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="relative h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}
        `}
      >
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
        {/* Added the footer component */}
        <DashboardFooter />
      </div>
    </div>
  );
}
