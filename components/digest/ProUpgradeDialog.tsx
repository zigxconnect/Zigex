"use client";

import { useState } from "react";
import { ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const SUPPORT_EMAIL = "zigexconnect.com@gmail.com";

export function ProUpgradeDialog({ lockedCount }: { lockedCount: number }) {
  const [open, setOpen] = useState(false);
  const subject = encodeURIComponent("Zigex Pro subscription");
  const body = encodeURIComponent("Hi Zigex, I would like to subscribe to Pro for more AI-recommended opportunities.");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
      >
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        See {lockedCount} more
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_24px_64px_-16px_rgba(11,27,63,0.35)] sm:max-w-md">
          <div className="bg-[#0B1B3F] px-6 pb-6 pt-7 text-white">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#9DB8F5]">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle className="font-heading text-2xl font-bold leading-tight">More opportunities, picked for you</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-white/75">
              Zigex Pro unlocks the rest of this week&apos;s AI recommendations, matched to your profile.
            </DialogDescription>
          </div>

          <div className="px-6 py-5">
            <ul className="space-y-3 text-sm text-[#344054]">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
                <span>See {lockedCount} more opportunities found for your interests</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
                <span>Get the reason each opportunity fits your profile</span>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#667085]">
              Contact Zigex to arrange a subscription. Payment and plan pricing are confirmed directly with the team.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
            >
              Contact Zigex to subscribe
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}