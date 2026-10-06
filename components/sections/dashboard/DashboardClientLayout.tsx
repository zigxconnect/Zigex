"use client";

import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";
import { MobileTabBar } from "@/components/layout/dashboard/MobileTabBar";
import { ProfileCompletionBanner } from "@/components/sections/dashboard/ProfileCompletionBanner";
import { useState, useEffect } from "react";
import { UserProfile } from "@/app/types/type";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PushNotificationManager } from "@/components/providers/PushNotificationManager";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  showUploadLive?: boolean;
}

/**
 * /feed shows profile strength in its own sidebar; Programs and the
 * opportunity/program pages have their own job, so the banner stays off them.
 */
function hideProfileBanner(pathname: string | null) {
  const path = pathname ?? "";
  return path === "/feed" || path === "/dashboard/programs" || path.startsWith("/feed/") || /^\/programs\/[^/]+$/.test(path);
}

export function DashboardClientLayout({
  children,
  user
  , showUploadLive = false
}: DashboardClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const isChatPage = pathname?.includes('/zigagent-ai');

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
      <PushNotificationManager />
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
          showUploadLive={showUploadLive}
        />

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#0B1B3F]/40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Main Content */}
        <main className="min-h-[calc(100dvh-4rem)] min-w-0 flex-1 bg-[#F8FAFF] pb-20 lg:pb-0 lg:pl-64">
          {/* Content Container */}
          <div className="w-full max-w-full h-full">
            {isChatPage ? (
              // Full width/height for Chat
              <div className="h-full w-full">
                {children}
              </div>
            ) : (
              // Standard Dashboard Padding
              <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">
                  {/* /feed shows profile strength in its own sidebar; Programs doesn't need it. */}
                  {!hideProfileBanner(pathname) && <ProfileCompletionBanner profileStatus={user?.profile?.profile_status} />}
                  {children}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar - Only visible on mobile */}
      {isMobile && <MobileTabBar user={user} />}
    </>
  );
}