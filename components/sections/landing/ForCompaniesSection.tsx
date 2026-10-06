import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ADMIN_APP_URL } from "@/lib/app-urls";
import { landingButton, landingContainer } from "./landing-ui";

// The second audience gets its own clear path (like Wellfound's
// "I'm looking to hire"), leading to the company portal.
const POINTS = [
  "Post internships, programs and events for free",
  "Review applicants and schedule interviews in one place",
  "Track your interns' attendance and daily logs",
];

export function ForCompaniesSection() {
  return (
    <section id="companies" aria-labelledby="companies-title" className="bg-[#0B1B3F] py-16 sm:py-20 scroll-mt-20">
      <div className={`${landingContainer} grid gap-10 lg:grid-cols-12 lg:items-center`}>
        <div className="lg:col-span-7">
          <h2 id="companies-title" className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Hiring interns? Find them on Zigex.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#C9D6F2]">
            Reach motivated students in Bamenda and across Cameroon, and manage the whole internship from one dashboard.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-white">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#7FA6FF]" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
          <Link href={`${ADMIN_APP_URL}/company/sign-up`} className={landingButton("primary", "lg")}>
            Post an opportunity
          </Link>
          {/* Light outline variant for the dark band. */}
          <Link
            href={`${ADMIN_APP_URL}/sign-in`}
            className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-base font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Company sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForCompaniesSection;
