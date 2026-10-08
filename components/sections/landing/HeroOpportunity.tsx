import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { latestFeed, type FeedKind } from "@/lib/api/services/feed";
import { isClosed, toBoardItem, type BoardItem } from "@/components/feed/board/board-types";
import { usableImageUrl } from "@/lib/images";
import { SafeImg } from "@/components/SafeImg";

const KINDS: FeedKind[] = ["internships", "programs", "events"];
const DAY = 86_400_000;

/** The open opportunity closing soonest (cached public feed), or null. */
async function soonestOpen(): Promise<BoardItem | null> {
  const results = await Promise.allSettled(KINDS.map((kind) => latestFeed(kind, 6)));
  const items = results
    .flatMap((r, i) => (r.status === "fulfilled" ? r.value.map((row) => toBoardItem(KINDS[i], row)) : []))
    .filter((item) => item.closesAt && !isClosed(item));
  items.sort((a, b) => new Date(a.closesAt!).getTime() - new Date(b.closesAt!).getTime());
  return items[0] ?? null;
}

function closesLabel(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
  if (days <= 1) return "Closes today";
  if (days <= 14) return `Closes in ${days} days`;
  return `Closes ${new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

/**
 * The card over the hero photo: a real, open opportunity (the one closing
 * soonest), linking to it. Renders nothing when none is open, so the hero
 * never shows an invented example.
 */
export async function HeroOpportunity() {
  const item = await soonestOpen().catch(() => null);
  if (!item) return null;
  const logo = usableImageUrl(item.companyLogo);
  const place = item.workMode === "remote" ? "Remote" : [item.location?.split(",")[0]?.trim(), item.workMode && item.workMode[0].toUpperCase() + item.workMode.slice(1)].filter(Boolean).join(", ");
  const urgent = item.closesAt && new Date(item.closesAt).getTime() - Date.now() <= 14 * DAY;

  return (
    <Link
      href={`/feed/${item.id}`}
      className="relative -mt-10 ml-4 mr-4 block rounded-2xl border border-[#DCE5F5] bg-white p-3.5 shadow-[0_12px_32px_-12px_rgba(11,27,63,0.25)] transition-shadow hover:shadow-[0_16px_36px_-12px_rgba(11,27,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] sm:ml-auto sm:mr-6 sm:max-w-[320px] lg:absolute lg:-bottom-14 lg:left-6 lg:m-0 lg:w-[300px]"
    >
      <div className="flex items-start gap-3">
        {/* The company's initial, with its logo over it once (and if) the logo loads. */}
        <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#155DFC] font-heading text-base font-bold text-white ring-1 ring-[#EEF2FA]">
          {(item.companyName || "Z").charAt(0)}
          {logo && <SafeImg src={logo} alt="" className="absolute inset-0 h-full w-full bg-white object-cover" />}
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold leading-snug text-[#0B1B3F]">{item.title}</p>
          {item.companyName && <p className="mt-0.5 text-sm text-[#4A5670]">{item.companyName}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        {place && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F7FF] px-2 py-1 text-[#0B1B3F]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {place}
          </span>
        )}
        {item.closesAt && (
          // Orange is reserved for urgency across the page.
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium ${urgent ? "bg-[#FFF1E8] text-[#C2410C]" : "bg-[#F3F7FF] text-[#0B1B3F]"}`}>
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {closesLabel(item.closesAt)}
          </span>
        )}
      </div>
    </Link>
  );
}
