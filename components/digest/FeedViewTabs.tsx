import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMyDigest } from "@/lib/api/services/digest";

export type FeedView = "all" | "for-you";

const tab =
  "relative inline-flex h-11 items-center px-1 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 rounded-sm";

/**
 * The two lists on /feed: opportunities posted on Zigex (apply with your
 * profile) and the weekly picks from the web (apply on the organiser's
 * site). Page-level underline tabs, so they don't read as one more filter
 * like the board's pill tabs below them.
 *
 * Shows only when the student has picks (or opened a picks link), so no one
 * meets an empty tab week after week.
 */
export async function FeedViewTabs({ view }: { view: FeedView }) {
  const state = await loadMyDigest();
  const count = state.status === "ready" ? state.digest.items.length : null;
  if (count === null && view !== "for-you") return null;

  return (
    <nav aria-label="Opportunity lists" className="mb-6 border-b border-[#DCE5F5]">
      <ul className="-mb-px flex gap-6">
        <li>
          <Link
            href="/feed"
            aria-current={view === "all" ? "page" : undefined}
            className={cn(tab, view === "all" ? "text-[#0B1B3F]" : "text-[#4A5670] hover:text-[#0B1B3F]")}
          >
            All on Zigex
            {view === "all" && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#155DFC]" />}
          </Link>
        </li>
        <li>
          <Link
            href="/feed?view=for-you"
            aria-current={view === "for-you" ? "page" : undefined}
            className={cn(tab, view === "for-you" ? "text-[#0B1B3F]" : "text-[#4A5670] hover:text-[#0B1B3F]")}
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-[#155DFC]" aria-hidden="true" />
            Picked for you
            {count !== null && (
              <span className="ml-1.5 rounded-full bg-[#EEF3FF] px-1.5 py-px text-xs font-semibold tabular-nums text-[#155DFC]">
                {count}
                <span className="sr-only"> picks</span>
              </span>
            )}
            {view === "for-you" && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#155DFC]" />}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
