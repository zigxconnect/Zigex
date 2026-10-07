"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Clock, Loader2, LogIn, WifiOff, X } from "lucide-react";

export type ApplyKind = "internship" | "program" | "event";
/** Who is applying, from their profile (the company sees the full profile). */
export type ApplyPrefill = {
  fullName?: string;
  school?: string;
  avatar?: string | null;
  /** What's missing from the profile companies will read, e.g. ["your school", "skills"]. */
  gaps?: string[];
};

const draftKey = (id: string) => `zigex_apply_draft_${id}`;

/** A failed send, described for the student: what happened and what to do. */
type SendError = {
  kind: "offline" | "slow" | "signedOut" | "closed" | "tooMany" | "check" | "unknown";
  title: string;
  message: string;
};

/** Turn a failed request into words a student understands; never shows codes or field names. */
function describeError(status: number | null, raw: string, verb: string): SendError {
  const m = raw.toLowerCase();
  if (status === null) {
    return { kind: "offline", title: "You seem to be offline", message: "Check your internet connection, then try again. Your answers are saved." };
  }
  if (status === 401 || /sign in|log in|unauthori/.test(m)) {
    return { kind: "signedOut", title: "You've been signed out", message: "Sign in again to send it. Your answers are saved on this device." };
  }
  if (/deadline|closed|no longer|has passed|ended/.test(m)) {
    return { kind: "closed", title: "This has closed", message: `The deadline passed before your ${verb} was sent. Other opportunities are still open.` };
  }
  if (status === 429 || /too many/.test(m)) {
    return { kind: "tooMany", title: "Too many tries", message: "Wait a minute, then send it again. Your answers are saved." };
  }
  if (status >= 500 || status === 408 || /reach|timeout|slow/.test(m)) {
    return { kind: "slow", title: "Zigex didn't respond in time", message: "Nothing was sent. Your answers are saved, so you can try again in a moment." };
  }
  if (/isn't working|not working/.test(m)) {
    // A known outage on the backend; the server already explains it in plain words.
    return { kind: "slow", title: "Not available right now", message: raw };
  }
  if (status === 400 || status === 422) {
    // A readable reason from our own routes ("Tell the company a little more…"); hide raw field names.
    const readable = raw && !/_id\b|required$|validation|bad_request/i.test(raw);
    return { kind: "check", title: "Check your answers", message: readable ? raw : "Something in the form wasn't accepted. Check your answers and try again." };
  }
  return { kind: "unknown", title: "It wasn't sent", message: "Something went wrong on our side. Your answers are saved; try again in a moment." };
}
type Draft = { why: string; area: string; duration: string; experience: string; level: string; note: string };

const TIPS: Record<"internship" | "program", string[]> = {
  internship: [
    "What you've learned or built so far (a class project counts).",
    "What you want to do or learn in this internship.",
    "When you're available and how you'll get there.",
  ],
  program: ["Why this program, and why now.", "What you already know about the subject.", "What you want to be able to do by the end."],
};

const AREAS = ["Web development", "Mobile apps", "Backend", "UI/UX design", "Data / AI", "Cybersecurity", "IoT / embedded", "Project management", "Other"];
const DURATIONS = ["1 month", "2 months", "3 months", "4+ months"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

const textarea =
  "w-full resize-y rounded-xl border border-[#DCE5F5] bg-white px-4 py-3 text-base text-[#0B1B3F] placeholder:text-[#7B869C] transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 aria-[invalid=true]:border-[#D92D20]";

/** Tap-to-pick options: faster than a dropdown for a handful of choices, especially on phones. */
function Chips({ label, options, value, onChange, optional }: { label: string; options: string[]; value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-[#0B1B3F]">
        {label}
        {optional && <span className="font-normal text-[#7B869C]"> (optional)</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on && optional ? "" : o)}
              className={`h-10 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                on ? "bg-[#0B1B3F] text-white" : "bg-white text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:ring-[#B9C8E6]"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Apply in one screen, in a panel that keeps the opportunity in view (slides
 * in from the right on desktop, full height on phones). The company already
 * receives the student's profile, so the form asks only what a profile can't
 * say. Events are a single tap.
 */
export function ApplyDialog({
  open,
  onOpenChange,
  kind,
  id,
  title,
  company,
  image,
  closesAt,
  hasFee,
  priceXaf,
  prefill,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ApplyKind;
  id: string;
  title: string;
  company: string;
  image?: string | null;
  closesAt?: string | null;
  hasFee: boolean;
  priceXaf: number | null;
  prefill: ApplyPrefill;
  onSubmitted: () => void;
}) {
  const uid = useId();
  const [why, setWhy] = useState("");
  const [area, setArea] = useState("");
  const [duration, setDuration] = useState("");
  const [experience, setExperience] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [feeOk, setFeeOk] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SendError | null>(null);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [already, setAlready] = useState(false);
  const whyRef = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // Restore an unsent draft for this opportunity, then keep it saved as the student types.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(draftKey(id)) ?? "null") as Draft | null;
      if (d) {
        setWhy(d.why ?? "");
        setArea(d.area ?? "");
        setDuration(d.duration ?? "");
        setExperience(d.experience ?? "");
        setLevel(d.level ?? "");
        setNote(d.note ?? "");
        if (d.note) setShowNote(true);
      }
    } catch {
      // Storage blocked: the form still works, just without drafts.
    }
    loaded.current = true;
  }, [id]);

  useEffect(() => {
    if (!loaded.current || done) return;
    const draft: Draft = { why, area, duration, experience, level, note };
    const empty = !why && !area && !duration && !experience && !level && !note;
    const t = setTimeout(() => {
      try {
        if (empty) localStorage.removeItem(draftKey(id));
        else localStorage.setItem(draftKey(id), JSON.stringify(draft));
        setSaved(!empty);
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(t);
  }, [why, area, duration, experience, level, note, id, done]);

  useEffect(() => {
    if (open) {
      setError(null);
      setTried(false);
    } else if (done) {
      setDone(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const minWhy = kind === "internship" ? 30 : kind === "program" ? 20 : 0;
  const problems = {
    why: why.trim().length < minWhy ? (why.trim() ? `Write a little more (${why.trim().length}/${minWhy} characters).` : kind === "internship" ? "Tell the company why you're a good fit." : "Tell the organisers what you hope to get.") : "",
    level: kind === "program" && !level ? "Choose your level." : "",
    fee: hasFee && kind !== "event" && !feeOk ? "Confirm you've read about the fee." : "",
  };
  const valid = !problems.why && !problems.level && !problems.fee;

  const submit = async () => {
    setTried(true);
    if (!valid) {
      // Take the student to the first thing to fix.
      requestAnimationFrame(() => {
        if (problems.why) whyRef.current?.focus();
        else document.querySelector<HTMLElement>(`[data-problem="true"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    const verb = kind === "event" ? "RSVP" : kind === "program" ? "registration" : "application";
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError(describeError(null, "", verb));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let res: Response;
      if (kind === "internship") {
        res = await fetch("/api/students/applications/internship", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            internship_id: id,
            reason: why.trim(),
            domain: area || undefined,
            duration: duration || undefined,
            experience_level: experience || undefined,
            comment: note.trim() || undefined,
            is_paid_acknowledgement: hasFee ? feeOk : undefined,
          }),
        });
      } else {
        const data = new FormData();
        data.append(`${kind}_id`, id);
        if (kind === "program") data.append("level", level);
        if (why.trim()) data.append("expectations", why.trim());
        if (note.trim()) data.append("comments", note.trim());
        if (kind === "event") data.append("rsvp_status", "true");
        res = await fetch("/api/students/applications", { method: "POST", body: data });
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = typeof body.error === "string" ? body.error : "";
        if (res.status === 409 || /already|duplicate/i.test(message)) {
          setAlready(true);
          onSubmitted();
          return;
        }
        setError(describeError(res.status, message, verb));
        return;
      }
      try {
        localStorage.removeItem(draftKey(id));
      } catch {
        // ignore
      }
      setDone(true);
      onSubmitted();
    } catch {
      // fetch itself failed: no connection, or the request was cut off.
      setError(describeError(navigator.onLine === false ? null : 503, "", kind === "event" ? "RSVP" : kind === "program" ? "registration" : "application"));
    } finally {
      setBusy(false);
    }
  };

  const fee = priceXaf ? `${priceXaf.toLocaleString("en-US")} XAF` : "a fee";
  const deadline = closesAt ? new Date(closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : null;
  const action = kind === "event" ? "Reserve my spot" : kind === "program" ? "Register" : "Send application";
  const firstName = (prefill.fullName ?? "").split(" ")[0];

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#0B1B3F]/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            if (whyRef.current) {
              e.preventDefault();
              whyRef.current.focus();
            }
          }}
          className="fixed inset-y-0 right-0 z-[101] flex w-full flex-col bg-white shadow-[-24px_0_64px_-24px_rgba(11,27,63,0.35)] focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right motion-reduce:animate-none sm:max-w-[480px]"
        >
          {/* What you're applying to stays visible at the top */}
          <div className="flex items-start gap-3 border-b border-[#EEF2FA] px-5 py-4">
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F7FF]">
              {image && <img src={image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="line-clamp-2 font-heading text-base font-semibold leading-snug text-[#0B1B3F]">{title}</Dialog.Title>
              <p className="mt-0.5 truncate text-sm text-[#4A5670]">
                {company}
                {deadline && !done && <span className="text-[#7B869C]">, closes {deadline}</span>}
              </p>
            </div>
            <Dialog.Close
              disabled={busy}
              aria-label="Close"
              className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {already ? (
            <div className="flex flex-1 flex-col px-5 py-8">
              <h2 className="font-heading text-xl font-semibold text-[#0B1B3F]">You&apos;ve already applied</h2>
              <p className="mt-2 text-base text-[#4A5670]">Your earlier application is with {company || "the company"}. You can follow it in My applications.</p>
              <Link href="/dashboard/applied-internships" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#155DFC] text-base font-semibold text-white hover:bg-[#0F3FB8]">
                View my applications
              </Link>
            </div>
          ) : done ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3]">
                <CheckCircle2 className="h-7 w-7 text-[#067647]" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-heading text-2xl font-semibold text-[#0B1B3F]">
                {kind === "event" ? "Spot requested" : kind === "program" ? "You're registered" : "Application sent"}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-[#4A5670]">
                {kind === "event"
                  ? `${company || "The organiser"} will confirm your place.`
                  : `${company || "The company"} will review it and let you know.`}{" "}
                You&apos;ll get an email and a notification on Zigex.
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-8">
                <Link href="/dashboard/applied-internships" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#155DFC] text-base font-semibold text-white hover:bg-[#0F3FB8]">
                  View my applications
                </Link>
                <Dialog.Close className="inline-flex h-12 items-center justify-center rounded-xl text-base font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]">Done</Dialog.Close>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                {/* The profile goes with the application; no retyping. */}
                <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] p-3 ring-1 ring-[#EEF2FA]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#155DFC] font-semibold text-white">
                    {prefill.avatar ? <img src={prefill.avatar} alt="" className="h-full w-full object-cover" /> : (firstName || "Y").charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-semibold text-[#0B1B3F]">Applying as {prefill.fullName || "you"}</p>
                    <p className="truncate text-[#4A5670]">{prefill.school || "Your Zigex profile is shared with the company"}</p>
                  </div>
                  <Link href="/dashboard/edit-profile" target="_blank" className="shrink-0 text-sm font-semibold text-[#155DFC] hover:underline">
                    Edit profile
                  </Link>
                </div>
                {prefill.gaps && prefill.gaps.length > 0 && kind !== "event" && (
                  <p className="-mt-3 text-sm text-[#7A2E0E]">
                    Your profile has no {prefill.gaps.length > 1 ? `${prefill.gaps.slice(0, -1).join(", ")} or ${prefill.gaps.at(-1)}` : prefill.gaps[0]} yet. Companies read it with your answer, so adding them helps. You can still apply now.
                  </p>
                )}

                {kind === "internship" && (
                  <>
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <label htmlFor={`${uid}-why`} className="text-sm font-medium text-[#0B1B3F]">
                          Why are you a good fit?
                        </label>
                        <TipsToggle open={showTips} onToggle={() => setShowTips((v) => !v)} />
                      </div>
                      {showTips && <Tips items={TIPS.internship} />}
                      <textarea
                        ref={whyRef}
                        id={`${uid}-why`}
                        rows={5}
                        value={why}
                        onChange={(e) => setWhy(e.target.value)}
                        placeholder="What you've learned or built, and what you want to do in this internship."
                        aria-invalid={tried && Boolean(problems.why)}
                        aria-describedby={`${uid}-why-msg`}
                        className={textarea}
                      />
                      <p id={`${uid}-why-msg`} className={`mt-1.5 text-sm ${tried && problems.why ? "text-[#B42318]" : "text-[#7B869C]"}`}>
                        {tried && problems.why ? problems.why : <Counter n={why.trim().length} min={30} />}
                      </p>
                    </div>
                    <Chips label="Area you want to work in" options={AREAS} value={area} onChange={setArea} optional />
                    <Chips label="How long you can intern" options={DURATIONS} value={duration} onChange={setDuration} optional />
                    <Chips label="Your experience" options={EXPERIENCE} value={experience} onChange={setExperience} optional />
                  </>
                )}

                {kind === "program" && (
                  <>
                    <Chips label="Your level in this subject" options={EXPERIENCE} value={level} onChange={setLevel} />
                    {tried && problems.level && (
                      <p data-problem="true" className="-mt-4 text-sm text-[#B42318]">
                        {problems.level}
                      </p>
                    )}
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <label htmlFor={`${uid}-why`} className="text-sm font-medium text-[#0B1B3F]">
                          What do you hope to get from it?
                        </label>
                        <TipsToggle open={showTips} onToggle={() => setShowTips((v) => !v)} />
                      </div>
                      {showTips && <Tips items={TIPS.program} />}
                      <textarea
                        ref={whyRef}
                        id={`${uid}-why`}
                        rows={4}
                        value={why}
                        onChange={(e) => setWhy(e.target.value)}
                        aria-invalid={tried && Boolean(problems.why)}
                        aria-describedby={`${uid}-why-msg`}
                        className={textarea}
                      />
                      <p id={`${uid}-why-msg`} className={`mt-1.5 text-sm ${tried && problems.why ? "text-[#B42318]" : "text-[#7B869C]"}`}>
                        {tried && problems.why ? problems.why : <Counter n={why.trim().length} min={20} />}
                      </p>
                    </div>
                  </>
                )}

                {kind === "event" && <p className="text-base text-[#4A5670]">Reserve your spot and the organiser will confirm it. That&apos;s all you need to do.</p>}

                {/* Optional note, folded away so it doesn't look required */}
                {showNote ? (
                  <div>
                    <label htmlFor={`${uid}-note`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                      Note <span className="font-normal text-[#7B869C]">(optional)</span>
                    </label>
                    <textarea id={`${uid}-note`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={textarea} autoFocus />
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowNote(true)} className="text-sm font-semibold text-[#155DFC] hover:underline">
                    {kind === "event" ? "Add a note (questions, access needs)" : "Add a note for the company"}
                  </button>
                )}

                {hasFee && kind !== "event" && (
                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#FFF7E6] p-4 text-sm text-[#7A2E0E]">
                      <input type="checkbox" checked={feeOk} onChange={(e) => setFeeOk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#155DFC]" />
                      <span>
                        This {kind} has {fee}. I understand the company will explain how to pay if I&apos;m accepted.
                      </span>
                    </label>
                    {tried && problems.fee && (
                      <p data-problem="true" className="mt-1.5 text-sm text-[#B42318]">
                        {problems.fee}
                      </p>
                    )}
                  </div>
                )}

              </div>

              <div className="border-t border-[#EEF2FA] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {/* Shown next to the button, so it's seen right after pressing it. */}
                {error && <ErrorNotice error={error} onRetry={submit} busy={busy} />}
                {kind !== "event" && (
                  <p className="mb-2 flex items-center justify-between text-xs text-[#7B869C]" aria-live="polite">
                    <span>{saved ? "Draft saved on this device" : "Your answers are saved as you type"}</span>
                    <span className="hidden sm:inline">Ctrl + Enter to send</span>
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                  {busy ? "Sending…" : action}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Grey until the answer is long enough, then a green check. */
function Counter({ n, min }: { n: number; min: number }) {
  return n >= min ? (
    <span className="inline-flex items-center gap-1 text-[#067647]">
      <Check className="h-4 w-4" aria-hidden="true" />
      Good length
    </span>
  ) : (
    <span>{min - n} more characters needed</span>
  );
}

function TipsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#155DFC] hover:underline">
      What should I write?
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
    </button>
  );
}

function Tips({ items }: { items: string[] }) {
  return (
    <ul className="mb-2 space-y-1 rounded-xl bg-[#F3F7FF] px-4 py-3 text-sm text-[#0B1B3F]">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}

const ERROR_ICON = { offline: WifiOff, slow: Clock, signedOut: LogIn, closed: AlertCircle, tooMany: Clock, check: AlertCircle, unknown: AlertCircle };

/**
 * The failed-send notice above the button: icon, short title, what to do,
 * and the one action that helps. Amber for "try again", red for "fix it".
 */
function ErrorNotice({ error, onRetry, busy }: { error: SendError; onRetry: () => void; busy: boolean }) {
  const Icon = ERROR_ICON[error.kind];
  const fixable = error.kind === "check";
  const tone = fixable || error.kind === "closed" ? "bg-[#FEF3F2] text-[#912018] ring-[#FECDCA]" : "bg-[#FFFAEB] text-[#7A2E0E] ring-[#FEDF89]";
  const here = typeof window !== "undefined" ? window.location.pathname : "/feed";
  return (
    <div role="alert" className={`mb-3 rounded-xl px-4 py-3 ring-1 ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{error.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed">{error.message}</p>
          <div className="mt-2">
            {error.kind === "signedOut" ? (
              <Link href={`/sign-in?next=${encodeURIComponent(here)}`} className="text-sm font-semibold underline underline-offset-2">
                Sign in again
              </Link>
            ) : error.kind === "closed" ? (
              <Link href="/feed" className="text-sm font-semibold underline underline-offset-2">
                See open opportunities
              </Link>
            ) : !fixable ? (
              <button type="button" onClick={onRetry} disabled={busy} className="text-sm font-semibold underline underline-offset-2 disabled:opacity-60">
                {busy ? "Trying again…" : "Try again"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
