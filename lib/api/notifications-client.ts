import { api } from "./browser-client";
import { whenAvailable } from "./errors";

/**
 * Student notifications (the Oct 2026 backend endpoint request → Notifications).
 * Until the backend deploys these routes, reads return empty and writes are no-ops.
 */

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  reference_id: string;
  created_at: string;
  /** Where the notification leads (added by the backend on 7 Oct 2026). */
  url?: string | null;
};

export type UiNotification = {
  id: string;
  title: string;
  content: string;
  referenceId: string;
  type: string;
  read: boolean;
  timestamp: string;
  url?: string | null;
};

const toUi = (n: NotificationRow): UiNotification => ({
  id: n.id,
  title: n.title,
  content: n.message,
  referenceId: n.reference_id,
  type: n.type || "program",
  read: n.is_read,
  timestamp: n.created_at,
  url: n.url ?? null,
});

export async function listNotifications({ page = 1, limit = 50, unreadOnly = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (unreadOnly) params.set("unreadOnly", "true");
  const rows = await whenAvailable(
    async () => (await api.get<NotificationRow[]>(`/notifications?${params}`)).data ?? [],
    []
  );
  return rows.map(toUi);
}

/** One page plus how many pages exist, for "Load more". */
export async function listNotificationsPage({ page = 1, limit = 30, unreadOnly = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (unreadOnly) params.set("unreadOnly", "true");
  return whenAvailable(
    async () => {
      const res = await api.get<NotificationRow[]>(`/notifications?${params}`);
      return { items: (res.data ?? []).map(toUi), totalPages: res.meta?.totalPages ?? 1, total: res.meta?.total ?? 0 };
    },
    { items: [] as UiNotification[], totalPages: 0, total: 0 }
  );
}

export async function getUnreadCount(): Promise<number> {
  return whenAvailable(
    async () => (await api.get<{ unreadCount: number }>("/notifications/unread-count")).data?.unreadCount ?? 0,
    0
  );
}

export async function markNotificationsRead(notificationIds: string[]) {
  await whenAvailable(() => api.post("/notifications/read", { notificationIds }), undefined);
}

export async function markAllNotificationsRead() {
  await whenAvailable(() => api.post("/notifications/read", { markAll: true }), undefined);
}
