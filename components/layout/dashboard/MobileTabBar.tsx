"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Compass, GraduationCap, LayoutDashboard, MessagesSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: LucideIcon; match: string[] };

/**
 * Bottom navigation on phones: the four places students go most, named as
 * in the sidebar. Everything else is in the menu (☰) in the top bar.
 * Students accepted somewhere get Workspace instead of Programs.
 */
export function MobileTabBar({ user }: { user: any }) {
  const pathname = usePathname() ?? "";

  const tabs: Tab[] = [
    { href: "/feed", label: "Explore", icon: Compass, match: ["/feed"] },
    { href: "/dashboard/applied-internships", label: "Applications", icon: ClipboardList, match: ["/dashboard/applied-internships"] },
    user?.permissions?.isIntern
      ? { href: "/student/workspace", label: "Workspace", icon: LayoutDashboard, match: ["/student/workspace", "/intern/workspace"] }
      : { href: "/dashboard/programs", label: "Programs", icon: GraduationCap, match: ["/dashboard/programs", "/programs"] },
    { href: "/dashboard/community", label: "Community", icon: MessagesSquare, match: ["/dashboard/community", "/dashboard/student"] },
  ];

  const isActive = (tab: Tab) => tab.match.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCE5F5] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#155DFC]",
                  active ? "font-semibold text-[#155DFC]" : "font-medium text-[#4A5670] active:text-[#0B1B3F]"
                )}
              >
                <span className={cn("flex h-7 w-14 items-center justify-center rounded-full transition-colors", active && "bg-[#EEF3FF]")}>
                  <tab.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.9} aria-hidden="true" />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
