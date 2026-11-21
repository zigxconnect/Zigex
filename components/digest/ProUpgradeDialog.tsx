"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Loader2, LockKeyhole, Mail, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getPaymentStatus, getProOptions, startProCheckout, type ProOptions } from "@/lib/actions/payments.actions";

const SUPPORT_EMAIL = "zigexconnect.com@gmail.com";
const PRICE_LABEL = "3,000 XAF";
/** The API re-checks with Fapshi at most every 15 s, so polling faster gains nothing. */
const POLL_MS = 5_000;
/** MTN prompts expire after a few minutes; stop waiting after this and say so. */
const WAIT_FOR_MS = 4 * 60_000;
/** MTN Mobile Money numbers: 67X, 650-654, 680-683 (237 and spaces allowed). */
const MTN_NUMBER = /^(67\d|65[0-4]|68[0-3])\d{6}$/;
const digits = (value: string) => value.replace(/\D/g, "").replace(/^237(?=\d{9}$)/, "");

const BENEFITS = [
  "New picks every day instead of once a week",
  "All your matches, not just the first three",
  "Matched to your skills, course and location",
];

type Step = "form" | "sending" | "confirm" | "paid" | "failed" | "slow";

/**
 * Zigex Pro: what it costs and how to get it. When the API has payments on, the
 * student pays with MTN Mobile Money (a prompt on their phone, through Fapshi);
 * otherwise the button opens an email to us, as before.
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
  const router = useRouter();
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

  const [options, setOptions] = useState<ProOptions | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const waitingSince = useRef(0);

  // Whether online payment is on is decided by the API, so it can be switched without a rebuild
  useEffect(() => {
    if (!isOpen || options) return;
    getProOptions().then(setOptions);
  }, [isOpen, options]);

  // Waiting for the student to confirm the MTN prompt
  useEffect(() => {
    if (step !== "confirm" || !paymentId) return;
    let stopped = false;
    const check = async () => {
      const payment = await getPaymentStatus(paymentId);
      if (stopped) return;
      if (payment?.status === "completed") {
        setStep("paid");
        router.refresh();
      } else if (payment?.status === "failed" || payment?.status === "expired") {
        setStep("failed");
      } else if (Date.now() - waitingSince.current > WAIT_FOR_MS) {
        setStep("slow");
      } else {
        setTimeout(check, POLL_MS);
      }
    };
    const first = setTimeout(check, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(first);
    };
  }, [step, paymentId, router]);

  const canPayOnline = Boolean(options?.payments_enabled) && !options?.is_pro;

  const pay = async (event: React.FormEvent) => {
    event.preventDefault();
    const number = digits(phone);
    if (!MTN_NUMBER.test(number)) {
      setError("Enter an MTN Mobile Money number, e.g. 670000000.");
      return;
    }
    setError(null);
    setStep("sending");
    const result = await startProCheckout(number);
    if (!result.ok) {
      if (result.unavailable) setOptions((o) => (o ? { ...o, payments_enabled: false } : o));
      setError(result.error);
      setStep("form");
      return;
    }
    // Fapshi couldn't send a prompt: its checkout page instead
    if (result.payment.checkout_url) {
      window.location.assign(result.payment.checkout_url);
      return;
    }
    setPaymentId(result.payment.id);
    waitingSince.current = Date.now();
    setStep("confirm");
  };

  const restart = () => {
    setStep("form");
    setPaymentId(null);
    setError(null);
  };

  const primaryButton =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B48D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-70";
  const quietButton =
    "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#4A5670] transition-colors hover:bg-[#F3F7FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]";

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
          {step === "paid" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#067647]" aria-hidden="true" />
              <DialogTitle className="mt-3 font-heading text-xl font-bold text-[#0B1B3F]">You&apos;re on Zigex Pro</DialogTitle>
              <DialogDescription className="mt-1.5 text-[15px] text-[#4A5670]">All your matches are open now. We sent you a receipt in your notifications.</DialogDescription>
              <button type="button" onClick={() => setOpen(false)} className={`${primaryButton} mt-5`}>
                See all my picks
              </button>
            </div>
          ) : (
            <>
              <DialogTitle className="pr-8 font-heading text-xl font-bold leading-snug text-[#0B1B3F]">
                {more ? `See your ${more} other ${more === 1 ? "match" : "matches"} with Zigex Pro` : "Get more matches with Zigex Pro"}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-[15px] leading-relaxed text-[#4A5670]">
                Free accounts see three recommendations a week. Pro shows you everything we find for you.
              </DialogDescription>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="font-heading text-2xl font-bold text-[#0B1B3F]">{PRICE_LABEL}</span>
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

              {!canPayOnline ? (
                <>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setOpen(false)} className={quietButton}>
                      Not now
                    </button>
                    <a href={mailto} className={primaryButton}>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Email us to subscribe
                    </a>
                  </div>
                  {error && (
                    <p role="alert" className="mt-3 text-center text-[13px] text-[#B42318] sm:text-right">
                      {error}
                    </p>
                  )}
                  <p className="mt-3 text-center text-[13px] text-[#7B869C] sm:text-right">We&apos;ll reply with how to pay.</p>
                </>
              ) : step === "confirm" || step === "slow" || step === "failed" ? (
                <div className="mt-6 rounded-xl border border-[#DCE5F5] bg-[#F8FAFF] p-4" aria-live="polite">
                  {step === "confirm" && (
                    <>
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-[#0B1B3F]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#155DFC]" aria-hidden="true" />
                        Confirm on your phone
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#4A5670]">
                        MTN sent a request for {PRICE_LABEL} to {digits(phone)}. Enter your Mobile Money PIN to approve it. If nothing shows, dial <strong>*126#</strong> and check your pending approvals.
                      </p>
                    </>
                  )}
                  {step === "slow" && (
                    <>
                      <p className="text-[15px] font-semibold text-[#0B1B3F]">Still waiting for MTN</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#4A5670]">
                        If you approved it, Pro turns on as soon as MTN confirms, and we&apos;ll notify you. If not, try again.
                      </p>
                    </>
                  )}
                  {step === "failed" && (
                    <>
                      <p className="text-[15px] font-semibold text-[#B42318]">The payment didn&apos;t go through</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#4A5670]">Nothing was taken. Check your balance and PIN, then try again.</p>
                    </>
                  )}
                  {step !== "confirm" && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => setOpen(false)} className={quietButton}>
                        Close
                      </button>
                      <button type="button" onClick={restart} className={primaryButton}>
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={pay} className="mt-6" noValidate>
                  <label htmlFor="pro-momo-number" className="text-sm font-semibold text-[#0B1B3F]">
                    Your MTN Mobile Money number
                  </label>
                  <div className="mt-1.5 flex h-11 items-center rounded-xl border border-[#DCE5F5] bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/20">
                    <span className="pl-3 text-sm text-[#7B869C]">+237</span>
                    <input
                      id="pro-momo-number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="6 70 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "pro-momo-error" : "pro-momo-help"}
                      className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-2 text-[15px] text-[#0B1B3F] outline-none"
                    />
                  </div>
                  {error ? (
                    <p id="pro-momo-error" role="alert" className="mt-1.5 text-[13px] text-[#B42318]">
                      {error}
                    </p>
                  ) : (
                    <p id="pro-momo-help" className="mt-1.5 text-[13px] text-[#7B869C]">
                      MTN only for now. You&apos;ll approve the payment on your phone.
                    </p>
                  )}
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setOpen(false)} className={quietButton}>
                      Not now
                    </button>
                    <button type="submit" disabled={step === "sending"} className={primaryButton}>
                      {step === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Smartphone className="h-4 w-4" aria-hidden="true" />}
                      {step === "sending" ? "Sending to your phone…" : `Pay ${PRICE_LABEL} with MTN MoMo`}
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[13px] text-[#7B869C] sm:text-right">
                    Secure payment by Fapshi.{" "}
                    <a href={mailto} className="font-semibold text-[#155DFC] hover:underline">
                      Prefer email?
                    </a>
                  </p>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
