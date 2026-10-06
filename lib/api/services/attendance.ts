import "server-only";
import { serverApi } from "../server-client";
import { ApiClientError } from "../errors";

/**
 * Attendance and daily logs from the backend (/attendance/*).
 *
 * The backend models a working day as ONE log row: check-in starts it,
 * check-out closes it with the learning summary. Rows are assumed to keep the
 * old `intern_logs` column names (log_date, learning_log, tasks_completed,
 * experience_rating, status, created_at).
 *
 * TODO(backend): response bodies are undocumented in Swagger; adjust the
 * Row types when schemas are published.
 */

export type LogRow = {
  id: string;
  internship_id?: string;
  log_date?: string;
  status?: string;
  created_at?: string;
  check_in_time?: string;
  [column: string]: any;
};
export type NoteRow = { id: string; [column: string]: any };

const PAGE_LIMIT = 100;
const MAX_PAGES = 10;

/** The calendar day a log belongs to (YYYY-MM-DD). */
export const logDay = (log: LogRow) => (log.log_date ?? log.created_at ?? "").slice(0, 10);

export async function listLogs(internshipId: string): Promise<LogRow[]> {
  const rows: LogRow[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await serverApi.get<LogRow[]>(
      `/attendance/internships/${encodeURIComponent(internshipId)}/logs?page=${page}&limit=${PAGE_LIMIT}`
    );
    rows.push(...(res.data ?? []));
    if (!res.meta || page >= res.meta.totalPages) break;
  }
  return rows.sort((a, b) => logDay(b).localeCompare(logDay(a)));
}

export async function listNotes(internshipId: string): Promise<NoteRow[]> {
  const res = await serverApi.get<NoteRow[]>(`/attendance/internships/${encodeURIComponent(internshipId)}/notes`);
  return res.data ?? [];
}

export async function createNote(
  internshipId: string,
  note: { title: string; content: string; category?: string; isPinned?: boolean }
) {
  const res = await serverApi.post<NoteRow>(`/attendance/internships/${encodeURIComponent(internshipId)}/notes`, note);
  return res.data;
}

/** POST /attendance/check-in — starts today's log. 400 when already checked in today. */
export async function checkIn(internshipId: string, latitude?: number, longitude?: number) {
  const res = await serverApi.post<LogRow>("/attendance/check-in", {
    internship_id: internshipId,
    ...(latitude !== undefined && longitude !== undefined ? { latitude, longitude } : {}),
  });
  return res.data;
}

/** PATCH /attendance/logs/{logId}/check-out — closes the log. 400 when already checked out. */
export async function checkOut(
  logId: string,
  summary: { learningLog?: string; tasksCompleted?: string[]; experienceRating?: number }
) {
  const res = await serverApi.patch<LogRow>(`/attendance/logs/${encodeURIComponent(logId)}/check-out`, summary);
  return res.data;
}

/**
 * The workspace's attendance tracker expects the old intern_attendance_v2 shape:
 * rows whose `attendance_logs` maps each day to its check-in. Derived from the logs.
 */
export function logsToAttendance(logs: LogRow[]) {
  const attendance_logs: Record<string, { status: string; confirmed_at: string; method: string }> = {};
  for (const log of logs) {
    const day = logDay(log);
    if (!day) continue;
    attendance_logs[day] = {
      status: "present",
      confirmed_at: log.check_in_time ?? log.created_at ?? day,
      method: "check_in",
    };
  }
  return logs.length > 0 ? [{ attendance_logs }] : [];
}

export const isBackendError = (error: unknown, status: number) =>
  error instanceof ApiClientError && error.status === status;
