"use client";

import { SafeImg } from "@/components/SafeImg";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ClipboardList,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessagesSquare,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import NameInitials from "@/components/NameInitials";
import { usableImageUrl } from "@/lib/images";
import { slugifyUsername, cn } from "@/lib/utils";
import { api } from "@/lib/api/browser-client";
import { ADMIN_APP_URL } from "@/lib/app-urls";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  showUploadLive?: boolean;
}

type NavItem = { href: string; label: string; icon: LucideIcon; match?: string[]; external?: boolean; tag?: string };

/**
 * App sidebar for signed-in students: 256px, white, grouped by what the
 * student is doing (finding, tracking, connecting). Active item is a quiet
 * blue tint, not a filled pill, so the page content stays the focus.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, user }) => {
  const pathname = usePathname() ?? "";
  const userName: string = user?.name || user?.profile?.name || "Student";
  const userAvatar: string | undefined = user?.avatar || user?.profile?.avatar_url || user?.avatarUrl;
  const username: string = user?.profile?.username || user?.username || "";
  const profileLink = username ? `/profile/${slugifyUsername(username)}` : "/profile";

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: "Discover",
      items: [
        { href: "/feed", label: "Opportunities", icon: Compass, match: ["/feed"] },
        { href: "/dashboard/programs", label: "Programs", icon: GraduationCap, match: ["/dashboard/programs", "/programs"] },
        { href: "/dashboard/blog", label: "Announcements", icon: Megaphone },
      ],
    },
    {
      label: "Your work",
      items: [
        { href: "/dashboard/applied-internships", label: "My applications", icon: ClipboardList },
        ...(user?.permissions?.isIntern
          ? [{ href: "/student/workspace", label: "My workspace", icon: LayoutDashboard, match: ["/student/workspace", "/intern/workspace"] }]
          : []),
        ...(user?.permissions?.isSupervisor
          ? [{ href: `${ADMIN_APP_URL}/supervisor`, label: "Mentorship", icon: ShieldCheck, external: true }]
          : []),
      ],
    },
    {
      label: "Community",
      items: [
        { href: "/dashboard/student", label: "Students", icon: Users },
        { href: "/dashboard/community", label: "Communities", icon: MessagesSquare },
      ],
    },
    {
      label: "Tools",
      items: [{ href: "/dashboard/zigagent-ai/docs", label: "Zila AI", icon: Bot, match: ["/dashboard/zigagent-ai"], tag: "Soon" }],
    },
  ];

  const isActive = (item: NavItem) =>
    (item.match ?? [item.href]).some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) onClose?.();
  };

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#DCE5F5] bg-white transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link href="/feed" onClick={closeOnMobile} className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]">
          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
        {groups
          .filter((g) => g.items.length > 0)
          .map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-xs font-medium text-[#7B869C]">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeOnMobile}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]",
                          active
                            ? "bg-[#EEF3FF] font-semibold text-[#155DFC]"
                            : "font-medium text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
                        )}
                      >
                        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#155DFC]" : "text-[#7B869C]")} aria-hidden="true" />
                        {item.label}
                        {item.tag && (
                          <span className="ml-auto rounded-full bg-[#FFF7E6] px-2 py-0.5 text-xs font-medium text-[#B54708]">{item.tag}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </nav>

      <AccountMenu name={userName} avatar={userAvatar} profileLink={profileLink} onNavigate={closeOnMobile} />
    </aside>
  );
};

/** Who is signed in, with profile, settings and sign out. */
function AccountMenu({
  name,
  avatar,
  profileLink,
  onNavigate,
}: {
  name: string;
  avatar?: string;
  profileLink: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    await api.post("/auth/logout").catch(() => {});
    window.location.href = "/";
  };

  const item = "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#0B1B3F] hover:bg-[#F3F7FF]";

  return (
    <div ref={ref} className="relative shrink-0 border-t border-[#EEF2FA] p-3">
      {open && (
        <div role="menu" className="absolute inset-x-3 bottom-full mb-2 rounded-xl border border-[#DCE5F5] bg-white p-1 shadow-[0_16px_40px_-12px_rgba(11,27,63,0.25)]">
          <Link role="menuitem" href={profileLink} onClick={() => { setOpen(false); onNavigate(); }} className={item}>
            <User className="h-4 w-4 text-[#7B869C]" aria-hidden="true" /> View profile
          </Link>
          <Link role="menuitem" href="/profile-settings" onClick={() => { setOpen(false); onNavigate(); }} className={item}>
            <Settings className="h-4 w-4 text-[#7B869C]" aria-hidden="true" /> Settings
          </Link>
          <div className="my-1 h-px bg-[#EEF2FA]" />
          <button role="menuitem" type="button" onClick={signOut} className={`${item} text-[#B42318] hover:bg-[#FEF3F2]`}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#EEF3FF] text-sm">
          <NameInitials name={name} />
          {usableImageUrl(avatar) && <SafeImg src={usableImageUrl(avatar)!} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#0B1B3F]">{name}</span>
          <span className="block text-xs text-[#7B869C]">Student</span>
        </span>
        <MoreHorizontal className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
      </button>
    </div>
  );
}
