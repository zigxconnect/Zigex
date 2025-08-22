"use client";

import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/layout/dashboard/Footer";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";
// import { DashboardFooter } from "@/components/layout/dashboard/DashboardFooter";
import { useState, useEffect } from "react";
// import { DashboardHeader } from "@/app/_components/layout/dashboard/DashboardHeader";
// import { Sidebar } from "@/app/_components/layout/dashboard/Sidebar";

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

  // This effect runs once to intelligently open the sidebar by default on desktop.
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      // 1024px is Tailwind's 'lg' breakpoint
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    // The root container for the dashboard - changed to min-h-screen for footer support.
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* The Sidebar is a floating panel controlled by the `isOpen` state. */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 
        This is the main content area.
        The conditional margin (`lg:ml-64`) is the key to creating the side-by-side
        view on desktop. It "pushes" the content to the right only when the sidebar is open.
      */}
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