import Link from "next/link";

/** Shown when the student has no accepted placement yet. */
export function NoPlacement() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5] sm:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0B1B3F]">Your workspace opens when you&apos;re accepted</h1>
        <p className="mt-2 text-base leading-relaxed text-[#4A5670]">
          Once a company accepts you for an internship or program, this is where you check in, see your tasks and send your daily reports.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/applied-internships"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]"
          >
            See my applications
          </Link>
          <Link
            href="/feed"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[15px] font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF]"
          >
            Find opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
