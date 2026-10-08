"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { landingButton, landingContainer } from "./landing-ui";

// Real Zigex students, the strongest proof the page has; it leads the visual.
const HERO_PHOTO = "/images/students-hero.webp";

const BamendaHeroSection = ({ card }: { card?: React.ReactNode }) => {
  return (
    <div className="relative bg-white">
      {/* One quiet wash behind the hero instead of scattered blur blobs. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-gradient-to-b from-[#F3F7FF] to-white" />

      {/* Hero */}
      <section className={`${landingContainer} relative grid items-center gap-12 pb-10 pt-12 sm:pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-32 lg:pt-24`}>
        {/* Copy: left-aligned at every size, so the eye starts in one place. */}
        <div className="hero-enter lg:col-span-6">
          <h1 className="font-heading text-[2.5rem] font-bold leading-[1.05] tracking-[-0.02em] text-[#0B1B3F] sm:text-5xl lg:text-[3.5rem]">
            Get real work experience before you graduate.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4A5670]">
            Apply to internships, join training programs and attend events from verified companies in Bamenda
            and across Cameroon. One profile for every opportunity.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className={landingButton("primary", "lg")}>
              Create your free account
            </Link>
            <Link href="/feed" className={landingButton("secondary", "lg")}>
              Browse opportunities
            </Link>
          </div>

          <p className="mt-6 flex items-center gap-2 text-[15px] text-[#4A5670]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#155DFC]" aria-hidden="true" />
            Free for students. 500+ students already on Zigex.
          </p>
        </div>

        {/* Visual: the student photo, with one opportunity card showing what Zigex is. */}
        <div className="hero-enter hero-enter-delay relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#E8EFFE] ring-1 ring-[#DCE5F5]">
            <Image
              src={HERO_PHOTO}
              alt="Three Zigex students in blue Zigex T-shirts"
              width={1200}
              height={900}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] h-auto w-full object-cover"
            />
          </div>

          {/* A real open opportunity (streamed in by the page); overlaps the photo on desktop, sits under it on phones. */}
          {card}
        </div>
      </section>

      <style jsx>{`
        @keyframes hero-enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* One orchestrated entrance; content is visible without JavaScript and
           without motion for people who prefer reduced motion. */
        @media (prefers-reduced-motion: no-preference) {
          .hero-enter { animation: hero-enter 0.5s ease-out both; }
          .hero-enter-delay { animation-delay: 0.12s; }
        }
      `}</style>
    </div>
  );
};

export default BamendaHeroSection;
