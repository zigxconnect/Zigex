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
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize and detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-open sidebar on desktop, close on mobile
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Main Container */}
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          user={{}} // Pass your user data here
        />

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Main Content */}
        <main className={`
          flex-1 min-h-[calc(100vh-4rem)] w-full
          transition-all duration-300 ease-in-out
          ${!isMobile && isSidebarOpen ? 'lg:ml-72' : 'ml-0'}
        `}>
          {/* Content Container */}
          <div className="w-full max-w-full overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer - Hidden on mobile when sidebar is open */}
      <div className={`
        ${isMobile && isSidebarOpen ? 'hidden' : 'block'}
        ${!isMobile && isSidebarOpen ? 'lg:ml-72' : 'ml-0'}
        transition-all duration-300
      `}>
        {/* <DashboardFooter /> */}
      </div>
    </div>
  );
}