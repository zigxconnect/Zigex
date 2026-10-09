import type { Metadata } from "next";
import Link from "next/link";
import { StandaloneQRScanner } from "@/components/sections/intern/StandaloneQRScanner";

export const metadata: Metadata = { title: "Check in", robots: { index: false, follow: false } };

export default async function AttendanceScanPage(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await props.searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#F8FAFF] px-4 py-10">
      <Link href="/student/workspace" className="mb-6 flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
        <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5] sm:p-8">
        {token ? (
          <StandaloneQRScanner token={token} />
        ) : (
          <div role="alert" className="text-center">
            <h1 className="font-heading text-xl font-semibold text-[#0B1B3F]">This link is missing its code</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">
              Scan the QR poster at your workplace again, or check in from your workspace.
            </p>
            <Link
              href="/student/workspace"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]"
            >
              Open my workspace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
