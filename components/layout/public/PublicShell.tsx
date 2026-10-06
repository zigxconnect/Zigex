"use client";

/**
 * PublicShell
 *
 * A context-aware layout shell that serves two audiences:
 *
 *   - Authenticated users  → renders the full DashboardClientLayout (sidebar,
 *     top header with user avatar, notifications, etc.) — identical to the
 *     experience they already know.
 *
 *   - Unauthenticated visitors → renders the shared SiteHeader (also used on
 *     the landing page). No sidebar is rendered so the content takes full width.
 *
 * This keeps the routing simple: a single URL (/feed, /feed/[id]) works for
 * both audiences without any server-side branching.
 */

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/public/SiteHeader";
import { DashboardClientLayout } from "@/components/sections/dashboard/DashboardClientLayout";

interface PublicShellProps {
  children: React.ReactNode;
  user: any | null;
  showUploadLive?: boolean;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function PublicShell({
  children,
  user,
  showUploadLive = false,
}: PublicShellProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for zoom/CSS that differs server → client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authenticated path — hand off entirely to the existing layout
  if (user) {
    return (
      <div className="min-h-screen bg-background" style={{ zoom: 0.9 }}>
        <DashboardClientLayout user={user} showUploadLive={showUploadLive}>
          {children}
        </DashboardClientLayout>
      </div>
    );
  }

  // Unauthenticated path — clean public layout
  return (
    <div className="min-h-screen bg-background">
      {/* Same header as the landing page, so the two feel like one site. */}
      <SiteHeader />
      {/* Content: full width, same padding as dashboard page content */}
      <main className="w-full max-w-full">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
