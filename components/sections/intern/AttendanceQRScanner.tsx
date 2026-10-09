"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraOff, Loader2 } from "lucide-react";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { scanAttendanceQR } from "@/lib/actions/attendance.actions";
import { CheckInResult, currentPosition, toOutcome, tokenFromScan, type CheckInOutcome } from "@/components/workspace/CheckInResult";

type Phase =
  | { name: "camera" }
  | { name: "blocked"; reason: "denied" | "missing" | "other" }
  | { name: "checking"; step: "location" | "saving" }
  | { name: "done"; outcome: CheckInOutcome };

const READER_ID = "zx-checkin-reader";

const button =
  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2";

/**
 * Check in by scanning the workplace QR code. The camera opens straight away
 * (the student just tapped "Scan QR code"); every way it can go wrong says
 * what to do next.
 */
export function AttendanceQRScanner({ mode = "check-in", startsOn }: { mode?: "check-in" | "test"; startsOn?: Date | null } = {}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: "camera" });
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);

  const onCode = useCallback(
    async (text: string) => {
      if (busy.current) return;
      busy.current = true;
      if (mode === "test") {
        setPhase({ name: "done", outcome: { kind: "camera-ok", startsOn } });
        return;
      }
      setPhase({ name: "checking", step: "location" });
      const { lat, lng } = await currentPosition();
      setPhase({ name: "checking", step: "saving" });
      const res = await scanAttendanceQR(tokenFromScan(text), lat, lng).catch(() => ({ success: false, error: undefined }));
      const outcome = toOutcome(res);
      setPhase({ name: "done", outcome });
      if (outcome.kind === "checked-in" || outcome.kind === "already") router.refresh();
    },
    [router, mode, startsOn]
  );

  const onBlocked = useCallback((reason: "denied" | "missing" | "other") => setPhase({ name: "blocked", reason }), []);

  const retry = () => {
    busy.current = false;
    setPhase({ name: "camera" });
    setAttempt((n) => n + 1);
  };

  return (
    <div className="bg-white">
      <div className="px-6 pb-4 pt-6 pr-14">
        <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-[#0B1B3F]">{mode === "test" ? "Test your camera" : "Check in"}</DialogTitle>
        <DialogDescription className="mt-1 text-[15px] text-[#4A5670]">
          {mode === "test"
            ? "Point it at any QR code, like one on a product or poster. Nothing is recorded."
            : "Point your camera at the Zigex QR code at your workplace."}
        </DialogDescription>
      </div>

      <div className="px-6 pb-6">
        {phase.name === "camera" && <Camera key={attempt} onCode={onCode} onBlocked={onBlocked} />}

        {phase.name === "blocked" && (
          <div role="alert" className="rounded-2xl bg-[#F8FAFF] px-5 py-8 text-center ring-1 ring-[#DCE5F5]">
            <CameraOff className="mx-auto h-8 w-8 text-[#4A5670]" aria-hidden="true" />
            <h3 className="mt-3 font-heading text-lg font-semibold text-[#0B1B3F]">
              {phase.reason === "denied" ? "Camera access is off" : phase.reason === "missing" ? "No camera found" : "The camera didn't start"}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#4A5670]">
              {phase.reason === "denied"
                ? "Allow the camera for this site (tap the icon next to the address), then try again. Or scan the poster with your phone's camera app."
                : phase.reason === "missing"
                  ? "Use a phone, or scan the poster with your phone's camera app."
                  : "Close other apps using the camera, then try again."}
            </p>
            <button type="button" onClick={retry} className={`${button} mt-5 bg-[#155DFC] text-white hover:bg-[#0F3FB8]`}>
              Try again
            </button>
          </div>
        )}

        {phase.name === "checking" && (
          <div role="status" className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-[#F8FAFF] text-center ring-1 ring-[#DCE5F5]">
            <Loader2 className="h-8 w-8 animate-spin text-[#155DFC] motion-reduce:animate-none" aria-hidden="true" />
            <p className="mt-4 font-medium text-[#0B1B3F]">{phase.step === "location" ? "Confirming you're at work…" : "Checking you in…"}</p>
            {phase.step === "location" && <p className="mt-1 text-sm text-[#4A5670]">If your browser asks, allow location.</p>}
          </div>
        )}

        {phase.name === "done" && (
          <div className="py-4">
            <CheckInResult
              outcome={phase.outcome}
              action={
                phase.outcome.kind === "checked-in" || phase.outcome.kind === "already" || phase.outcome.kind === "camera-ok" ? (
                  <DialogClose className={`${button} bg-[#155DFC] text-white hover:bg-[#0F3FB8]`}>Done</DialogClose>
                ) : (
                  <>
                    <button type="button" onClick={retry} className={`${button} bg-[#155DFC] text-white hover:bg-[#0F3FB8]`}>
                      Scan again
                    </button>
                    <DialogClose className={`${button} bg-white text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF]`}>Close</DialogClose>
                  </>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** The live camera with a square viewfinder; stops the camera when it unmounts. */
function Camera({ onCode, onBlocked }: { onCode: (text: string) => void; onBlocked: (reason: "denied" | "missing" | "other") => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let scanner: any;
    let cancelled = false;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      scanner = new Html5Qrcode(READER_ID, { verbose: false } as any);
      scanner
        .start({ facingMode: "environment" }, { fps: 10, qrbox: (w: number, h: number) => ({ width: Math.floor(Math.min(w, h) * 0.7), height: Math.floor(Math.min(w, h) * 0.7) }), aspectRatio: 1 }, (text: string) => onCode(text), () => {})
        .then(() => !cancelled && setReady(true))
        .catch((err: unknown) => {
          const name = (err as { name?: string })?.name ?? String(err);
          onBlocked(/NotAllowed|Permission/i.test(name) ? "denied" : /NotFound|Overconstrained|no camera/i.test(name) ? "missing" : "other");
        });
    });
    return () => {
      cancelled = true;
      if (scanner?.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {});
      else
        try {
          scanner?.clear();
        } catch {}
    };
  }, [onCode, onBlocked]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#0B1B3F]">
      <div id={READER_ID} className="h-full w-full [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover [&_#qr-shaded-region]:!border-[rgba(11,27,63,0.55)]" />
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <Loader2 className="h-7 w-7 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <p className="mt-3 text-sm">Starting the camera…</p>
          <p className="mt-1 text-xs text-[#AFC0E3]">Allow the camera if your browser asks.</p>
        </div>
      )}
      {/* Viewfinder corners */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-[15%]">
        {["left-0 top-0 border-l-4 border-t-4 rounded-tl-xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl"].map((c) => (
          <span key={c} className={`absolute h-10 w-10 border-white ${c}`} />
        ))}
      </div>
      {ready && <p className="absolute inset-x-0 bottom-4 text-center text-sm font-medium text-white drop-shadow">Hold steady. It scans by itself.</p>}
    </div>
  );
}
