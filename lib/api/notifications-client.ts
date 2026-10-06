import { api } from "./browser-client";
import { whenAvailable } from "./errors";

/**
 * Student notifications (docs/backend-missing-endpoints.md → Notifications).
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
};

export type UiNotification = {
  id: string;
  title: string;
  content: string;
  referenceId: string;
  type: string;
  read: boolean;
  timestamp: string;
};

const toUi = (n: NotificationRow): UiNotification => ({
  id: n.id,
  title: n.title,
  content: n.message,
  referenceId: n.reference_id,
  type: n.type || "program",
  read: n.is_read,
  timestamp: n.created_at,
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

export async function getUnreadCount(): Promise<number> {
  return whenAvailable(
    async () => (await api.get<{ unreadCount: number }>("/notifications/unreadcount")).data?.unreadCount ?? 0,
    0
  );
}

export async function markNotificationsRead(notificationIds: string[]) {
  await whenAvailable(() => api.post("/notifications/read", { notificationIds }), undefined);
}

export async function markAllNotificationsRead() {
  await whenAvailable(() => api.post("/notifications/read", { markAll: true }), undefined);
}
