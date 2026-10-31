import { Sparkles } from "lucide-react";
import { loadMyDigest } from "@/lib/api/services/digest";
import { DigestItemCard } from "./DigestParts";
import { ProUpgradeDialog } from "./ProUpgradeDialog";
import { RefreshWhilePreparing } from "./RefreshWhilePreparing";

const FREE_PREVIEW_COUNT = 3;

/** A short AI-picked preview above the regular opportunities board. */
export async function RecommendedPicks() {
  const state = await loadMyDigest();
  if (state.status !== "ready") {
    const unavailable = state.status === "unavailable";
    const preparing = state.status === "preparing";
    return (
      <section aria-labelledby="recommended-title" className="mb-8 rounded-xl bg-[#F3F7FF] px-5 py-5 ring-1 ring-[#DCE5F5]">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#155DFC]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI picks
        </p>
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
              ? "We’re searching for opportunities based on your profile. This section will update automatically when they’re ready."
              : "We couldn’t find suitable open opportunities for your profile right now. All open Zigex opportunities are listed below."}
        </p>
        {preparing && <RefreshWhilePreparing />}
      </section>
    );
  }

  const { digest } = state;
  const preview = digest.items.slice(0, FREE_PREVIEW_COUNT);
  const lockedCount = Math.max(0, digest.items.length - preview.length);

  return (
    <section aria-labelledby="recommended-title" className="mb-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#155DFC]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI picks{digest.weekLabel ? ` · ${digest.weekLabel}` : ""}
          </p>
          <h2 id="recommended-title" className="mt-1 font-heading text-xl font-bold leading-tight text-[#0B1B3F] sm:text-2xl">
            Recommended for you
          </h2>
          {digest.intro && <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-[#4A5670]">{digest.intro}</p>}
        </div>
        {lockedCount > 0 && <ProUpgradeDialog lockedCount={lockedCount} />}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2" aria-label={`${preview.length} recommended opportunities`}>
        {preview.map((item) => (
          <li key={item.key}>
            <DigestItemCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}