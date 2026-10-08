import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/layout/public/SiteHeader";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/**
 * Layout for the Privacy Policy and Terms of Use: a readable column (about
 * 68 characters), numbered sections people can cite, the short version first,
 * and an "On this page" list (sticky beside the text on wide screens, a
 * fold-out list on phones).
 */
export function LegalPage({
  title,
  intro,
  effective,
  summary,
  sections,
  related,
}: {
  title: string;
  intro: React.ReactNode;
  effective: string;
  summary: React.ReactNode[];
  sections: LegalSection[];
  related: { href: string; label: string };
}) {
  const toc = (
    <ol className="space-y-1 text-sm">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="flex gap-2 rounded-lg px-2 py-1.5 text-[#4A5670] hover:bg-[#EEF3FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          >
            <span className="w-5 shrink-0 tabular-nums text-[#7B869C]">{i + 1}.</span>
            <span>{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-[#F8FAFF]">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
          <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className="sticky top-24">
                <p className="mb-2 px-2 text-sm font-semibold text-[#0B1B3F]">On this page</p>
                {toc}
              </nav>
            </aside>

            <article className="min-w-0 max-w-[68ch]">
              <header>
                <h1 className="font-heading text-[34px] font-bold leading-tight tracking-tight text-[#0B1B3F] sm:text-[40px]">{title}</h1>
                <p className="mt-2 text-sm text-[#7B869C]">Effective {effective}</p>
                <div className="mt-5 text-base leading-[1.75] text-[#4A5670]">{intro}</div>
              </header>

              {/* The short version: what most readers need, in plain words. */}
              <section aria-labelledby="short-version" className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5] sm:p-7">
                <h2 id="short-version" className="font-heading text-lg font-semibold text-[#0B1B3F]">
                  The short version
                </h2>
                <ul className="mt-4 space-y-3 [&_a]:font-medium [&_a]:text-[#155DFC] [&_a]:underline-offset-2 hover:[&_a]:underline">
                  {summary.map((item, i) => (
                    <li key={i} className="flex gap-3 text-base leading-relaxed text-[#0B1B3F]">
                      <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <details className="group mt-6 rounded-2xl bg-white ring-1 ring-[#DCE5F5] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-[#0B1B3F] [&::-webkit-details-marker]:hidden">
                  On this page
                  <ChevronDown className="h-4 w-4 text-[#7B869C] transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="border-t border-[#EEF2FA] px-3 pb-3 pt-2">{toc}</div>
              </details>

              <div className="legal-body mt-10 space-y-12">
                {sections.map((s, i) => (
                  <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24">
                    <h2 id={`${s.id}-title`} className="flex gap-3 font-heading text-[22px] font-semibold leading-snug tracking-tight text-[#0B1B3F]">
                      <span className="tabular-nums text-[#7B869C]">{i + 1}.</span>
                      <span>{s.title}</span>
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-[1.75] text-[#4A5670] [&_a]:font-medium [&_a]:text-[#155DFC] [&_a]:underline-offset-2 hover:[&_a]:underline [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0B1B3F] [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-[#0B1B3F] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul>li::marker]:text-[#B9C8E6]">
                      {s.body}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="mt-16 flex flex-col gap-3 border-t border-[#DCE5F5] pt-6 text-sm text-[#4A5670] sm:flex-row sm:items-center sm:justify-between">
                <p>Questions? Email <a href="mailto:zigexconnect.com@gmail.com" className="font-medium text-[#155DFC] hover:underline">zigexconnect.com@gmail.com</a>.</p>
                <Link href={related.href} className="font-semibold text-[#155DFC] hover:underline">
                  {related.label}
                </Link>
              </footer>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
