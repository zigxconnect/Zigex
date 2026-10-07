import Link from "next/link";

/** Shown for addresses that don't exist (and opportunities that were removed). */
export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center bg-[#F8FAFF] px-5 py-16 font-sans">
      <div className="max-w-md text-center">
        <p className="font-heading text-5xl font-bold text-[#155DFC]">404</p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-[#0B1B3F]">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-base text-[#4A5670]">
          The link may be old, or the opportunity may have been removed by the company.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/feed" className="inline-flex h-11 items-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]">
            Browse opportunities
          </Link>
          <Link href="/" className="inline-flex h-11 items-center rounded-xl border border-[#DCE5F5] bg-white px-5 text-[15px] font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]">
            Go to the home page
          </Link>
        </div>
      </div>
    </main>
  );
}
