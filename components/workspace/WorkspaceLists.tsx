"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink, FileText, Link as LinkIcon, Paperclip, Search, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  REPORT_STATUS_LABEL,
  dueLabel,
  formatDay,
  formatTime,
  logDay,
  priorityOf,
  reportStatus,
  type LogLike,
  type Priority,
} from "./workspace-model";

/* ---------- shared bits ---------- */

export function Panel({
  id,
  title,
  note,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  note?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={cn("rounded-2xl bg-white ring-1 ring-[#DCE5F5]", className)}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="font-heading text-base font-semibold text-[#0B1B3F]">
            {title}
          </h2>
          {note && <p className="mt-0.5 text-sm text-[#4A5670]">{note}</p>}
        </div>
        {action}
      </div>
      <div className="pb-2 pt-3">{children}</div>
    </section>
  );
}

export function TextLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md text-sm font-semibold text-[#155DFC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
    >
      {children}
    </button>
  );
}

export function EmptyNote({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-5 py-6 sm:px-6">
      <p className="font-medium text-[#0B1B3F]">{title}</p>
      {children && <div className="mt-1 text-sm leading-relaxed text-[#4A5670]">{children}</div>}
    </div>
  );
}

const PRIORITY: Record<Priority, { label: string; bar: string; chip: string }> = {
  high: { label: "High priority", bar: "bg-[#E5484D]", chip: "bg-[#FEF3F2] text-[#B42318]" },
  medium: { label: "Medium priority", bar: "bg-[#F5A524]", chip: "bg-[#FFFAEB] text-[#B54708]" },
  low: { label: "Low priority", bar: "bg-[#B9CCFB]", chip: "bg-[#F3F7FF] text-[#2F4A85]" },
};

const STATUS_CHIP = {
  approved: "bg-[#ECFDF3] text-[#067647]",
  rejected: "bg-[#FEF3F2] text-[#B42318]",
  pending: "bg-[#FFFAEB] text-[#B54708]",
};

const rowClass =
  "group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none sm:px-6";

/* ---------- tasks ---------- */

export function TaskRow({ task, onOpen }: { task: any; onOpen: (task: any) => void }) {
  const priority = PRIORITY[priorityOf(task)];
  const due = dueLabel(task.due_date);
  return (
    <li>
      <button type="button" onClick={() => onOpen(task)} className={rowClass}>
        <span aria-hidden="true" className={cn("h-9 w-1 shrink-0 rounded-full", priority.bar)} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn("truncate text-[15px] text-[#0B1B3F]", task.is_read ? "font-medium" : "font-semibold")}>{task.title}</span>
            {!task.is_read && (
              <span className="shrink-0 rounded-full bg-[#155DFC] px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-[#4A5670]">
            <span className="sr-only">{priority.label}.</span>
            {due && <span className={due.late ? "font-medium text-[#B42318]" : undefined}>{due.text}</span>}
            {task.resource_links?.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {task.resource_links.length} {task.resource_links.length === 1 ? "link" : "links"}
              </span>
            )}
            {task.attachments?.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                {task.attachments.length} {task.attachments.length === 1 ? "file" : "files"}
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#9AA6BD] group-hover:text-[#155DFC]" aria-hidden="true" />
      </button>
    </li>
  );
}

export function TaskDialog({ task, onClose }: { task: any | null; onClose: () => void }) {
  const priority = task ? PRIORITY[priorityOf(task)] : null;
  const due = task ? dueLabel(task.due_date) : null;
  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-2xl bg-white p-0 sm:max-w-xl">
        {task && priority && (
          <>
            <div className="border-b border-[#EEF2FA] px-6 pb-5 pt-6 pr-14">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", priority.chip)}>{priority.label}</span>
                {due && <span className={due.late ? "font-medium text-[#B42318]" : "text-[#4A5670]"}>{due.text}</span>}
                {task.department && <span className="text-[#4A5670]">{task.department}</span>}
              </div>
              <DialogTitle className="mt-3 font-heading text-xl font-semibold leading-snug text-[#0B1B3F]">{task.title}</DialogTitle>
              <DialogDescription className="sr-only">Task from your supervisor</DialogDescription>
            </div>

            <div className="space-y-6 px-6 py-5">
              {task.output_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={task.output_image_url} alt="" className="max-h-56 w-full rounded-xl object-cover ring-1 ring-[#DCE5F5]" />
              )}
              {task.description ? (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#4A5670]">{task.description}</p>
              ) : (
                <p className="text-[15px] text-[#7B869C]">No details added. Ask your supervisor if anything is unclear.</p>
              )}

              {task.resource_links?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#0B1B3F]">Links</h3>
                  <ul className="mt-2 divide-y divide-[#EEF2FA] rounded-xl ring-1 ring-[#DCE5F5]">
                    {task.resource_links.map((link: any, i: number) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-[#F8FAFF]"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-[#0B1B3F]">{link.title || link.url}</span>
                            <span className="block truncate text-[#7B869C]">{link.url}</span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-[#7B869C]" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {task.attachments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#0B1B3F]">Files</h3>
                  <ul className="mt-2 divide-y divide-[#EEF2FA] rounded-xl ring-1 ring-[#DCE5F5]">
                    {task.attachments.map((file: any, i: number) => (
                      <li key={i}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0B1B3F] hover:bg-[#F8FAFF]"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-[#155DFC]" aria-hidden="true" />
                          <span className="truncate">{file.name || "Attachment"}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[#EEF2FA] px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
              >
                Done
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- reports ---------- */

export function ReportRow({ log }: { log: LogLike }) {
  const [open, setOpen] = useState(false);
  const status = reportStatus(log);
  const summary = log.learning_log?.trim();
  const tasksDone: string[] = Array.isArray(log.tasks_completed) ? log.tasks_completed.filter(Boolean) : [];
  return (
    <li>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn(rowClass, "items-start")}>
        <span className="w-16 shrink-0 pt-0.5">
          <span className="block text-sm font-semibold text-[#0B1B3F]">{formatDay(logDay(log), { day: "numeric", month: "short" })}</span>
          <span className="block text-xs text-[#7B869C]">{formatDay(logDay(log), { weekday: "short" })}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-[15px] text-[#0B1B3F]", !open && "line-clamp-2")}>
            {summary || <span className="text-[#7B869C]">Checked in, no report yet</span>}
          </span>
          {open && (
            <span className="mt-3 block space-y-2 text-sm text-[#4A5670]">
              {tasksDone.length > 0 && (
                <span className="block">
                  <span className="font-medium text-[#0B1B3F]">Tasks done: </span>
                  {tasksDone.join(", ")}
                </span>
              )}
              {(log.check_in_time || log.check_out_time) && (
                <span className="block">
                  {log.check_in_time && `In ${formatTime(log.check_in_time)}`}
                  {log.check_in_time && log.check_out_time && ", "}
                  {log.check_out_time && `out ${formatTime(log.check_out_time)}`}
                </span>
              )}
              {log.experience_rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" aria-hidden="true" />
                  Rated the day {log.experience_rating} of 5
                </span>
              )}
              {log.supervisor_comment && (
                <span className="block rounded-lg bg-[#F3F7FF] px-3 py-2 text-[#0B1B3F]">
                  <span className="font-medium">Supervisor: </span>
                  {log.supervisor_comment}
                </span>
              )}
            </span>
          )}
        </span>
        {summary && <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_CHIP[status])}>{REPORT_STATUS_LABEL[status]}</span>}
      </button>
    </li>
  );
}

/* ---------- filters ---------- */

export function ListFilters<T extends string>({
  search,
  onSearch,
  placeholder,
  options,
  value,
  onChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-2 sm:flex-row sm:items-center sm:px-6">
      <label className="relative flex-1">
        <span className="sr-only">{placeholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B869C]" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-[#0B1B3F] ring-1 ring-[#DCE5F5] placeholder:text-[#9AA6BD] focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
        />
      </label>
      <div role="radiogroup" aria-label="Filter" className="flex gap-1 overflow-x-auto rounded-xl bg-[#F1F4FA] p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-8 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]",
              value === o.value ? "bg-white text-[#0B1B3F] shadow-sm" : "text-[#4A5670] hover:text-[#0B1B3F]"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
