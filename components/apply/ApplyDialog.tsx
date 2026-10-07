"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

export type ApplyKind = "internship" | "program" | "event";
export type ApplyPrefill = { fullName?: string; school?: string; dateOfBirth?: string; address?: string };

const SCHOOL_SUGGESTIONS = ["NAHPI", "COLTECH", "NPUI", "CATUC", "University of Bamenda", "University of Buea"];
const LEVELS = ["200", "300", "400", "500", "Masters", "PhD", "Other"];
const DOMAINS = [
  "Frontend web development",
  "Backend development",
  "Mobile development",
  "Machine learning / AI",
  "Cybersecurity",
  "Product design (UI/UX)",
  "Embedded systems & IoT",
  "Project management",
  "Product management",
  "Other",
];
const DURATIONS = ["1 month", "2 months", "3 months", "4 months", "5 months", "Other"];
const EXPERIENCE = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Expert", label: "Advanced" },
  { value: "No Idea", label: "Not sure" },
];

const inputClass =
  "w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-base text-[#0B1B3F] placeholder:text-[#7B869C] transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 aria-[invalid=true]:border-[#D92D20]";
const selectClass = `${inputClass} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234A5670'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.875rem_center] bg-no-repeat pr-10`;

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1.5 flex items-start gap-1.5 text-sm text-[#B42318]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="mt-1.5 text-sm text-[#7B869C]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const minChars = (v: string, n: number, what: string) =>
  v.trim().length >= n ? "" : v.trim() ? `Write a little more (${v.trim().length}/${n} characters).` : `Tell the company ${what}.`;

function ageOf(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/**
 * The application form for an internship, program or event, in one dialog.
 * Internships: About you (prefilled from the profile), Your goals, Review.
 * Programs: one short form. Events: reserve a spot with an optional note.
 * Submits through the existing /api/students/applications routes.
 */
export function ApplyDialog({
  open,
  onOpenChange,
  kind,
  id,
  title,
  company,
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
  hasFee: boolean;
  priceXaf: number | null;
  prefill: ApplyPrefill;
  onSubmitted: () => void;
}) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const steps = kind === "internship" ? ["About you", "Your goals", "Review"] : ["Your details"];
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: prefill.fullName ?? "",
    school: prefill.school ?? "",
    school_level: "",
    date_of_birth: prefill.dateOfBirth?.slice(0, 10) ?? "",
    address: prefill.address ?? "",
    domain: "",
    duration: "",
    experience_level: "",
    reason: "",
    expectations: "",
    level: "",
    comments: "",
    confirm: false,
  });
  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((p) => ({ ...p, [k]: true }));

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setError(null);
    setDone(false);
    setTouched({});
  }, [open]);

  const errors: Record<string, string> = {
    full_name: form.full_name.trim().length >= 3 ? "" : "Enter your full name.",
    school: form.school.trim().length >= 2 ? "" : "Enter your school or faculty.",
    school_level: form.school_level ? "" : "Choose your level.",
    date_of_birth: (() => {
      if (!form.date_of_birth) return "Enter your date of birth.";
      const age = ageOf(form.date_of_birth);
      if (age === null || age > 85) return "Enter a valid date of birth.";
      return age < 13 ? "You need to be at least 13 to apply." : "";
    })(),
    address: form.address.trim().length >= 5 ? "" : "Enter where you live, like Mile 4, Nkwen.",
    domain: form.domain ? "" : "Choose the area you want to work in.",
    duration: form.duration ? "" : "Choose how long you can intern.",
    experience_level: form.experience_level ? "" : "Choose your experience level.",
    reason: minChars(form.reason, 30, "why you want this internship"),
    expectations: minChars(form.expectations, kind === "event" ? 0 : 20, "what you hope to learn"),
    level: form.level ? "" : "Choose your level.",
    confirm: form.confirm ? "" : hasFee ? "Confirm you've read the fee and your details." : "Confirm your details are accurate.",
  };

  const fieldsFor: Record<string, string[]> = {
    "internship-0": ["full_name", "school", "school_level", "date_of_birth", "address"],
    "internship-1": ["domain", "duration", "experience_level", "reason", "expectations"],
    "internship-2": ["confirm"],
    "program-0": ["level", "expectations", "confirm"],
    "event-0": [],
  };
  const current = fieldsFor[`${kind}-${step}`] ?? [];
  const show = (k: string) => (touched[k] ? errors[k] || undefined : undefined);
  const aria = (k: string) => ({ "aria-invalid": Boolean(show(k)), "aria-describedby": `${f(k)}-msg`, onBlur: () => touch(k) });

  const next = () => {
    current.forEach(touch);
    if (current.some((k) => errors[k])) return;
    if (step < steps.length - 1) setStep(step + 1);
    else submit();
  };

  const submit = async () => {
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
            full_name: form.full_name.trim(),
            school: form.school.trim(),
            school_level: form.school_level,
            date_of_birth: form.date_of_birth,
            address: form.address.trim(),
            domain: form.domain,
            duration: form.duration,
            experience_level: form.experience_level,
            reason: form.reason.trim(),
            expectations: form.expectations.trim(),
            // The route requires this acknowledgement; it covers the fee when there is one.
            is_paid_acknowledgement: form.confirm,
            comment: form.comments.trim() || undefined,
          }),
        });
      } else {
        const data = new FormData();
        data.append(`${kind}_id`, id);
        if (kind === "program") data.append("level", form.level);
        if (form.expectations.trim()) data.append("expectations", form.expectations.trim());
        if (form.comments.trim()) data.append("comments", form.comments.trim());
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

  const verb = kind === "event" ? "Reserve your spot" : `Apply to ${kind === "program" ? "this program" : "this internship"}`;
  const fee = priceXaf ? `${priceXaf.toLocaleString("en-US")} XAF` : "a fee";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#0B1B3F]/50 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[101] flex flex-col bg-white focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:shadow-[0_24px_64px_-16px_rgba(11,27,63,0.4)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#EEF2FA] px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <Dialog.Title className="font-heading text-lg font-semibold text-[#0B1B3F]">{done ? "Sent" : verb}</Dialog.Title>
              <p className="mt-0.5 truncate text-sm text-[#4A5670]">
                {title}
                {company && ` at ${company}`}
              </p>
            </div>
            <Dialog.Close
              disabled={busy}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {done ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8 sm:px-6">
              <CheckCircle2 className="h-10 w-10 text-[#067647]" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-xl font-semibold text-[#0B1B3F]">
                {kind === "event" ? "Your spot is requested" : "Application sent"}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-[#4A5670]">
                {kind === "event"
                  ? `${company || "The organiser"} will confirm your place. You'll get an email and a notification on Zigex.`
                  : `${company || "The company"} will review it. You'll get an email and a notification on Zigex when they decide.`}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#2B3A55]">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
                  Follow its status in My applications.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
                  Keep your profile up to date; companies read it when they review.
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-8 sm:flex-row">
                <Link
                  href="/dashboard/applied-internships"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#155DFC] px-5 text-base font-semibold text-white hover:bg-[#0F3FB8]"
                >
                  View my applications
                </Link>
                <Dialog.Close className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#DCE5F5] px-5 text-base font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]">
                  Back to the page
                </Dialog.Close>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {steps.length > 1 && (
                <div className="px-5 pt-4 sm:px-6">
                  <p className="text-sm font-medium text-[#0B1B3F]">
                    Step {step + 1} of {steps.length}: {steps[step]}
                  </p>
                  <div className="mt-2 flex gap-1.5" aria-hidden="true">
                    {steps.map((s, i) => (
                      <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#155DFC]" : "bg-[#E3E9F5]"}`} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                {kind === "internship" && step === 0 && (
                  <>
                    {(prefill.fullName || prefill.school) && (
                      <p className="rounded-xl bg-[#F3F7FF] px-4 py-3 text-sm text-[#0B1B3F]">
                        We filled in what&apos;s on your profile. Check it&apos;s right.
                      </p>
                    )}
                    <Field id={f("full_name")} label="Full name" error={show("full_name")} hint="As on your ID card or birth certificate.">
                      <input id={f("full_name")} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} autoComplete="name" className={`${inputClass} h-12`} {...aria("full_name")} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem]">
                      <Field id={f("school")} label="School or faculty" error={show("school")}>
                        <input id={f("school")} list={f("schools")} value={form.school} onChange={(e) => set("school", e.target.value)} placeholder="COLTECH" className={`${inputClass} h-12`} {...aria("school")} />
                        <datalist id={f("schools")}>
                          {SCHOOL_SUGGESTIONS.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </Field>
                      <Field id={f("school_level")} label="Level" error={show("school_level")}>
                        <select id={f("school_level")} value={form.school_level} onChange={(e) => set("school_level", e.target.value)} className={selectClass} {...aria("school_level")}>
                          <option value="">Choose</option>
                          {LEVELS.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id={f("date_of_birth")} label="Date of birth" error={show("date_of_birth")}>
                        <input id={f("date_of_birth")} type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} autoComplete="bday" className={`${inputClass} h-12`} {...aria("date_of_birth")} />
                      </Field>
                      <Field id={f("address")} label="Where you live" error={show("address")}>
                        <input id={f("address")} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Mile 4, Nkwen" autoComplete="address-level2" className={`${inputClass} h-12`} {...aria("address")} />
                      </Field>
                    </div>
                  </>
                )}

                {kind === "internship" && step === 1 && (
                  <>
                    <Field id={f("domain")} label="Area you want to work in" error={show("domain")}>
                      <select id={f("domain")} value={form.domain} onChange={(e) => set("domain", e.target.value)} className={selectClass} {...aria("domain")}>
                        <option value="">Choose an area</option>
                        {DOMAINS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id={f("duration")} label="How long you can intern" error={show("duration")}>
                        <select id={f("duration")} value={form.duration} onChange={(e) => set("duration", e.target.value)} className={selectClass} {...aria("duration")}>
                          <option value="">Choose</option>
                          {DURATIONS.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </Field>
                      <Field id={f("experience_level")} label="Your experience" error={show("experience_level")}>
                        <select id={f("experience_level")} value={form.experience_level} onChange={(e) => set("experience_level", e.target.value)} className={selectClass} {...aria("experience_level")}>
                          <option value="">Choose</option>
                          {EXPERIENCE.map((x) => (
                            <option key={x.value} value={x.value}>
                              {x.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field id={f("reason")} label="Why do you want this internship?" error={show("reason")} hint={`${form.reason.trim().length} / 30 characters minimum`}>
                      <textarea id={f("reason")} rows={4} value={form.reason} onChange={(e) => set("reason", e.target.value)} className={`${inputClass} resize-y py-3`} {...aria("reason")} />
                    </Field>
                    <Field id={f("expectations")} label="What do you hope to learn?" error={show("expectations")} hint={`${form.expectations.trim().length} / 20 characters minimum`}>
                      <textarea id={f("expectations")} rows={3} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} className={`${inputClass} resize-y py-3`} {...aria("expectations")} />
                    </Field>
                  </>
                )}

                {kind === "internship" && step === 2 && (
                  <>
                    <dl className="divide-y divide-[#EEF2FA] rounded-xl ring-1 ring-[#DCE5F5]">
                      {[
                        { label: "Name", value: form.full_name, step: 0 },
                        { label: "School", value: `${form.school}, level ${form.school_level}`, step: 0 },
                        { label: "Lives in", value: form.address, step: 0 },
                        { label: "Area", value: form.domain, step: 1 },
                        { label: "Duration", value: form.duration, step: 1 },
                        { label: "Experience", value: EXPERIENCE.find((x) => x.value === form.experience_level)?.label ?? "", step: 1 },
                      ].map((r) => (
                        <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                          <dt className="w-24 shrink-0 text-[#7B869C]">{r.label}</dt>
                          <dd className="min-w-0 flex-1 text-[#0B1B3F]">{r.value}</dd>
                          <button type="button" onClick={() => setStep(r.step)} className="shrink-0 font-semibold text-[#155DFC] hover:underline">
                            Edit
                          </button>
                        </div>
                      ))}
                    </dl>
                    <Field id={f("comments")} label="Anything else the company should know? (optional)">
                      <textarea id={f("comments")} rows={3} value={form.comments} onChange={(e) => set("comments", e.target.value)} className={`${inputClass} resize-y py-3`} />
                    </Field>
                  </>
                )}

                {kind === "program" && (
                  <>
                    <Field id={f("level")} label="Your level in this subject" error={show("level")}>
                      <select id={f("level")} value={form.level} onChange={(e) => set("level", e.target.value)} className={selectClass} {...aria("level")}>
                        <option value="">Choose</option>
                        {["Beginner", "Intermediate", "Advanced"].map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id={f("expectations")} label="What do you hope to get from this program?" error={show("expectations")} hint={`${form.expectations.trim().length} / 20 characters minimum`}>
                      <textarea id={f("expectations")} rows={4} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} className={`${inputClass} resize-y py-3`} {...aria("expectations")} />
                    </Field>
                    <Field id={f("comments")} label="Questions for the organisers (optional)">
                      <textarea id={f("comments")} rows={3} value={form.comments} onChange={(e) => set("comments", e.target.value)} className={`${inputClass} resize-y py-3`} />
                    </Field>
                  </>
                )}

                {kind === "event" && (
                  <>
                    <p className="text-base text-[#4A5670]">Your name and email come from your Zigex profile.</p>
                    <Field id={f("expectations")} label="What do you hope to get from it? (optional)">
                      <textarea id={f("expectations")} rows={3} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} className={`${inputClass} resize-y py-3`} />
                    </Field>
                    <Field id={f("comments")} label="Questions or needs, like access or diet (optional)">
                      <textarea id={f("comments")} rows={2} value={form.comments} onChange={(e) => set("comments", e.target.value)} className={`${inputClass} resize-y py-3`} />
                    </Field>
                  </>
                )}

                {/* Confirmation (and the fee, said plainly) before the final step */}
                {((kind === "internship" && step === 2) || kind === "program") && (
                  <div>
                    {hasFee && (
                      <p className="mb-3 rounded-xl bg-[#FFF7E6] px-4 py-3 text-sm text-[#7A2E0E]">
                        This {kind} has {fee}. The company explains how and when to pay if you&apos;re accepted.
                      </p>
                    )}
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-[#DCE5F5] has-[:checked]:bg-[#F5F8FF] has-[:checked]:ring-[#155DFC]/40">
                      <input
                        type="checkbox"
                        checked={form.confirm}
                        onChange={(e) => set("confirm", e.target.checked)}
                        onBlur={() => touch("confirm")}
                        aria-describedby={`${f("confirm")}-msg`}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#155DFC]"
                      />
                      <span className="text-sm leading-relaxed text-[#0B1B3F]">
                        My details are accurate{hasFee ? ", and I understand there is a fee" : ""}
                        {kind === "program" ? ". I'll follow the program's rules." : "."}
                      </span>
                    </label>
                    {show("confirm") && (
                      <p id={`${f("confirm")}-msg`} className="mt-1.5 text-sm text-[#B42318]">
                        {show("confirm")}
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

              {/* Footer actions stay visible while the form scrolls */}
              <div className="flex items-center justify-between gap-3 border-t border-[#EEF2FA] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} disabled={busy} className="h-12 rounded-xl px-4 text-base font-semibold text-[#4A5670] hover:bg-[#F3F7FF]">
                    Back
                  </button>
                ) : (
                  <Dialog.Close className="h-12 rounded-xl px-4 text-base font-semibold text-[#4A5670] hover:bg-[#F3F7FF]">Cancel</Dialog.Close>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#155DFC] px-6 text-base font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                  {step < steps.length - 1 ? "Continue" : kind === "event" ? "Reserve my spot" : "Send application"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
