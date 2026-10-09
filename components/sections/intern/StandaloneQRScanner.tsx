"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { scanAttendanceQR } from "@/lib/actions/attendance.actions";
import { CheckInResult, currentPosition, toOutcome, type CheckInOutcome } from "@/components/workspace/CheckInResult";

/**
 * Opened when a phone's own camera app scans the workplace poster
 * (/attendance/scan?token=…): checks in straight away and says what happened.
 */
export function StandaloneQRScanner({ token }: { token: string }) {
  const [step, setStep] = useState<"location" | "saving">("location");
  const [outcome, setOutcome] = useState<CheckInOutcome | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { lat, lng } = await currentPosition();
      if (cancelled) return;
      setStep("saving");
      const res = await scanAttendanceQR(token, lat, lng).catch(() => ({ success: false, error: undefined }));
      if (!cancelled) setOutcome(toOutcome(res));
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!outcome) {
    return (
      <div role="status" className="py-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#155DFC] motion-reduce:animate-none" aria-hidden="true" />
        <p className="mt-4 font-heading text-lg font-semibold text-[#0B1B3F]">{step === "location" ? "Confirming you're at work…" : "Checking you in…"}</p>
        {step === "location" && <p className="mt-1 text-sm text-[#4A5670]">If your browser asks, allow location.</p>}
      </div>
    );
  }

  return (
    <CheckInResult
      outcome={outcome}
      action={
        <Link
          href="/student/workspace"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]"
        >
          Open my workspace
        </Link>
      }
    />
  );
}
