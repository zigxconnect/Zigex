import { cn } from "@/lib/utils";

/**
 * Skeleton building blocks. Each page's loading.tsx composes these into the
 * shape of that page, so content lands where the placeholders were.
 * One shimmer colour, one radius scale, reduced motion respected.
 */

export function Bone({ className = "" }: { className?: string }) {
  // cn() merges Tailwind classes, so a caller's rounded-full beats the default rounded-md.
  return <div className={cn("rounded-md bg-[#E9EEF7] motion-safe:animate-pulse", className)} />;
}

/** Page title and one-line lead, same spacing as real pages. */
export function PageTitle({ lead = true }: { lead?: boolean }) {
  return (
    <div className="mb-6 space-y-2.5">
      <Bone className="h-8 w-56" />
      {lead && <Bone className="h-4 w-80 max-w-full" />}
    </div>
  );
}

/** A white surface like the real cards. */
export function Surface({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]", className)}>{children}</div>;
}

/** Opportunity / program card: company line, title, image, two lines, footer. */
export function CardBone() {
  return (
    <Surface className="p-4">
      <div className="flex items-center gap-2">
        <Bone className="h-6 w-6 rounded-md" />
        <Bone className="h-3 w-24" />
      </div>
      <Bone className="mt-3 h-4 w-4/5" />
      <Bone className="mt-2 h-4 w-3/5" />
      <Bone className="mt-3 aspect-[4/3] w-full rounded-xl" />
      <Bone className="mt-4 h-4 w-1/2" />
      <Bone className="mt-2 h-3 w-2/3" />
      <div className="mt-4 flex justify-between border-t border-[#EEF2FA] pt-3">
        <Bone className="h-3 w-24" />
        <Bone className="h-3 w-20" />
      </div>
    </Surface>
  );
}

/** A list row: thumbnail, two lines, trailing pill. */
export function RowBone({ round = false }: { round?: boolean }) {
  return (
    <Surface className="flex items-center gap-4 p-4">
      <Bone className={`${round ? "h-12 w-12 rounded-full" : "h-16 w-20 rounded-xl"} shrink-0`} />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone className="h-3 w-24" />
        <Bone className="h-4 w-3/5" />
        <Bone className="h-3 w-1/3" />
      </div>
      <Bone className="hidden h-7 w-20 rounded-full sm:block" />
    </Surface>
  );
}

/** Screen-reader announcement for every skeleton. */
export function Loading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
