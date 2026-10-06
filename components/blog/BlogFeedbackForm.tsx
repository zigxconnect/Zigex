"use client";

import { useId, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";

type FeedbackType = "comment" | "suggestion" | "question" | "issue";

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: "comment", label: "Comment" },
  { value: "suggestion", label: "Suggestion" },
  { value: "question", label: "Question" },
  { value: "issue", label: "Report a problem" },
];

const input =
  "w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-base text-[#0B1B3F] placeholder:text-[#7B869C] transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15";

/**
 * Feedback on an article, emailed to the Zigex team (/api/blog/feedback).
 * Folded by default; signed-in students don't retype their name and email.
 */
export default function BlogFeedbackForm({
  postTitle,
  postSlug,
  defaultName = "",
  defaultEmail = "",
}: {
  postTitle: string;
  postSlug: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("comment");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const knownSender = Boolean(defaultName && defaultEmail);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setStatus("error");
      setError("Write at least 10 characters so the team understands your feedback.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/blog/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postTitle, postSlug, senderName: name, senderEmail: email, message, feedbackType: type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The feedback couldn't be sent.");
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "The feedback couldn't be sent. Check your connection and try again.");
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${uid}-form`}
        className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <span>
          <span className="block font-heading text-base font-semibold text-[#0B1B3F]">Feedback on this article</span>
          <span className="mt-0.5 block text-sm text-[#4A5670]">Questions, suggestions or a mistake to fix. It goes straight to the Zigex team.</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#4A5670] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div id={`${uid}-form`} className="border-t border-[#EEF2FA] p-5">
          {status === "sent" ? (
            <div role="status" className="flex items-start gap-3 rounded-xl bg-[#ECFDF3] p-4 text-sm text-[#067647]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Feedback sent</p>
                <p className="mt-0.5">Thanks. If it needs a reply, the team will write to {email}.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-[#0B1B3F]">What kind of feedback?</legend>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={`inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#155DFC] ${
                        type === t.value ? "bg-[#0B1B3F] text-white" : "bg-white text-[#4A5670] ring-1 ring-[#DCE5F5] hover:text-[#0B1B3F]"
                      }`}
                    >
                      <input type="radio" name={`${uid}-type`} value={t.value} checked={type === t.value} onChange={() => setType(t.value)} className="sr-only" />
                      {t.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {knownSender ? (
                <p className="text-sm text-[#4A5670]">
                  Sending as <span className="font-semibold text-[#0B1B3F]">{name}</span> ({email})
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                      Your name
                    </label>
                    <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className={`${input} h-12`} />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                      Your email
                    </label>
                    <input id={`${uid}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required className={`${input} h-12`} />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor={`${uid}-msg`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                  Message
                </label>
                <textarea
                  id={`${uid}-msg`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  required
                  className={`${input} resize-y py-3`}
                />
                <p className="mt-1 text-right text-xs text-[#7B869C]">{message.length} / 2000</p>
              </div>

              {status === "error" && (
                <p role="alert" className="rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !name || !email || !message.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {status === "sending" ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
