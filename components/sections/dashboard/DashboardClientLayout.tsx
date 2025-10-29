"use client";

import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";
import { MobileTabBar } from "@/components/layout/dashboard/MobileTabBar";
import { useState, useEffect } from "react";
import { UserProfile } from "@/app/types/type";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
}

export function DashboardClientLayout({
  children,
  user
}: DashboardClientLayoutProps) {
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
    <>
      {/* Header with user data and menu click handler */}
      <DashboardHeader 
        user={user}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Main Container */}
      <div className="flex relative">
        {/* Sidebar with user data */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user || {}} // Pass the fetched user data
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
          ${!isMobile && isSidebarOpen ? 'lg:ml-80' : 'ml-0'}
          pb-20 lg:pb-0
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

      {/* Mobile Tab Bar - Only visible on mobile */}
      {isMobile && <MobileTabBar user={user} />}
    </>
  );
}