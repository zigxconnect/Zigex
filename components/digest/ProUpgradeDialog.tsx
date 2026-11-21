"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, LockKeyhole, Mail, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { startProCheckout } from "@/lib/actions/payments.actions";

const SUPPORT_EMAIL = "zigexconnect.com@gmail.com";
/** Online payment (Fapshi: MTN Mobile Money, Orange Money). Off until the backend turns it on too. */
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

const BENEFITS = [
  "New picks every day instead of once a week",
  "All your matches, not just the first three",
  "Matched to your skills, course and location",
];

/**
 * Zigex Pro: what it costs and how to get it. Plain, in the site's own colours.
 * With NEXT_PUBLIC_PAYMENTS_ENABLED the button opens Fapshi's checkout (Mobile
 * Money / Orange Money); otherwise, or if that fails, it opens an email to us.
 */
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
  const body = encodeURIComponent("Hi Zigex, I would like to subscribe to Pro (3,000 XAF a month) for more recommended opportunities.");
  const more = lockedCount && lockedCount > 0 ? lockedCount : null;
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

  const [paying, startPaying] = useTransition();
  const [payError, setPayError] = useState<string | null>(null);
  const [payUnavailable, setPayUnavailable] = useState(false);
  const canPayOnline = PAYMENTS_ENABLED && !payUnavailable;

  const payOnline = () => {
    setPayError(null);
    startPaying(async () => {
      const result = await startProCheckout();
      if (result.ok && result.payment.checkout_url) {
        window.location.assign(result.payment.checkout_url);
        return;
      }
      if (!result.ok && result.unavailable) setPayUnavailable(true);
      setPayError(result.ok ? "We couldn't start the payment. Try again." : result.error);
    });
  };

  return (
    <>
      {/* Its own button only when nothing else opens the dialog (the feed uses "Load more recommendations"). */}
      {open === undefined && (
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
        <DialogContent className="w-[calc(100%-2rem)] gap-0 rounded-2xl border border-[#DCE5F5] bg-white p-6 sm:max-w-md">
          <DialogTitle className="pr-8 font-heading text-xl font-bold leading-snug text-[#0B1B3F]">
            {more ? `See your ${more} other ${more === 1 ? "match" : "matches"} with Zigex Pro` : "Get more matches with Zigex Pro"}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-[15px] leading-relaxed text-[#4A5670]">
            Free accounts see three recommendations a week. Pro shows you everything we find for you.
          </DialogDescription>

          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold text-[#0B1B3F]">3,000 XAF</span>
            <span className="text-sm text-[#4A5670]">a month</span>
          </p>

          <ul className="mt-4 space-y-2.5 border-t border-[#EEF2FA] pt-4 text-[15px] text-[#0B1B3F]">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155DFC]" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#4A5670] transition-colors hover:bg-[#F3F7FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              Not now
            </button>
            {canPayOnline ? (
              <button
                type="button"
                onClick={payOnline}
                disabled={paying}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Smartphone className="h-4 w-4" aria-hidden="true" />}
                {paying ? "Opening payment…" : "Pay 3,000 XAF"}
              </button>
            ) : (
              <a
                href={mailto}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email us to subscribe
              </a>
            )}
          </div>
          {payError && (
            <p role="alert" className="mt-3 text-center text-[13px] text-[#B42318] sm:text-right">
              {payError}
            </p>
          )}
          <p className="mt-3 text-center text-[13px] text-[#7B869C] sm:text-right">
            {canPayOnline ? (
              <>
                MTN Mobile Money or Orange Money, through Fapshi.{" "}
                <a href={mailto} className="font-semibold text-[#155DFC] hover:underline">
                  Or email us
                </a>
              </>
            ) : (
              <>We&apos;ll reply with how to pay.</>
            )}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
