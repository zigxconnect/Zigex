"use client";

import { Check, ListChecks, NotebookPen, ScanLine } from "lucide-react";
import { AttendanceScannerModal } from "@/components/sections/intern/AttendanceScannerModal";
import { formatDay, formatTime, type TodayState } from "./workspace-model";

type Step = {
  title: string;
  done: boolean;
  detail: string;
  action?: React.ReactNode;
};

const actionClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1B3F] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The day's routine as a real sequence: arrive and check in, work on the
 * supervisor's tasks, send the report before leaving. The one dark surface in
 * the workspace, so it reads first.
 */
export function TodayPanel({
  today,
  startsOn,
  openTasks,
  locked,
  onOpenTasks,
  onWriteReport,
}: {
  today: TodayState;
  /** Set before the placement's first work day: the routine is shown, not asked for yet. */
  startsOn: Date | null;
  openTasks: number;
  locked: boolean;
  onOpenTasks: () => void;
  onWriteReport: () => void;
}) {
  const checkedIn = Boolean(today.checkedInAt) || today.reported;

  const steps: Step[] = [
    {
      title: "Check in",
      done: checkedIn,
      detail: checkedIn
        ? today.checkedInAt
          ? `Checked in at ${formatTime(today.checkedInAt)}`
          : "Checked in with your report"
        : "Scan the QR code at your workplace when you arrive.",
      action: !checkedIn && !startsOn && (
        <AttendanceScannerModal>
          <button type="button" disabled={locked} className={`${actionClass} bg-white text-[#0B1B3F] hover:bg-[#E8EFFF]`}>
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            Scan QR code
          </button>
        </AttendanceScannerModal>
      ),
    },
    {
      title: "Tasks",
      done: !startsOn && openTasks === 0,
      detail:
        openTasks === 0
          ? "Nothing new from your supervisor."
          : `${openTasks} new ${openTasks === 1 ? "task" : "tasks"} from your supervisor.`,
      action: openTasks > 0 && (
        <button type="button" onClick={onOpenTasks} className={`${actionClass} bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15`}>
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          See tasks
        </button>
      ),
    },
    {
      title: "Daily report",
      done: today.reported,
      detail: today.reported
        ? "Sent. Your supervisor will review it."
        : "Before you leave: what you did and what you learned.",
      action: !today.reported && !startsOn && (
        <button type="button" onClick={onWriteReport} disabled={locked} className={`${actionClass} bg-[#155DFC] text-white hover:bg-[#2E6FFF]`}>
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Write report
        </button>
      ),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section aria-labelledby="today-title" className="rounded-2xl bg-[#0B1B3F] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="today-title" className="font-heading text-xl font-semibold tracking-tight">
          Today, {formatDay(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        <p className="text-sm text-[#AFC0E3]">
          {startsOn
            ? `Starts ${formatDay(startsOn, { weekday: "long", day: "numeric", month: "long" })}`
            : today.isWeekend && !checkedIn
              ? "No work day today. Enjoy the weekend."
              : `${doneCount} of 3 done`}
        </p>
      </div>
      {startsOn && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#DCE5F5]">
          From your first day, this is your routine. You can already read your tasks and the learning path.
        </p>
      )}
      {locked && (
        <p className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-[#DCE5F5]">
          Accept the program fee below to start checking in and sending reports.
        </p>
      )}

      <ol className="mt-6 grid gap-4 md:grid-cols-3 md:gap-0">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-3 md:pr-6">
            {/* Connector between steps: down on phones, across on wide screens. */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[15px] top-9 h-[calc(100%-1rem)] w-px bg-white/15 md:left-10 md:right-4 md:top-[15px] md:h-px md:w-auto"
              />
            )}
            <span
              className={
                step.done
                  ? "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3DDC97] text-[#0B1B3F]"
                  : "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1B3F] text-sm font-semibold text-white ring-1 ring-white/35"
              }
            >
              {step.done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <div className="min-w-0 pb-2">
              <h3 className="font-heading text-base font-semibold">
                {step.title}
                {step.done && <span className="sr-only"> (done)</span>}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#AFC0E3]">{step.detail}</p>
              {step.action && <div className="mt-3">{step.action}</div>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
