import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { loadMyDigest } from "@/lib/api/services/digest";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { DigestItemCard, DigestItemSkeleton } from "./DigestParts";

const fmtDay = (iso: string | null) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : null;
};

/**
 * "Picked for you" on /feed: the student's weekly digest. Opens with the
 * week's own headline and intro, like a short note, then the picks.
 */
export async function PicksView() {
  const state = await loadMyDigest();

  if (state.status !== "ready") {
    const none = state.status === "none";
    return (
      <section className="rounded-2xl bg-white px-6 py-10 ring-1 ring-[#DCE5F5] sm:px-10">
        <h2 className="font-heading text-xl font-semibold text-[#0B1B3F]">
          {none ? "Your first picks arrive on Monday morning" : "Your picks couldn't load"}
        </h2>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-[#4A5670]">
          {none
            ? "Every week we look across the web for internships, hackathons, scholarships and events that suit students in your course and city. Your course, city, skills and interests decide what you get."
            : "The service that picks them isn't answering. Try again in a few minutes; everything on Zigex is still open to apply."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {none && (
            <Link href="/dashboard/edit-profile" className={landingButton("primary", "md")}>
              Update your profile
            </Link>
          )}
          <Link href="/feed" className={landingButton(none ? "secondary" : "primary", "md")}>
            See all on Zigex
          </Link>
        </div>
      </section>
    );
  }

  const { digest } = state;
  const updated = fmtDay(digest.generatedAt);

  return (
    <section aria-labelledby="picks-title">
      <header className="max-w-[62ch]">
        <p className="text-sm text-[#7B869C]">
          {digest.weekLabel ?? "This week"}
          {updated && `, updated ${updated}`}
        </p>
        <h2 id="picks-title" className="mt-1 text-balance font-heading text-2xl font-bold leading-tight tracking-tight text-[#0B1B3F]">
          {digest.headline ?? "Picked for you this week"}
        </h2>
        {digest.intro && <p className="mt-2 text-base leading-relaxed text-[#4A5670]">{digest.intro}</p>}
      </header>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2" aria-label={`${digest.items.length} picks`}>
        {digest.items.map((item) => (
          <li key={item.key}>
            <DigestItemCard item={item} />
          </li>
        ))}
      </ul>

      <p className="mt-6 flex max-w-[70ch] items-start gap-2 text-sm leading-relaxed text-[#4A5670]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
        These open other websites, and applying there doesn&apos;t show up in My applications. Check each one on the organiser&apos;s official
        site; real programmes never ask you to pay to apply.
      </p>
    </section>
  );
}

/** Same footprint as the loaded view. */
export function PicksSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your picks">
      <div className="h-4 w-40 rounded bg-[#EEF2FA]" />
      <div className="mt-2 h-7 w-72 max-w-full rounded bg-[#EEF2FA]" />
      <div className="mt-3 h-4 w-full max-w-md rounded bg-[#F3F6FB]" />
      <div className="mt-6 grid gap-5 motion-safe:animate-pulse sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <DigestItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** The number on the "Picked for you" tab; nothing until it's known. */
export async function PicksCount() {
  const state = await loadMyDigest();
  if (state.status !== "ready") return null;
  return (
    <span className="ml-1.5 rounded-full bg-[#EEF3FF] px-1.5 py-px text-xs font-semibold tabular-nums text-[#155DFC]">
      {state.digest.items.length}
      <span className="sr-only"> picks</span>
    </span>
  );
}
