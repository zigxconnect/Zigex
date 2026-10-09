import { AlertTriangle, CheckCircle2, Clock3, MapPinOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckInOutcome =
  | { kind: "checked-in"; at: Date }
  | { kind: "already" }
  | { kind: "not-accepted"; message?: string }
  | { kind: "error"; message?: string };

const isLocationProblem = (message?: string) => /locat|radius|distance|geofenc|far from/i.test(message ?? "");

/**
 * What happened after a check-in scan, in plain words, with the next step.
 * Used by the in-app scanner and the page opened from a phone's own camera.
 */
export function CheckInResult({ outcome, action }: { outcome: CheckInOutcome; action?: React.ReactNode }) {
  const view = (() => {
    switch (outcome.kind) {
      case "checked-in":
        return {
          icon: CheckCircle2,
          tone: "ok",
          title: `Checked in at ${outcome.at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
          body: "Have a good day. Before you leave, write your daily report in your workspace.",
        };
      case "already":
        return {
          icon: Clock3,
          tone: "info",
          title: "You're already checked in today",
          body: "Nothing else to do here. Your daily report is the next step.",
        };
      case "not-accepted":
        return {
          icon: ShieldAlert,
          tone: "warn",
          title: "This code is for another placement",
          body: outcome.message || "You can only check in to an internship you've been accepted for. Check with your supervisor that you scanned the right poster.",
        };
      default:
        return isLocationProblem(outcome.message)
          ? {
              icon: MapPinOff,
              tone: "warn",
              title: "Your location doesn't match the workplace",
              body: `${outcome.message ? `${outcome.message}. ` : ""}Allow location for this site in your browser, make sure you're at the office, then scan again.`,
            }
          : {
              icon: AlertTriangle,
              tone: "error",
              title: "You're not checked in yet",
              body: outcome.message || "The check-in didn't go through. Check your connection and scan again.",
            };
    }
  })();

  const Icon = view.icon;
  const ring = {
    ok: "bg-[#ECFDF3] text-[#067647]",
    info: "bg-[#F3F7FF] text-[#155DFC]",
    warn: "bg-[#FFFAEB] text-[#B54708]",
    error: "bg-[#FEF3F2] text-[#B42318]",
  }[view.tone as "ok" | "info" | "warn" | "error"];

  return (
    <div role={view.tone === "error" || view.tone === "warn" ? "alert" : "status"} className="text-center">
      <span className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-full", ring)}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight text-[#0B1B3F]">{view.title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#4A5670]">{view.body}</p>
      {action && <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">{action}</div>}
    </div>
  );
}

/** Map the server action's result to an outcome. */
export function toOutcome(res: { success: boolean; alreadyLogged?: boolean; code?: string; error?: string }): CheckInOutcome {
  if (res.success) return res.alreadyLogged ? { kind: "already" } : { kind: "checked-in", at: new Date() };
  if (res.code === "not_accepted") return { kind: "not-accepted" };
  return { kind: "error", message: res.error };
}

/** Coordinates if the student allows it (some workplaces require them), else none. */
export function currentPosition(): Promise<{ lat?: number; lng?: number }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  });
}

/** The QR holds either a raw token or a link with ?token=. */
export function tokenFromScan(text: string): string {
  try {
    return new URL(text).searchParams.get("token") ?? text;
  } catch {
    return text;
  }
}
