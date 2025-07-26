"use client";

import { useState } from "react";
import { DashboardHeader } from "../_components/layout/dashboard/DashboardHeader";
import { Sidebar } from "../_components/layout/dashboard/Sidebar";
import { AIChatButton } from "../_components/ui/AIChatButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
      {/* Floating AI Chat Button (Mobile Only) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <AIChatButton />
      </div>
    </div>
  );
}
 