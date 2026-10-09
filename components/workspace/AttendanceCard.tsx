import { cn } from "@/lib/utils";
import { formatDay, type AttendanceCalendar, type CalendarDay } from "./workspace-model";

const DAY_STYLE: Record<CalendarDay["state"], string> = {
  reported: "bg-[#155DFC]",
  "checked-in": "bg-[#B9CCFB]",
  missed: "bg-white ring-1 ring-inset ring-[#F3B5AE]",
  today: "bg-white ring-2 ring-inset ring-[#155DFC]",
  upcoming: "bg-[#F1F4FA]",
  outside: "bg-transparent",
};

const DAY_LABEL: Record<CalendarDay["state"], string> = {
  reported: "checked in, report sent",
  "checked-in": "checked in, no report",
  missed: "no check-in",
  today: "today",
  upcoming: "upcoming",
  outside: "",
};

const LEGEND: { state: CalendarDay["state"]; label: string }[] = [
  { state: "reported", label: "Report sent" },
  { state: "checked-in", label: "Checked in" },
  { state: "missed", label: "Missed" },
];

/** The placement's working days, one row per week, each day marked from the logs. */
export function AttendanceCard({ calendar }: { calendar: AttendanceCalendar }) {
  const { weeks, currentWeek, totalWeeks, daysPresent, workdaysSoFar, hasDates } = calendar;

  return (
    <section aria-labelledby="attendance-title" className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="attendance-title" className="font-heading text-base font-semibold text-[#0B1B3F]">
          Attendance
        </h2>
        {currentWeek && hasDates && (
          <p className="text-sm text-[#4A5670]">
            Week {currentWeek} of {totalWeeks}
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-[#4A5670]">
        {workdaysSoFar === 0
          ? `Starts ${formatDay(calendar.start, { weekday: "long", day: "numeric", month: "long" })}.`
          : `Present ${daysPresent} of ${workdaysSoFar} work ${workdaysSoFar === 1 ? "day" : "days"} so far.`}
        {!hasDates && " Showing the last four weeks."}
      </p>

      <div className="mt-5" role="table" aria-label="Attendance by week">
        <div role="row" className="grid grid-cols-[3.25rem_repeat(5,minmax(0,1fr))] gap-1.5 pb-1.5 text-center text-xs text-[#7B869C]">
          <span role="columnheader" className="sr-only">
            Week
          </span>
          <span aria-hidden="true" />
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
            <span key={d} role="columnheader">
              {d}
            </span>
          ))}
        </div>
        <div className="max-h-[260px] space-y-1.5 overflow-y-auto">
          {weeks.map((week, i) => (
            <div key={week[0].key} role="row" className="grid grid-cols-[3.25rem_repeat(5,minmax(0,1fr))] items-center gap-1.5">
              <span role="rowheader" className={cn("text-xs tabular-nums", currentWeek === i + 1 ? "font-semibold text-[#0B1B3F]" : "text-[#7B869C]")}>
                {hasDates ? `Week ${i + 1}` : formatDay(week[0].date, { day: "numeric", month: "short" })}
              </span>
              {week.map((day) => (
                <span
                  key={day.key}
                  role="cell"
                  title={day.state === "outside" ? undefined : `${formatDay(day.date, { weekday: "long", day: "numeric", month: "long" })}: ${DAY_LABEL[day.state]}`}
                  aria-label={day.state === "outside" ? "Not part of the placement" : `${formatDay(day.date, { weekday: "long", day: "numeric", month: "long" })}, ${DAY_LABEL[day.state]}`}
                  className={cn("h-7 rounded-md", DAY_STYLE[day.state])}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#4A5670]">
        {LEGEND.map((item) => (
          <li key={item.state} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("h-3 w-3 rounded", DAY_STYLE[item.state])} />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
