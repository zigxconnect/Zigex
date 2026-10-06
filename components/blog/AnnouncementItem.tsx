"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";

export type AnnouncementView = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdAt: string;
  pinned: boolean;
  from: string;
  fromLogo: string | null;
};

function when(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * One announcement, read in place: who sent it, when, the message and any
 * photo. Long messages fold after a few lines with "Show more".
 */
export function AnnouncementItem({ a }: { a: AnnouncementView }) {
  const [expanded, setExpanded] = useState(false);
  const plain = a.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const long = plain.length > 320;

  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
      <header className="flex items-center gap-3">
        {a.fromLogo ? (
          <img src={a.fromLogo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#EEF2FA]" />
        ) : (
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#155DFC] font-heading font-bold text-white">
            {a.from.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0B1B3F]">{a.from}</p>
          <p className="text-sm text-[#7B869C]">
            <time dateTime={a.createdAt}>{when(a.createdAt)}</time>
          </p>
        </div>
        {a.pinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#155DFC]">
            <Pin className="h-3.5 w-3.5" aria-hidden="true" /> Pinned
          </span>
        )}
      </header>

      <h2 className="mt-4 font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">{a.title}</h2>

      {plain && (
        <div className={`relative mt-2 ${long && !expanded ? "max-h-36 overflow-hidden" : ""}`}>
          <RichContentRenderer
            content={a.content}
            className="text-base leading-relaxed text-[#4A5670] [&_a]:text-[#155DFC] [&_a]:underline [&_p+p]:mt-2"
          />
          {long && !expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white" />}
        </div>
      )}
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 text-sm font-semibold text-[#155DFC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] rounded-sm"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      {a.image && (
        <a href={a.image} target="_blank" rel="noopener noreferrer" className="mt-4 block overflow-hidden rounded-xl ring-1 ring-[#EEF2FA]">
          <img src={a.image} alt="" loading="lazy" className="max-h-[420px] w-full object-cover" />
          <span className="sr-only">Open the full image</span>
        </a>
      )}
    </article>
  );
}
