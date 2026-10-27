import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMyDigest } from "@/lib/api/services/digest";
import { DeadlineChip } from "./DigestParts";

const PREVIEW = 3;

/**
 * "This week for you" on /feed: the top picks from the student's weekly
 * digest. Renders nothing until a digest exists, so it never shows an empty
 * box or an error.
 */
export async function DigestRailCard({ id, className }: { id: string; className?: string }) {
  const state = await loadMyDigest();
  if (state.status !== "ready") return null;
  const { items, weekLabel } = state.digest;
  // `id` keeps the heading ids unique: /feed renders this twice (phones, desktop).
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} className={cn("rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="flex items-center gap-1.5 font-heading text-base font-semibold text-[#0B1B3F]">
            <Sparkles className="h-4 w-4 text-[#155DFC]" aria-hidden="true" />
            This week for you
          </h2>
          {weekLabel && <p className="mt-0.5 text-xs text-[#7B869C]">{weekLabel}</p>}
        </div>
        <Link href="/dashboard/for-you" className="shrink-0 text-sm font-semibold text-[#155DFC] hover:underline">
          See all
        </Link>
      </div>

      <ul className="mt-3 space-y-1">
        {items.slice(0, PREVIEW).map((item) => (
          <li key={item.key}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="-mx-2 block rounded-xl px-2 py-2 hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
            >
              <span className="line-clamp-2 text-sm font-semibold text-[#0B1B3F]">{item.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex min-w-0 max-w-full items-center gap-0.5 text-sm text-[#4A5670]">
                  <span className="truncate">{item.domain}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
                <DeadlineChip deadline={item.deadline} />
              </span>
            </a>
          </li>
        ))}
      </ul>

      {items.length > PREVIEW && (
        <Link href="/dashboard/for-you" className="mt-2 block text-sm font-semibold text-[#155DFC] hover:underline">
          {items.length - PREVIEW} more picked for you
        </Link>
      )}
    </section>
  );
}
