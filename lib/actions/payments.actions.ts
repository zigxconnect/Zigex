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
  invalid_fields: "Enter an MTN Mobile Money number, e.g. 670000000.",
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

export type ProOptions = {
  is_pro: boolean;
  pro_until: string | null;
  price_xaf: number;
  /** false while the backend has payments switched off: offer email instead */
  payments_enabled: boolean;
};

/** Pro status and whether online payment is on (GET /payments/subscription). */
export async function getProOptions(): Promise<ProOptions | null> {
  try {
    const res = await serverApi.get<ProOptions>("/payments/subscription");
    return res.data;
  } catch (err) {
    if (!isEndpointMissing(err)) console.error("[PAYMENTS] Pro status failed", err);
    return null;
  }
}

/**
 * Zigex Pro for one month, paid with MTN Mobile Money: the student confirms a prompt
 * on `phone`. If Fapshi can't send prompts, the result carries a checkout_url instead.
 */
export async function startProCheckout(phone: string): Promise<CheckoutResult> {
  return checkout({ purpose: "pro_subscription", method: "phone", phone });
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
