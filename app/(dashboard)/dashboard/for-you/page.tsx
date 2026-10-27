import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Sparkles, UserRoundPen } from "lucide-react";
import { loadMyDigest } from "@/lib/api/services/digest";
import { DigestItemCard } from "@/components/digest/DigestParts";
import { landingButton } from "@/components/sections/landing/landing-ui";

export const metadata: Metadata = { title: "For you" };

/**
 * The student's weekly opportunity digest from the AI service: internships,
 * hackathons, scholarships and more found on the web for students like them
 * (same field and city), each with the reason it fits and a link to the
 * organiser's site. Published every Monday morning (Douala time).
 */
export default async function ForYouPage() {
  const state = await loadMyDigest();
  const digest = state.status === "ready" ? state.digest : null;
  const published = digest?.generatedAt ? new Date(digest.generatedAt) : null;

  return (
    <div className="mx-auto w-full max-w-5xl pb-16">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#155DFC]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Picked by Zila AI
        </p>
        <h1 className="mt-1 font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">For you this week</h1>
        <p className="mt-1 max-w-2xl text-base text-[#4A5670]">
          Internships, hackathons, scholarships and events from across the web, picked for students in your field and city.
        </p>
        {digest && (digest.weekLabel || published) && (
          <p className="mt-3 text-sm text-[#7B869C]">
            {digest.weekLabel}
            {digest.weekLabel && published && !Number.isNaN(published.getTime()) && " · "}
            {published && !Number.isNaN(published.getTime()) && (
              <>Updated <time dateTime={published.toISOString()}>{published.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</time></>
            )}
          </p>
        )}
      </header>

      {digest ? (
        <>
          {(digest.headline || digest.intro) && (
            <div className="mb-6 max-w-3xl rounded-2xl bg-[#F3F7FF] px-5 py-4 ring-1 ring-[#DCE5F5]">
              {digest.headline && <h2 className="font-heading text-lg font-semibold text-[#0B1B3F]">{digest.headline}</h2>}
              {digest.intro && <p className="mt-1 text-[15px] leading-relaxed text-[#0B1B3F]">{digest.intro}</p>}
            </div>
          )}
          <ul className="grid gap-5 sm:grid-cols-2" aria-label={`${digest.items.length} opportunities picked for you`}>
            {digest.items.map((item) => (
              <li key={item.key}>
                <DigestItemCard item={item} />
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-[#4A5670]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
            <span>
              These links go to other websites. Check each opportunity on the organiser&apos;s official site before applying; real programmes
              never ask you to pay to apply.
            </span>
          </p>
          <BetterPicks />
        </>
      ) : state.status === "none" ? (
        <EmptyState
          title="Your first picks are on the way"
          text="New picks arrive every Monday morning. Yours will appear here once they're ready. Add your course, city, skills and interests so they fit you."
        />
      ) : (
        <EmptyState
          title="Your picks couldn't load right now"
          text="This is on our side. Try again in a few minutes; meanwhile every open opportunity is on the Opportunities page."
        />
      )}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-[#DCE5F5]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F7FF] text-[#155DFC]" aria-hidden="true">
        <Compass className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold text-[#0B1B3F]">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-[15px] leading-relaxed text-[#4A5670]">{text}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/feed" className={landingButton("primary", "md")}>
          Browse opportunities
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/dashboard/edit-profile" className={landingButton("secondary", "md")}>
          Update your profile
        </Link>
      </div>
    </section>
  );
}

function BetterPicks() {
  return (
    <aside className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <UserRoundPen className="mt-0.5 h-5 w-5 shrink-0 text-[#155DFC]" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-[#4A5670]">
          <span className="font-semibold text-[#0B1B3F]">Picks follow your profile.</span> Your course, city, skills and interests decide
          what you see next Monday.
        </p>
      </div>
      <Link href="/dashboard/edit-profile" className={`${landingButton("secondary", "md")} shrink-0`}>
        Edit profile
      </Link>
    </aside>
  );
}
