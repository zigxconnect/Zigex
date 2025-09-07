"use client";

import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/layout/dashboard/Footer";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";

import { useState, useEffect } from "react";

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          user={{}} // Pass your user data here
        />

        <main className={`
          flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]
          ${isSidebarOpen ? "lg:ml-72" : "lg:ml-0"}
        `}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      <DashboardFooter />
    </div>
  );
}