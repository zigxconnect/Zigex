"use client";

import { Bell, Briefcase, Calendar, CheckCheck, FileCheck2, GraduationCap, Inbox, Megaphone, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type UiNotification,
} from "@/lib/api/notifications-client";
import {
  dedupeNotifications,
  describeNotification,
  notificationHref,
  notificationKind,
  shortTime,
  type GroupedNotification,
  type NotificationKind,
} from "@/lib/notifications";

const ICONS: Record<NotificationKind, typeof Bell> = {
  internship: Briefcase,
  program: GraduationCap,
  event: Calendar,
  application: FileCheck2,
  announcement: Megaphone,
  update: Megaphone,
  other: Bell,
};

const POLL_MS = 60_000;

/**
 * The bell: the true unread count from the server, the latest few items, and
 * every row is a link to what it's about (programs open under Programs,
 * internships and events on their opportunity page, application news on My
 * applications). Checks again when the tab regains focus instead of hammering.
 */
export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<UiNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const refreshCount = useCallback(async () => {
    try {
      setUnreadCount(await getUnreadCount());
    } catch {
      // Keep the last count.
    }
  }, []);

  const refreshList = useCallback(async () => {
    try {
      setRows(await listNotifications({ limit: 12 }));
    } catch {
      // Keep what we have.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshCount();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refreshCount();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshCount]);

  // Load once up front so the bell opens instantly, then refresh quietly on each open.
  useEffect(() => {
    refreshList();
  }, [refreshList]);
  useEffect(() => {
    if (isOpen) refreshList();
  }, [isOpen, refreshList]);

  // Close on outside click, Escape, and navigation.
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setIsOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);
  useEffect(() => setIsOpen(false), [pathname]);

  const items = dedupeNotifications(rows).slice(0, 6);

  const open = (n: GroupedNotification) => {
    setIsOpen(false);
    if (n.read) return;
    const ids = new Set(n.ids);
    setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, read: true } : r)));
    setUnreadCount((c) => Math.max(0, c - n.ids.length));
    markNotificationsRead(n.ids).catch(() => {});
  };

  const markAllAsRead = async () => {
    setRows((prev) => prev.map((r) => ({ ...r, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refreshCount();
      refreshList();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]",
          isOpen ? "bg-[#EEF3FF] text-[#155DFC]" : "text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
        )}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D92D20] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-[72px] z-[100] overflow-hidden rounded-xl border border-[#DCE5F5] bg-white shadow-[0_16px_40px_-12px_rgba(11,27,63,0.25)] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[380px]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF2FA] px-4 py-3">
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0B1B3F]">Notifications</h3>
              <p className="text-sm text-[#4A5670]">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-[#155DFC] hover:bg-[#F3F7FF]"
                >
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[min(440px,65vh)] overflow-y-auto">
            {!loaded ? (
              <ul aria-busy="true" aria-label="Loading notifications" className="divide-y divide-[#EEF2FA]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex gap-3 px-4 py-3">
                    <span className="h-9 w-9 animate-pulse rounded-lg bg-[#EEF2FA]" />
                    <span className="flex-1 space-y-2 pt-1">
                      <span className="block h-3 w-20 animate-pulse rounded bg-[#EEF2FA]" />
                      <span className="block h-3.5 w-3/4 animate-pulse rounded bg-[#EEF2FA]" />
                    </span>
                  </li>
                ))}
              </ul>
            ) : items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Inbox className="mx-auto h-8 w-8 text-[#B9C8E6]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#0B1B3F]">No notifications yet</p>
                <p className="mt-1 text-sm text-[#4A5670]">New opportunities and application updates will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#EEF2FA]">
                {items.map((n) => {
                  const { label, headline } = describeNotification(n);
                  const Icon = ICONS[notificationKind(n.type)];
                  return (
                    <li key={n.id}>
                      <Link
                        href={notificationHref(n)}
                        onClick={() => open(n)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none",
                          !n.read && "bg-[#F5F8FF]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            n.read ? "bg-[#F3F7FF] text-[#7B869C]" : "bg-[#E6EEFF] text-[#155DFC]"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs text-[#4A5670]">{label}</span>
                          <span className={cn("mt-0.5 line-clamp-2 block text-sm text-[#0B1B3F]", !n.read && "font-semibold")}>
                            {headline}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="text-xs text-[#7B869C]">{shortTime(n.timestamp)}</span>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-[#155DFC]">
                              <span className="sr-only">Unread</span>
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex h-11 items-center justify-center border-t border-[#EEF2FA] text-sm font-semibold text-[#155DFC] hover:bg-[#F8FAFF]"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};
