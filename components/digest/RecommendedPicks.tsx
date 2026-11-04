import Link from "next/link";
import { SafeImg } from "@/components/SafeImg";
import { loadMyDigest } from "@/lib/api/services/digest";
import { RecommendationBrowser, RecommendationIntro } from "./RecommendationBrowser";
import { RefreshWhilePreparing } from "./RefreshWhilePreparing";

function BlurredOpportunityCard({
  title,
  category,
  label,
  image,
}: {
  title: string;
  category: string;
  label: string;
  image: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#DCE5F5] bg-white p-3">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-[#4A5670]">
        <span className="rounded-full bg-[#EAF0FF] px-2 py-1 text-[#155DFC]">{category}</span>
        <span>{label}</span>
      </div>
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#E7EEFB]">
        <SafeImg src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-105 object-cover blur-[5px]" />
        <div className="absolute inset-0 bg-[#EAF0FF]/45" />
        <div className="absolute inset-0 space-y-3 p-4" aria-hidden="true">
          <div className="h-4 w-2/5 rounded bg-white/80" />
          <div className="h-3 w-3/5 rounded bg-white/70" />
          <div className="absolute inset-x-4 bottom-4 top-[38%] rounded-lg bg-white/40" />
        </div>
      </div>
      <div className="mt-3 space-y-2" aria-hidden="true">
        <div className="h-4 w-4/5 rounded bg-[#EEF2FA]" />
        <div className="h-4 w-3/5 rounded bg-[#EEF2FA]" />
        <div className="pt-1">
          <div className="h-3 w-full rounded bg-[#EEF2FA]" />
          <div className="mt-2 h-3 w-5/6 rounded bg-[#EEF2FA]" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#EEF2FA] pt-3">
        <span className="truncate text-xs font-medium text-[#4A5670]" aria-hidden="true">{title}</span>
        <span className="shrink-0 text-xs font-semibold text-[#155DFC]" aria-hidden="true">View</span>
      </div>
    </article>
  );
}

/** A short AI-picked preview above the regular opportunities board. */
export async function RecommendedPicks() {
  const state = await loadMyDigest();

  if (state.status === "profile-needed") {
    return (
      <section aria-labelledby="recommended-title" className="mb-8 rounded-2xl bg-[#F3F7FF] px-5 py-5 ring-1 ring-[#DCE5F5]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#155DFC]">Recommended opportunities</p>
            <h2 id="recommended-title" className="mt-1 font-heading text-xl font-bold leading-tight text-[#155DFC] sm:text-2xl">
              Create your profile to unlock personalized recommendations
            </h2>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-[#4A5670]">
              Add your degree, skills, interests, and location to unlock AI-picked opportunities based on your profile.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard/edit-profile" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(21,93,252,0.85)] transition hover:bg-[#0C47D8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#155DFC]/20">
              Create profile
            </Link>
            <Link href="/dashboard/edit-profile" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-[#B9C8E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1B3F] transition hover:border-[#155DFC] hover:text-[#155DFC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#155DFC]/20">
              Update profile
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Blurred recommendation previews">
          {[
            { title: "International Machine Learning Competition", category: "Competition", label: "EdTech", image: "https://i.ibb.co/HpHLkyGX/image.png" },
            { title: "Junior Python Developer", category: "Internship", label: "Remote", image: "https://i.ibb.co/RGnGgm0X/image.png" },
            { title: "AI Product Design Fellowship", category: "Fellowship", label: "Hybrid", image: "https://i.ibb.co/TM9p7M7Q/image.png" },
          ].map((card) => (
            <BlurredOpportunityCard key={card.title} title={card.title} category={card.category} label={card.label} image={card.image} />
          ))}
        </div>
      </section>
    );
  }

  if (state.status !== "ready") {
    const unavailable = state.status === "unavailable";
    const preparing = state.status === "preparing";
    return (
      <section aria-labelledby="recommended-title" className="mb-8 rounded-2xl bg-[#F3F7FF] px-5 py-5 ring-1 ring-[#DCE5F5]">
        <p className="text-sm font-semibold text-[#155DFC]">Recommended opportunities</p>
        <h2 id="recommended-title" className="mt-1 font-heading text-xl font-bold leading-tight text-[#0B1B3F]">
          {unavailable
            ? "Recommendations couldn’t load"
            : preparing
              ? "Your recommendations are being prepared"
              : "No matching opportunities found yet"}
        </h2>
        <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-[#4A5670]">
          {unavailable
            ? "Your personalized picks aren’t available right now. Try again later; all open Zigex opportunities are listed below."
            : preparing
              ? "We’re searching for opportunities based on your profile. This section will refresh automatically when they’re ready."
              : "We couldn’t find suitable open opportunities for your profile right now. All open Zigex opportunities are listed below."}
        </p>
        {preparing && <RefreshWhilePreparing />}
      </section>
    );
  }

  const { digest } = state;

  return (
    <section aria-labelledby="recommended-title" className="mb-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#155DFC]">
            Recommended opportunities{digest.weekLabel ? ` · ${digest.weekLabel}` : ""}
          </p>
          <h2 id="recommended-title" className="mt-1 font-heading text-xl font-bold leading-tight text-[#155DFC] sm:text-2xl">
            Recommended for you
          </h2>
          {digest.intro && <RecommendationIntro text={digest.intro} />}
        </div>
      </header>
      <RecommendationBrowser items={digest.items} />
    </section>
  );
}