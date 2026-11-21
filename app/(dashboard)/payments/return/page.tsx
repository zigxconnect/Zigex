import type { Metadata } from "next";
import { PaymentReturn } from "./PaymentReturn";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

/** Fapshi sends the student here after checkout: /payments/return?payment=<id>. */
export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const { payment } = await searchParams;
  return <PaymentReturn paymentId={payment ?? null} />;
}
