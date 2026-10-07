"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Briefcase, Calendar, CheckCheck, FileCheck2, GraduationCap, Loader2, Megaphone, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { listNotificationsPage, markAllNotificationsRead, markNotificationsRead, type UiNotification } from "@/lib/api/notifications-client";
import {
  dayGroup,
  dedupeNotifications,
  describeNotification,
  notificationHref,
  notificationKind,
  shortTime,
  type GroupedNotification,
  type NotificationKind,
} from "@/lib/notifications";
import { Bone } from "@/components/skeletons/Skeleton";

const PAGE_SIZE = 30;

const ICONS: Record<NotificationKind, typeof Bell> = {
  internship: Briefcase,
  program: GraduationCap,
  event: Calendar,
  application: FileCheck2,
  announcement: Megaphone,
  update: Megaphone,
  other: Bell,
};

type Filter = "all" | "unread";

/**
 * Notifications: one list, newest first, grouped by day. Every row is a link
 * to the thing it's about; opening it marks it read.
 */
export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState<UiNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "more" | "error">("loading");

  const load = useCallback(async (f: Filter, p: number) => {
    setState(p === 1 ? "loading" : "more");
    try {
      const res = await listNotificationsPage({ page: p, limit: PAGE_SIZE, unreadOnly: f === "unread" });
      setRows((prev) => (p === 1 ? res.items : [...prev, ...res.items]));
      setTotalPages(res.totalPages);
      setPage(p);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load(filter, 1);
  }, [filter, load]);

  const items = useMemo(() => dedupeNotifications(rows), [rows]);
  const unread = items.filter((n) => !n.read).length;
  const groups = useMemo(() => {
    const now = new Date();
    const out: { title: string; items: GroupedNotification[] }[] = [];
    for (const n of items) {
      const title = dayGroup(n.timestamp, now);
      const last = out[out.length - 1];
      if (last?.title === title) last.items.push(n);
      else out.push({ title, items: [n] });
    }
    return out;
  }, [items]);

  const markRead = (n: GroupedNotification) => {
    if (n.read) return;
    const ids = new Set(n.ids);
    setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, read: true } : r)));
    markNotificationsRead(n.ids).catch(() => {});
  };

  const markAll = async () => {
    setRows((prev) => (filter === "unread" ? [] : prev.map((r) => ({ ...r, read: true }))));
    try {
      await markAllNotificationsRead();
    } catch {
      load(filter, 1);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Notifications</h1>
          <p className="mt-1 text-base text-[#4A5670]">New opportunities and news about your applications.</p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#155DFC] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all as read
          </button>
        )}
      </header>

      <div role="tablist" aria-label="Show" className="mt-6 inline-flex rounded-xl bg-[#EEF2FA] p-1">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]",
              filter === f ? "bg-white text-[#0B1B3F] shadow-sm" : "text-[#4A5670] hover:text-[#0B1B3F]"
            )}
          >
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {state === "loading" ? (
          <ListSkeleton />
        ) : state === "error" && rows.length === 0 ? (
          <Empty
            icon={RotateCw}
            title="Notifications didn't load"
            text="Check your connection and try again."
            action={<ActionButton onClick={() => load(filter, 1)}>Try again</ActionButton>}
          />
        ) : items.length === 0 ? (
          filter === "unread" ? (
            <Empty
              icon={CheckCheck}
              title="You're all caught up"
              text="Nothing new since you last looked."
              action={<ActionButton onClick={() => setFilter("all")}>Show all notifications</ActionButton>}
            />
          ) : (
            <Empty
              icon={Bell}
              title="No notifications yet"
              text="When companies post opportunities or review your applications, you'll see it here."
              action={
                <Link href="/feed" className="inline-flex h-11 items-center rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white hover:bg-[#0F3FB8]">
                  Explore opportunities
                </Link>
              }
            />
          )
        ) : (
          <div className="space-y-8">
            {groups.map((g, i) => (
              <section key={g.title} aria-labelledby={`g-${i}`}>
                <h2 id={`g-${i}`} className="mb-2 px-1 text-sm font-semibold text-[#4A5670]">
                  {g.title}
                </h2>
                <ul className="divide-y divide-[#EEF2FA] overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
                  {g.items.map((n) => (
                    <Row key={n.id} n={n} onOpen={() => markRead(n)} />
                  ))}
                </ul>
              </section>
            ))}

            {page < totalPages && (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => load(filter, page + 1)}
                  disabled={state === "more"}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] disabled:opacity-70"
                >
                  {state === "more" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Show older notifications
                </button>
                {state === "error" && (
                  <p role="alert" className="text-sm text-[#B42318]">
                    Older notifications didn&apos;t load. Try again.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ n, onOpen }: { n: GroupedNotification; onOpen: () => void }) {
  const { label, headline } = describeNotification(n);
  const Icon = ICONS[notificationKind(n.type)];
  return (
    <li>
      <Link
        href={notificationHref(n)}
        onClick={onOpen}
        className={cn(
          "group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none sm:px-5",
          !n.read && "bg-[#F5F8FF]"
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            n.read ? "bg-[#F3F7FF] text-[#7B869C]" : "bg-[#E6EEFF] text-[#155DFC]"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-[#4A5670]">{label}</span>
          <span className={cn("mt-0.5 block text-base leading-snug", n.read ? "text-[#0B1B3F]" : "font-semibold text-[#0B1B3F]")}>
            {headline}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
          <time dateTime={n.timestamp} className="text-sm text-[#7B869C]">
            {shortTime(n.timestamp)}
          </time>
          {!n.read && (
            <span className="h-2.5 w-2.5 rounded-full bg-[#155DFC]">
              <span className="sr-only">Unread</span>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

function Empty({ icon: Icon, title, text, action }: { icon: typeof Bell; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-[#DCE5F5]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F7FF]">
        <Icon className="h-6 w-6 text-[#155DFC]" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold text-[#0B1B3F]">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#4A5670]">{text}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF]"
    >
      {children}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading notifications">
      <Bone className="mb-2 h-4 w-20" />
      <div className="divide-y divide-[#EEF2FA] rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-4">
            <Bone className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-4 w-3/4" />
            </div>
            <Bone className="h-3.5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
