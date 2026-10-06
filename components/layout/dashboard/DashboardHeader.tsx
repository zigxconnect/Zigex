"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

/**
 * Top bar for signed-in pages: search (runs the /feed search from anywhere),
 * notifications and the account menu. 64px, white, sits right of the sidebar.
 */
export const DashboardHeader = ({ user, onMenuClick }: DashboardHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // On /feed this box filters the board live (via ?q=); elsewhere it opens /feed with the search.
  const onFeed = pathname === "/feed";

  // Show the current /feed search when arriving there; clear it elsewhere.
  useEffect(() => {
    setQuery(onFeed ? new URLSearchParams(window.location.search).get("q") ?? "" : "");
  }, [onFeed]);

  const updateFeedQuery = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      router.replace(`/feed${params.size ? `?${params}` : ""}`, { scroll: false });
    }, 250);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DCE5F5] bg-white/90 backdrop-blur lg:pl-64">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/feed" className="flex items-center gap-2 lg:hidden" aria-label="Zigex home">
          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="font-heading text-lg font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
        </Link>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (onFeed) return updateFeedQuery(q);
            router.push(q ? `/feed?q=${encodeURIComponent(q)}` : "/feed");
          }}
          className="relative hidden w-full max-w-md md:block"
        >
          <label htmlFor="global-search" className="sr-only">
            Search opportunities
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (onFeed) updateFeedQuery(e.target.value);
            }}
            placeholder={onFeed ? "Search by title, company, skill or town" : "Search opportunities"}
            className="h-10 w-full rounded-xl border border-[#DCE5F5] bg-[#F8FAFF] pl-10 pr-3 text-sm text-[#0B1B3F] placeholder:text-[#7B869C] transition-colors hover:border-[#B9C8E6] focus:border-[#155DFC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NotificationDropdown />
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};
