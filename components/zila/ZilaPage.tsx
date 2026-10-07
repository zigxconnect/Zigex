"use client";

import { useEffect, useState } from "react";
import { Bot, Check, ClipboardCheck, Compass, Loader2, Lock, Route, Wrench } from "lucide-react";

const NOTIFIED_KEY = "zigex_zila_notify";

const HELPS = [
  { icon: Compass, title: "Find opportunities that fit you", text: "Zila reads your skills, school and interests and points you to the internships, programs and events worth applying to." },
  { icon: ClipboardCheck, title: "Make your applications stronger", text: "Paste your answer to “Why are you a good fit?” and get specific suggestions before you send it." },
  { icon: Route, title: "Plan what to learn next", text: "Ask what a role needs and get a short, realistic learning plan built around what you already know." },
  { icon: Wrench, title: "Get unstuck in your workspace", text: "Once you're accepted, ask about your tasks, logbook or project and get help in plain words." },
];

const QUESTIONS = [
  "Which open internships match my skills?",
  "Can you improve my answer for the SEED internship?",
  "What should I learn to become a backend developer?",
  "How do I write a good logbook entry?",
  "Is my profile ready for companies to read?",
];

/**
 * Zila AI, honestly: it's in development, here is what it will do, and one
 * tap to be told when it opens (the account email is used, nothing to type).
 */
export function ZilaPage({ email, firstName }: { email: string; firstName: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    try {
      if (localStorage.getItem(NOTIFIED_KEY) === email) setState("done");
    } catch {
      // Storage blocked: the button still works.
    }
  }, [email]);

  const notify = async () => {
    setState("sending");
    try {
      const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const template = process.env.NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID;
      const key = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (!service || !template || !key) throw new Error("not configured");
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service,
          template_id: template,
          user_id: key,
          template_params: { to_email: email, user_email: email, feature_name: "Zila AI", year: new Date().getFullYear() },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        localStorage.setItem(NOTIFIED_KEY, email);
      } catch {
        // ignore
      }
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* Status first: what Zila is, that it isn't open, and the one thing to do */}
      <header className="rounded-2xl bg-[#0B1B3F] p-6 text-white sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="rounded-full bg-[#F79009]/15 px-3 py-1 text-sm font-medium text-[#FEC84B] ring-1 ring-[#F79009]/30">In development</span>
        </div>
        <h1 className="mt-5 font-heading text-[32px] font-bold leading-tight tracking-tight">Zila AI</h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-white/80">
          An assistant that knows Zigex and your profile, so its help is about your applications and your work, not generic
          advice. It isn&apos;t open to students yet.
        </p>

        <div className="mt-6">
          {state === "done" ? (
            <p className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/15" role="status">
              <Check className="h-4 w-4 text-[#75E0A7]" aria-hidden="true" />
              You&apos;re on the list{firstName ? `, ${firstName}` : ""}. We&apos;ll email {email} when Zila opens.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={notify}
                disabled={state === "sending"}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-[#0B1B3F] hover:bg-[#EEF3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1B3F] disabled:opacity-70"
              >
                {state === "sending" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                Notify me when it&apos;s ready
              </button>
              <span className="text-sm text-white/70">We&apos;ll use {email}.</span>
            </div>
          )}
          {state === "error" && (
            <p className="mt-3 text-sm text-[#FECDCA]" role="alert">
              That didn&apos;t go through. Try again in a moment.
            </p>
          )}
        </div>
      </header>

      <section aria-labelledby="helps-title" className="mt-10">
        <h2 id="helps-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
          What Zila will help with
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {HELPS.map((h) => (
            <li key={h.title} className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]">
              <h.icon className="h-5 w-5 text-[#155DFC]" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-base font-semibold text-[#0B1B3F]">{h.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4A5670]">{h.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="questions-title" className="mt-10">
        <h2 id="questions-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
          Questions you&apos;ll be able to ask
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {QUESTIONS.map((q) => (
            <li key={q} className="rounded-full bg-white px-4 py-2 text-sm text-[#0B1B3F] ring-1 ring-[#DCE5F5]">
              {q}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="data-title" className="mt-10 flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#155DFC]" aria-hidden="true" />
        <div>
          <h2 id="data-title" className="font-heading text-base font-semibold text-[#0B1B3F]">
            How Zila will use your information
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#4A5670]">
            Zila will read your profile and your applications only to answer your questions. Your conversations won&apos;t be
            shared with companies, and you&apos;ll be able to delete them.
          </p>
        </div>
      </section>
    </div>
  );
}
