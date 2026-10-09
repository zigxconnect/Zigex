"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { submitInternshipLog } from "@/lib/actions/intenship.actions";
import { cn } from "@/lib/utils";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
  /** Titles of the student's current tasks, offered as one-tap entries. */
  taskSuggestions?: string[];
}

const RATINGS = [
  { value: 1, label: "Hard" },
  { value: 2, label: "Slow" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

const MIN_WORDS = 8;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const draftKey = (id: string) => `zx-report-draft:${id}:${today()}`;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * End-of-day report: what you did and learned, the tasks you worked on, and how
 * the day went. Keeps an unsent draft on this device until it's sent.
 */
export function DailyReportModal({ isOpen, onClose, internshipId, taskSuggestions = [] }: DailyReportModalProps) {
  const router = useRouter();
  const ids = useId();
  const [summary, setSummary] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  // Restore today's draft.
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey(internshipId)) ?? "null");
      if (saved) {
        setSummary(saved.summary ?? "");
        setTasks(saved.tasks ?? []);
        setRating(saved.rating ?? null);
      }
    } catch {}
  }, [isOpen, internshipId]);

  // Save the draft as they type.
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (summary || tasks.length || rating) localStorage.setItem(draftKey(internshipId), JSON.stringify({ summary, tasks, rating }));
    } catch {}
  }, [isOpen, internshipId, summary, tasks, rating]);

  const addTask = (title: string) => {
    const t = title.trim();
    if (t && !tasks.includes(t)) setTasks((prev) => [...prev, t]);
  };

  const summaryShort = words(summary) < MIN_WORDS;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    setError(null);
    if (summaryShort) return;
    const pending = newTask.trim();
    const allTasks = pending && !tasks.includes(pending) ? [...tasks, pending] : tasks;
    setBusy(true);
    try {
      const result = await submitInternshipLog({
        internship_id: internshipId,
        log_date: today(),
        learning_log: summary.trim(),
        tasks_completed: allTasks,
        experience_rating: rating ?? 3,
      });
      if (result.success) {
        try {
          localStorage.removeItem(draftKey(internshipId));
        } catch {}
        toast.success("Report sent. Your supervisor has been told.");
        onClose();
        router.refresh();
      } else {
        setError(result.error || "Your report wasn't sent. Try again.");
      }
    } catch {
      setError("Your report wasn't sent. Check your connection and try again. Your text is saved on this device.");
    } finally {
      setBusy(false);
    }
  };

  const suggestions = taskSuggestions.filter((t) => t && !tasks.includes(t)).slice(0, 4);
  const label = "block text-sm font-semibold text-[#0B1B3F]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-lg">
        <div className="border-b border-[#EEF2FA] px-6 pb-4 pt-6 pr-14">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-[#0B1B3F]">Today&apos;s report</DialogTitle>
          <DialogDescription className="mt-1 text-[15px] text-[#4A5670]">
            Your supervisor reads this, and it goes into your logbook.
          </DialogDescription>
        </div>

        <form id={`${ids}-form`} onSubmit={submit} noValidate className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor={`${ids}-summary`} className={label}>
              What did you do and learn today?
            </label>
            <textarea
              id={`${ids}-summary`}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              aria-invalid={tried && summaryShort}
              aria-describedby={`${ids}-summary-hint`}
              placeholder="For example: Set up VLANs on the lab switch with Ama. Learned how trunk ports carry several VLANs. Stuck on inter-VLAN routing; will ask tomorrow."
              className={cn(
                "mt-2 w-full resize-y rounded-xl bg-white px-4 py-3 text-[15px] leading-relaxed text-[#0B1B3F] ring-1 placeholder:text-[#9AA6BD] focus:outline-none focus:ring-2 focus:ring-[#155DFC]",
                tried && summaryShort ? "ring-[#F3B5AE]" : "ring-[#DCE5F5]"
              )}
            />
            <p id={`${ids}-summary-hint`} className={cn("mt-1.5 text-sm", tried && summaryShort ? "text-[#B42318]" : "text-[#7B869C]")}>
              {tried && summaryShort ? `Write a little more: at least ${MIN_WORDS} words.` : "Two or three sentences are enough. Mention anything you got stuck on."}
            </p>
          </div>

          <div>
            <p className={label} id={`${ids}-tasks`}>
              Tasks you worked on <span className="font-normal text-[#7B869C]">(optional)</span>
            </p>
            {tasks.length > 0 && (
              <ul aria-labelledby={`${ids}-tasks`} className="mt-2 flex flex-wrap gap-2">
                {tasks.map((t) => (
                  <li key={t} className="inline-flex items-center gap-1 rounded-lg bg-[#F3F7FF] py-1 pl-3 pr-1 text-sm text-[#0B1B3F]">
                    {t}
                    <button
                      type="button"
                      onClick={() => setTasks((prev) => prev.filter((x) => x !== t))}
                      aria-label={`Remove ${t}`}
                      className="rounded-md p-1 text-[#4A5670] hover:bg-white hover:text-[#B42318]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTask(t)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-[#4A5670] border border-dashed border-[#C9D6EE] hover:bg-[#F8FAFF] hover:text-[#0B1B3F]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <label htmlFor={`${ids}-new-task`} className="sr-only">
                Add a task
              </label>
              <input
                id={`${ids}-new-task`}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask(newTask);
                    setNewTask("");
                  }
                }}
                placeholder="Add a task"
                className="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-sm text-[#0B1B3F] ring-1 ring-[#DCE5F5] placeholder:text-[#9AA6BD] focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
              />
              <button
                type="button"
                onClick={() => {
                  addTask(newTask);
                  setNewTask("");
                }}
                disabled={!newTask.trim()}
                className="h-10 shrink-0 rounded-xl px-4 text-sm font-semibold text-[#155DFC] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] disabled:text-[#9AA6BD]"
              >
                Add
              </button>
            </div>
          </div>

          <fieldset>
            <legend className={label}>
              How was today? <span className="font-normal text-[#7B869C]">(optional)</span>
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {RATINGS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl py-2 text-sm ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#155DFC]",
                    rating === r.value ? "bg-[#155DFC] text-white ring-[#155DFC]" : "bg-white text-[#4A5670] ring-[#DCE5F5] hover:bg-[#F8FAFF]"
                  )}
                >
                  <input type="radio" name={`${ids}-rating`} value={r.value} checked={rating === r.value} onChange={() => setRating(r.value)} className="sr-only" />
                  <span className="font-heading text-base font-semibold">{r.value}</span>
                  <span className={cn("text-xs", rating === r.value ? "text-white/85" : "text-[#7B869C]")}>{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
              {error}
            </p>
          )}
        </form>

        <div className="flex gap-3 border-t border-[#EEF2FA] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 flex-1 rounded-xl bg-white text-[15px] font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] sm:flex-none sm:px-5"
          >
            Not now
          </button>
          <button
            type="submit"
            form={`${ids}-form`}
            disabled={busy}
            className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-[15px] font-semibold text-white hover:bg-[#0F3FB8] disabled:opacity-60 sm:ml-auto sm:flex-none sm:px-6"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {busy ? "Sending…" : "Send report"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
