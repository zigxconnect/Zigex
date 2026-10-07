"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

export type ApplyKind = "internship" | "program" | "event";
/** Who is applying, from their profile (the company sees the full profile). */
export type ApplyPrefill = { fullName?: string; school?: string; avatar?: string | null };

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
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    if (!valid) return;
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
      if (!res.ok) throw new Error(typeof body.error === "string" ? body.error : "The application couldn't be sent.");
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The application couldn't be sent. Check your connection and try again.");
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

          {done ? (
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

                {kind === "internship" && (
                  <>
                    <div>
                      <label htmlFor={`${uid}-why`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                        Why are you a good fit?
                      </label>
                      <textarea
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
                        {tried && problems.why ? problems.why : `${why.trim().length} characters, 30 minimum`}
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
                    {tried && problems.level && <p className="-mt-4 text-sm text-[#B42318]">{problems.level}</p>}
                    <div>
                      <label htmlFor={`${uid}-why`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                        What do you hope to get from it?
                      </label>
                      <textarea
                        id={`${uid}-why`}
                        rows={4}
                        value={why}
                        onChange={(e) => setWhy(e.target.value)}
                        aria-invalid={tried && Boolean(problems.why)}
                        aria-describedby={`${uid}-why-msg`}
                        className={textarea}
                      />
                      <p id={`${uid}-why-msg`} className={`mt-1.5 text-sm ${tried && problems.why ? "text-[#B42318]" : "text-[#7B869C]"}`}>
                        {tried && problems.why ? problems.why : `${why.trim().length} characters, 20 minimum`}
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
                    {tried && problems.fee && <p className="mt-1.5 text-sm text-[#B42318]">{problems.fee}</p>}
                  </div>
                )}

                {error && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

              <div className="border-t border-[#EEF2FA] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
