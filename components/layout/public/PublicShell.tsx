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
 *   - Unauthenticated visitors → renders a clean public top-bar with the Zigex
 *     logo and "Sign In" / "Get Started" CTAs.  No sidebar is rendered so the
 *     content takes full width.
 *
 * This keeps the routing simple: a single URL (/feed, /feed/[id]) works for
 * both audiences without any server-side branching.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { DashboardClientLayout } from "@/components/sections/dashboard/DashboardClientLayout";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: React.ReactNode;
  user: any | null;
  showUploadLive?: boolean;
}

// ---------------------------------------------------------------------------
// Public header — rendered only when the visitor is not authenticated
// ---------------------------------------------------------------------------
function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 transition-transform duration-500 group-hover:rotate-12">
            <Logo className="w-full h-full" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">
              ZIGEX
            </span>
            <span className="text-[9px] font-bold text-[#155DFC] tracking-[0.2em] uppercase">
              Platform
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="/feed"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/#features"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#community"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Community
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
          >
            <LogIn size={14} />
            Sign In
          </Link>
          <Link
            href="/feed"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#155DFC] text-white hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus size={14} />
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-800",
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-3">
          <Link
            href="/feed"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/#features"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Features
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/feed"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-bold bg-[#155DFC] text-white hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
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
      <PublicHeader />
      {/* Content: full width, same padding as dashboard page content */}
      <main className="w-full max-w-full">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
