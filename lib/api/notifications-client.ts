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
  user_id?: string | null;
  is_global?: boolean;
};

/*
 * The backend sends every global notification ever posted to every student,
 * so a new account starts with months of old news, all unread. Until it only
 * sends globals created after the student joined (docs/backend/open-requests.md),
 * drop those here. The student's own notifications always show.
 */
let joinedAt: Promise<string | null> | null = null;
function accountCreatedAt(): Promise<string | null> {
  joinedAt ??= api
    .get<Record<string, any>>("/students/me")
    .then((res) => {
      const row = (res.data?.profile ?? res.data) as Record<string, any> | null;
      return (row?.created_at as string) ?? null;
    })
    .catch(() => {
      joinedAt = null; // try again next time
      return null;
    });
  return joinedAt;
}

const isGlobal = (n: NotificationRow) => n.is_global === true || n.user_id == null;
const fromBeforeJoining = (n: NotificationRow, since: string | null) => Boolean(since && isGlobal(n) && n.created_at < since);

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
  const [rows, since] = await Promise.all([
    whenAvailable(async () => (await api.get<NotificationRow[]>(`/notifications?${params}`)).data ?? [], [] as NotificationRow[]),
    accountCreatedAt(),
  ]);
  return rows.filter((n) => !fromBeforeJoining(n, since)).map(toUi);
}

/** One page plus how many pages exist, for "Load more". */
export async function listNotificationsPage({ page = 1, limit = 30, unreadOnly = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (unreadOnly) params.set("unreadOnly", "true");
  return whenAvailable(
    async () => {
      const [res, since] = await Promise.all([api.get<NotificationRow[]>(`/notifications?${params}`), accountCreatedAt()]);
      const rows = res.data ?? [];
      const kept = rows.filter((n) => !fromBeforeJoining(n, since));
      // Newest first: once a page reaches notifications from before the student
      // joined, every later page is older still, so this is the last page.
      const reachedOld = kept.length < rows.length;
      return {
        items: kept.map(toUi),
        totalPages: reachedOld ? page : res.meta?.totalPages ?? 1,
        total: reachedOld ? (page - 1) * limit + kept.length : res.meta?.total ?? 0,
      };
    },
    { items: [] as UiNotification[], totalPages: 0, total: 0 }
  );
}

export async function getUnreadCount(): Promise<number> {
  return whenAvailable(async () => {
    const count = (await api.get<{ unreadCount: number }>("/notifications/unread-count")).data?.unreadCount ?? 0;
    if (count === 0) return 0;
    // The backend's count includes old globals from before the student joined: count what we'd show.
    const [unread, since] = await Promise.all([
      api.get<NotificationRow[]>(`/notifications?page=1&limit=100&unreadOnly=true`).then((r) => r.data ?? []),
      accountCreatedAt(),
    ]);
    const old = unread.filter((n) => fromBeforeJoining(n, since)).length;
    return Math.max(0, count - old);
  }, 0);
}

export async function markNotificationsRead(notificationIds: string[]) {
  await whenAvailable(() => api.post("/notifications/read", { notificationIds }), undefined);
}

export async function markAllNotificationsRead() {
  await whenAvailable(() => api.post("/notifications/read", { markAll: true }), undefined);
}
