/**
 * Pure helpers that turn the workspace data (placement, daily logs, tasks)
 * into what the page shows: today's state, the attendance calendar, progress.
 * No React here, so the rules are easy to read and test.
 */

export type LogLike = {
  id: string;
  log_date?: string;
  created_at?: string;
  check_in_time?: string;
  check_in?: string;
  check_out_time?: string;
  learning_log?: string;
  status?: string;
  [key: string]: any;
};

/** YYYY-MM-DD in the student's own time zone. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The calendar day a log belongs to. */
export const logDay = (log: LogLike) => (log.log_date ?? log.created_at ?? "").slice(0, 10);

export const checkInTime = (log: LogLike | undefined) => log?.check_in_time ?? log?.check_in ?? null;

/** A log is a sent report once it has the day's summary (check-out). */
export const hasReport = (log: LogLike | undefined) => Boolean(log && (log.check_out_time || log.learning_log?.trim()));

export type ReportStatus = "approved" | "rejected" | "pending";
export function reportStatus(log: LogLike): ReportStatus {
  const s = String(log.status ?? "").toLowerCase();
  if (s === "approved" || s === "confirmed") return "approved";
  if (s === "rejected") return "rejected";
  return "pending";
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  approved: "Approved",
  rejected: "Needs changes",
  pending: "Waiting for review",
};

export type TodayState = {
  log: LogLike | undefined;
  checkedInAt: string | null;
  reported: boolean;
  isWeekend: boolean;
};

export function todayState(logs: LogLike[], now = new Date()): TodayState {
  const key = dayKey(now);
  const log = logs.find((l) => logDay(l) === key);
  const day = now.getDay();
  return { log, checkedInAt: checkInTime(log), reported: hasReport(log), isWeekend: day === 0 || day === 6 };
}

const parseDay = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

export type CalendarDay = {
  key: string;
  date: Date;
  state: "reported" | "checked-in" | "missed" | "today" | "upcoming" | "outside";
};

export type AttendanceCalendar = {
  weeks: CalendarDay[][];
  /** 1-based week of the placement containing today (null before the start). */
  currentWeek: number | null;
  totalWeeks: number;
  workdaysSoFar: number;
  daysPresent: number;
  daysReported: number;
  start: Date;
  end: Date;
  hasDates: boolean;
};

/**
 * Weekdays from the placement's start to its end, each marked from the logs.
 * Without dates on the posting: the last four weeks up to today.
 */
export function attendanceCalendar(
  logs: LogLike[],
  range: { start?: string | null; end?: string | null; months?: number | null },
  now = new Date()
): AttendanceCalendar {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const byDay = new Map<string, LogLike>();
  for (const log of logs) {
    const key = logDay(log);
    if (key && !byDay.has(key)) byDay.set(key, log);
  }

  let start = parseDay(range.start);
  let end = parseDay(range.end);
  const hasDates = Boolean(start);
  if (start && !end && range.months) end = addDays(new Date(start.getFullYear(), start.getMonth() + range.months, start.getDate()), -1);
  if (!start) {
    end = today;
    start = addDays(mondayOf(today), -21);
  }
  if (!end || end < start) end = addDays(start, 27);

  const weeks: CalendarDay[][] = [];
  let workdaysSoFar = 0;
  let daysPresent = 0;
  let daysReported = 0;

  for (let monday = mondayOf(start); monday <= end; monday = addDays(monday, 7)) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 5; i++) {
      const date = addDays(monday, i);
      const key = dayKey(date);
      const log = byDay.get(key);
      let state: CalendarDay["state"];
      if (date < start || date > end) state = "outside";
      else if (log) state = hasReport(log) ? "reported" : "checked-in";
      else if (key === dayKey(today)) state = "today";
      else if (date > today) state = "upcoming";
      else state = "missed";

      if (state !== "outside" && date <= today) workdaysSoFar++;
      if (state === "reported" || state === "checked-in") daysPresent++;
      if (state === "reported") daysReported++;
      week.push({ key, date, state });
    }
    weeks.push(week);
  }

  const weekOf = mondayOf(today > end ? end : today).getTime();
  const index = weeks.findIndex((w) => w[0].date.getTime() === weekOf);
  return {
    weeks,
    currentWeek: today < start || index < 0 ? null : index + 1,
    totalWeeks: weeks.length,
    workdaysSoFar,
    daysPresent,
    daysReported,
    start,
    end,
    hasDates,
  };
}

export type Priority = "high" | "medium" | "low";
export const priorityOf = (task: { priority?: string }): Priority => {
  const p = String(task.priority ?? "").toLowerCase();
  return p === "high" || p === "low" ? p : "medium";
};

/** Unread first, then by due date (soonest first; no date last). */
export function sortTasks<T extends { is_read?: boolean; due_date?: string }>(tasks: T[]): T[] {
  const due = (t: T) => (t.due_date ? new Date(t.due_date).getTime() : Number.POSITIVE_INFINITY);
  return [...tasks].sort((a, b) => Number(Boolean(a.is_read)) - Number(Boolean(b.is_read)) || due(a) - due(b));
}

/** "Due today", "Due tomorrow", "Due Thu 24 Oct", "2 days late". */
export function dueLabel(value?: string, now = new Date()): { text: string; late: boolean } | null {
  const date = parseDay(value);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return { text: diff === -1 ? "1 day late" : `${-diff} days late`, late: true };
  if (diff === 0) return { text: "Due today", late: false };
  if (diff === 1) return { text: "Due tomorrow", late: false };
  return { text: `Due ${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}`, late: false };
}

export const formatDay = (value: string | Date, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) => {
  const d = typeof value === "string" ? parseDay(value) : value;
  return d ? d.toLocaleDateString("en-GB", opts) : "";
};

export const formatTime = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export const stripHtml = (html?: string | null) => (html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
