import type { UiNotification } from "@/lib/api/notifications-client";

/**
 * One place that decides where a notification leads and how it reads, so the
 * bell, the notifications page and push (public/push-sw.js uses `url`) agree.
 */

export type NotificationKind = "internship" | "program" | "event" | "application" | "announcement" | "update" | "other";

export function notificationKind(type: string): NotificationKind {
  const t = type.toLowerCase();
  if (t.includes("application") || t.includes("accept") || t.includes("reject")) return "application";
  if (t.includes("announcement") || t.includes("blog")) return "announcement";
  if (t.includes("update")) return "update";
  if (t === "internship" || t === "program" || t === "event") return t;
  return "other";
}

/** Where tapping a notification goes. Programs open inside the app (sidebar on Programs). */
export function notificationHref(n: Pick<UiNotification, "type" | "referenceId">): string {
  const id = n.referenceId ? encodeURIComponent(n.referenceId) : "";
  switch (notificationKind(n.type)) {
    case "program":
      return id ? `/programs/${id}` : "/dashboard/programs";
    case "internship":
    case "event":
      return id ? `/feed/${id}` : "/feed";
    case "application":
      return "/dashboard/applied-internships";
    case "announcement":
      return "/dashboard/blog";
    case "update":
      return id ? `/programs/${id}/updates` : "/dashboard/programs";
    default:
      return id ? `/feed/${id}` : "/notifications";
  }
}

const LEAD: Partial<Record<NotificationKind, string>> = {
  internship: "New internship",
  program: "New program",
  event: "New event",
};

/**
 * The backend writes titles like "New Program!" and repeats the name inside
 * the message in quotes. Show the name as the headline and a calm label above.
 */
export function describeNotification(n: UiNotification): { label: string; headline: string; detail: string | null } {
  const kind = notificationKind(n.type);
  const quoted = n.content?.match(/["“]([^"”]{3,})["”]/)?.[1]?.trim();
  if (quoted && LEAD[kind]) return { label: LEAD[kind]!, headline: quoted, detail: null };
  return { label: n.title?.replace(/!+$/, "") || "Update", headline: n.content || n.title, detail: null };
}

export type GroupedNotification = UiNotification & { ids: string[] };

/**
 * The backend sometimes sends the same news twice ("New Program!" and "New
 * Program Available" for one program). Show it once; it is unread if either
 * copy is, and marking it read marks every copy (`ids`).
 */
export function dedupeNotifications(list: UiNotification[]): GroupedNotification[] {
  const seen = new Map<string, GroupedNotification>();
  for (const n of list) {
    const key = n.referenceId ? `${notificationKind(n.type)}:${n.referenceId}` : n.id;
    const prev = seen.get(key);
    if (!prev) seen.set(key, { ...n, ids: [n.id] });
    else seen.set(key, { ...prev, read: prev.read && n.read, ids: [...prev.ids, n.id] });
  }
  return [...seen.values()];
}

/** "Now", "5m", "3h", "2d", then a date. */
export function shortTime(timestamp: string, now = Date.now()): string {
  const date = new Date(timestamp);
  const mins = Math.floor((now - date.getTime()) / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== new Date(now).getFullYear() && { year: "numeric" }),
  });
}

/** Group heading for the full page: Today, Yesterday, This week, then month and year. */
export function dayGroup(timestamp: string, now = new Date()): string {
  const d = new Date(timestamp);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = d.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - 86400000) return "Yesterday";
  if (t >= startOfToday - 6 * 86400000) return "This week";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
