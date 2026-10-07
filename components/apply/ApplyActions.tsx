"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { ApplyDialog, type ApplyKind, type ApplyPrefill } from "./ApplyDialog";
import { landingButton } from "@/components/sections/landing/landing-ui";

type Status = { hasApplied: boolean; status: string | null };

const VERB: Record<ApplyKind, string> = { internship: "Apply now", program: "Register", event: "Reserve my spot" };

/**
 * The signed-in action area of the Apply panel: apply (opens ApplyDialog),
 * or where your application stands. Updates straight after submitting.
 */
export function ApplyActions({
  kind,
  id,
  title,
  company,
  image = null,
  closesAt = null,
  hasFee,
  priceXaf,
  prefill,
  initialStatus,
  isOpen,
  mobileBar = false,
}: {
  kind: ApplyKind;
  id: string;
  title: string;
  company: string;
  image?: string | null;
  closesAt?: string | null;
  hasFee: boolean;
  priceXaf: number | null;
  prefill: ApplyPrefill;
  initialStatus: Status;
  isOpen: boolean;
  /** Also show a fixed Apply bar on phones (only for the main panel). */
  mobileBar?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(initialStatus);
  const s = status.hasApplied ? status.status : null;

  if (s === "accepted" || s === "rsvp_confirmed") {
    const next =
      kind === "internship"
        ? { href: "/student/workspace", label: "Open your workspace" }
        : kind === "program"
          ? { href: `/programs/${id}/updates`, label: "See program updates" }
          : null;
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2 rounded-xl bg-[#ECFDF3] px-4 py-3 text-sm text-[#067647]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {kind === "event" ? "Your place is confirmed." : "You've been accepted. Congratulations!"}
        </p>
        {next && (
          <Link href={next.href} className={`${landingButton("primary", "lg")} w-full`}>
            {next.label}
          </Link>
        )}
      </div>
    );
  }

  if (s === "pending" || s === "reviewing" || s === "reviewed") {
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2 rounded-xl bg-[#FFF7E6] px-4 py-3 text-sm text-[#7A2E0E]">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {kind === "event"
            ? "You asked for a spot. The organiser will confirm it."
            : "Your application is in review. You'll be notified when the company decides."}
        </p>
        <Link href="/dashboard/applied-internships" className={`${landingButton("secondary", "md")} w-full`}>
          View my applications
        </Link>
      </div>
    );
  }

  if (s === "rejected") {
    return (
      <p className="rounded-xl bg-[#F2F4F7] px-4 py-3 text-sm text-[#4A5670]">
        You weren&apos;t selected this time. Keep applying; new opportunities are posted regularly.
      </p>
    );
  }

  if (!isOpen) return null;

  const dialog = (
    <ApplyDialog
      open={open}
      onOpenChange={setOpen}
      kind={kind}
      id={id}
      title={title}
      company={company}
      image={image}
      closesAt={closesAt}
      hasFee={hasFee}
      priceXaf={priceXaf}
      prefill={prefill}
      onSubmitted={() => {
        setStatus({ hasApplied: true, status: "pending" });
        router.refresh();
      }}
    />
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${landingButton("primary", "lg")} w-full`}>
        {VERB[kind]}
      </button>
      <p className="mt-2 text-center text-sm text-[#7B869C]">
        {kind === "event" ? "One tap. The organiser confirms your place." : "Takes about a minute. Your profile goes with it."}
      </p>

      {/* Phones: keep the action in reach while reading the description. */}
      {mobileBar && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[#DCE5F5] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className={`${landingButton("primary", "lg")} w-full`}>
            {VERB[kind]}
          </button>
        </div>
      )}
      {dialog}
    </>
  );
}
