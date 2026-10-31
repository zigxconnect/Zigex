"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Crown, LockKeyhole, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const SUPPORT_EMAIL = "zigexconnect.com@gmail.com";

export function ProUpgradeDialog({
  lockedCount,
  open,
  onOpenChange,
  triggerLabel,
}: {
  lockedCount?: number;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  triggerLabel?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  const subject = encodeURIComponent("Zigex Pro subscription");
  const body = encodeURIComponent("Hi Zigex, I would like to subscribe to Pro for more AI-recommended opportunities.");

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
        >
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          {triggerLabel ?? `See ${lockedCount ?? 0} more`}
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_30px_80px_-18px_rgba(11,27,63,0.45)] sm:max-w-xl">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(74,132,255,0.9),_rgba(21,93,252,0.98)_35%,_rgba(11,27,63,1)_100%)] px-6 pb-6 pt-7 text-white sm:px-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D9E7FF] ring-1 ring-white/20">
                <Crown className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D9E7FF] ring-1 ring-white/10">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Pro access
              </span>
            </div>
            <DialogTitle className="font-heading text-3xl font-bold leading-tight">Daily recommendations that fit your future</DialogTitle>
            <DialogDescription className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
              Unlock a fresh stream of AI-picked opportunities every day, tailored to your profile, interests, and career goals.
            </DialogDescription>
          </div>

          <div className="bg-[#F8FAFF] px-6 py-6 sm:px-8">
            <div className="rounded-2xl border border-[#DCE5F5] bg-white p-4 shadow-[0_12px_24px_-16px_rgba(11,27,63,0.35)]">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#155DFC]">Monthly plan</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-[#0B1B3F]">3,000 XAF</p>
                </div>
                <span className="rounded-full bg-[#EAF0FF] px-2.5 py-1 text-xs font-semibold text-[#155DFC]">1 month</span>
              </div>
              <p className="mt-2 text-sm text-[#4A5670]">Perfect for students who want daily career matches that can change their trajectory.</p>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-[#344054]">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
                <span>Fresh personalized opportunities every day</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
                <span>Profile-based suggestions for your skills, industry, and location</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
                <span>Actionable recommendations for internships, programs, and openings</span>
              </li>
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
              >
                Pay 3,000 XAF now
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE5F5] bg-white px-4 text-sm font-semibold text-[#0B1B3F] transition-colors hover:border-[#155DFC] hover:text-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}