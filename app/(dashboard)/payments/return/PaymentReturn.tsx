"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { getPaymentStatus, type Payment } from "@/lib/actions/payments.actions";

/** The backend re-checks with Fapshi at most every 15 s, so polling faster gains nothing. */
const POLL_MS = 5_000;
const GIVE_UP_AFTER_MS = 3 * 60_000;

export function PaymentReturn({ paymentId }: { paymentId: string | null }) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(Boolean(paymentId));
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!paymentId) return;
    let stopped = false;
    const started = Date.now();

    const check = async () => {
      const result = await getPaymentStatus(paymentId);
      if (stopped) return;
      setPayment(result);
      setLoading(false);
      if (result?.status === "pending") {
        if (Date.now() - started > GIVE_UP_AFTER_MS) setTimedOut(true);
        else setTimeout(check, POLL_MS);
      }
    };
    check();
    return () => {
      stopped = true;
    };
  }, [paymentId]);

  const isPro = payment?.purpose === "pro_subscription";
  const next = isPro ? { href: "/feed?view=for-you", label: "See all your picks" } : { href: "/student/workspace", label: "Go to my workspace" };

  let icon = <Loader2 className="h-10 w-10 animate-spin text-[#155DFC]" aria-hidden="true" />;
  let title = "Checking your payment…";
  let text = "This takes a few seconds.";

  if (!paymentId || (!loading && !payment)) {
    icon = <XCircle className="h-10 w-10 text-[#B42318]" aria-hidden="true" />;
    title = "We couldn't find this payment";
    text = "If money left your account, email us with the time and amount and we'll sort it out.";
  } else if (payment?.status === "completed") {
    icon = <CheckCircle2 className="h-10 w-10 text-[#067647]" aria-hidden="true" />;
    title = isPro ? "You're on Zigex Pro" : "Payment received";
    text = `We received ${payment.amount_xaf.toLocaleString("en-US")} XAF${payment.reference ? ` (${payment.reference})` : ""}.`;
  } else if (payment?.status === "failed" || payment?.status === "expired") {
    icon = <XCircle className="h-10 w-10 text-[#B42318]" aria-hidden="true" />;
    title = payment.status === "expired" ? "This payment link expired" : "The payment didn't go through";
    text = "Nothing was taken. You can try again.";
  } else if (timedOut) {
    icon = <Clock className="h-10 w-10 text-[#B54708]" aria-hidden="true" />;
    title = "Still waiting for your operator";
    text = "If you confirmed on your phone, it can take a few minutes. We'll notify you when it arrives.";
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      {icon}
      <h1 className="mt-4 font-heading text-2xl font-bold text-[#0B1B3F]">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]" aria-live="polite">
        {text}
      </p>
      {payment?.status === "completed" && (
        <Link href={next.href} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white hover:bg-[#0B48D9]">
          {next.label}
        </Link>
      )}
      {(payment?.status === "failed" || payment?.status === "expired") && payment.checkout_url === null && (
        <Link href={isPro ? "/feed?view=for-you" : "/student/workspace"} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE5F5] px-5 text-sm font-semibold text-[#0B1B3F] hover:border-[#155DFC]">
          Back
        </Link>
      )}
    </main>
  );
}
