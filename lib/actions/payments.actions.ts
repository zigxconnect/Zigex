"use server";

import { serverApi } from "@/lib/api/server-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";

/**
 * Online payment through the student API (POST /payments/checkout), which talks
 * to Fapshi (MTN Mobile Money, Orange Money). The Fapshi key stays on the backend.
 */

export type PaymentStatus = "pending" | "completed" | "failed" | "expired";

export type Payment = {
  id: string;
  status: PaymentStatus;
  purpose: "pro_subscription" | "application_fee";
  amount_xaf: number;
  reference: string | null;
  checkout_url: string | null;
  paid_at: string | null;
};

/** `unavailable`: payments are switched off on the backend (or not deployed); fall back to email. */
export type CheckoutResult =
  | { ok: true; payment: Payment }
  | { ok: false; unavailable?: boolean; error: string };

/** The flat error code the backend sends for payments, e.g. { error: "payments_unavailable" }. */
const errorCode = (err: unknown) => {
  if (!(err instanceof ApiClientError)) return undefined;
  const body = err.body as { error?: unknown } | undefined;
  return typeof body?.error === "string" ? body.error : err.code;
};

const MESSAGES: Record<string, string> = {
  already_paid: "This is already paid.",
  nothing_to_pay: "There's nothing to pay.",
  not_accepted: "You can pay once your application is accepted.",
  payment_provider_error: "The payment service didn't answer. Try again in a few minutes.",
};

async function checkout(body: Record<string, unknown>): Promise<CheckoutResult> {
  try {
    const res = await serverApi.post<Payment>("/payments/checkout", body);
    return { ok: true, payment: res.data };
  } catch (err) {
    const code = errorCode(err);
    if (isEndpointMissing(err) || code === "payments_unavailable") {
      return { ok: false, unavailable: true, error: "Online payment isn't available yet." };
    }
    if (!code || !MESSAGES[code]) console.error("[PAYMENTS] Checkout failed", err);
    return { ok: false, error: (code && MESSAGES[code]) || "We couldn't start the payment. Try again." };
  }
}

/** Zigex Pro for one month: returns a Fapshi checkout link to send the student to. */
export async function startProCheckout(): Promise<CheckoutResult> {
  return checkout({ purpose: "pro_subscription", method: "link" });
}

/** The fee of an accepted program, or one month of an internship with a fee. */
export async function startApplicationFeeCheckout(applicationId: string): Promise<CheckoutResult> {
  return checkout({ purpose: "application_fee", applicationId, method: "link" });
}

/** Re-checked with Fapshi by the backend while it's pending. */
export async function getPaymentStatus(paymentId: string): Promise<Payment | null> {
  try {
    const res = await serverApi.get<Payment>(`/payments/${encodeURIComponent(paymentId)}`);
    return res.data;
  } catch (err) {
    if (!isEndpointMissing(err)) console.error("[PAYMENTS] Status failed", err);
    return null;
  }
}
