import { DigestItemSkeleton } from "@/components/digest/DigestParts";

/** Same footprint as the loaded page, so it doesn't jump. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl pb-16" aria-busy="true" aria-label="Loading your picks">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-28 rounded bg-[#EEF2FA]" />
        <div className="h-8 w-64 rounded bg-[#EEF2FA]" />
        <div className="h-4 w-full max-w-md rounded bg-[#F3F6FB]" />
      </div>
      <div className="grid gap-5 motion-safe:animate-pulse sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <DigestItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
