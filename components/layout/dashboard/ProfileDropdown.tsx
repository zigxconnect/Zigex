"use client";

import { SafeImg } from "@/components/SafeImg";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ClipboardList, LogOut, Settings, User } from "lucide-react";
import { cn, slugifyUsername } from "@/lib/utils";
import NameInitials from "@/components/NameInitials";
import { usableImageUrl } from "@/lib/images";
import { api } from "@/lib/api/browser-client";

/** Avatar button in the top bar with the account menu. */
export const ProfileDropdown = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name: string = user?.name || user?.profile?.name || "Student";
  const email: string | undefined = user?.email || user?.profile?.email;
  const avatar: string | undefined = user?.avatar || user?.profile?.avatar_url || user?.avatarUrl;
  const username: string = user?.profile?.username || user?.username || "";
  const profileUrl = username ? `/profile/${slugifyUsername(username)}` : "/profile";

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

  const links = [
    { label: "View profile", icon: User, href: profileUrl },
    { label: "My applications", icon: ClipboardList, href: "/dashboard/applied-internships" },
    { label: "Settings", icon: Settings, href: "/profile-settings" },
  ];
  const item = "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#0B1B3F] hover:bg-[#F3F7FF]";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 items-center gap-1.5 rounded-full pl-0.5 pr-2 hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <span className="relative h-9 w-9 overflow-hidden rounded-full bg-[#EEF3FF] text-sm ring-1 ring-[#DCE5F5]">
          <NameInitials name={name} />
          {usableImageUrl(avatar) && <SafeImg src={usableImageUrl(avatar)!} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[#7B869C] transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[100] mt-2 w-64 rounded-xl border border-[#DCE5F5] bg-white p-1 shadow-[0_16px_40px_-12px_rgba(11,27,63,0.25)]"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#0B1B3F]">{name}</p>
            {email && <p className="truncate text-sm text-[#4A5670]">{email}</p>}
          </div>
          <div className="my-1 h-px bg-[#EEF2FA]" />
          {links.map((l) => (
            <Link key={l.href} role="menuitem" href={l.href} onClick={() => setOpen(false)} className={item}>
              <l.icon className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-[#EEF2FA]" />
          <button role="menuitem" type="button" onClick={signOut} className={`${item} text-[#B42318] hover:bg-[#FEF3F2]`}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
