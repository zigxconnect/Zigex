"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { landingButton, landingContainer } from "./landing-ui";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Mission", href: "#mission" },
  { label: "Services", href: "#services" },
  { label: "Community", href: "#community" },
];

// Real Zigex students, the strongest proof the page has; it leads the visual.
const HERO_PHOTO = "https://i.ibb.co/1YqtdCtK/Chat-GPT-Image-Apr-23-2026-03-29-43-PM.png";

const BamendaHeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // UX: Escape closes the mobile menu, as users expect from any overlay.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  return (
    <div className="relative bg-white">
      {/* One quiet wash behind the hero instead of scattered blur blobs. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-gradient-to-b from-[#F3F7FF] to-white" />

      {/* Header */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-200 ${
          scrolled || mobileMenuOpen
            ? "border-[#DCE5F5] bg-white/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className={`${landingContainer} flex h-[72px] items-center justify-between gap-6`}>
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]">
            <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
          </Link>

          {/* Links sit with the actions on the right: one group to scan, not three. */}
          <div className="hidden items-center gap-8 md:flex">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[15px] font-medium text-[#4A5670] transition-colors hover:text-[#0B1B3F]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Link href="/sign-in" className={landingButton("ghost", "md")}>
                Sign in
              </Link>
              <Link href="/sign-up" className={landingButton("primary", "md")}>
                Get started
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#0B1B3F] hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="landing-mobile-menu" className="border-t border-[#DCE5F5] bg-white md:hidden">
            <div className={`${landingContainer} flex flex-col py-3`}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 items-center text-base font-medium text-[#0B1B3F]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#DCE5F5] pt-4">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className={landingButton("secondary", "md")}>
                  Sign in
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className={landingButton("primary", "md")}>
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className={`${landingContainer} relative grid items-center gap-12 pb-20 pt-32 lg:grid-cols-12 lg:gap-12 lg:pb-32 lg:pt-40`}>
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
            Free for students. 2,000+ already on Zigex.
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

          {/* Opportunity card: overlaps the photo on desktop, sits under it on phones. */}
          <div className="relative -mt-10 ml-4 mr-4 rounded-2xl border border-[#DCE5F5] bg-white p-3.5 shadow-[0_12px_32px_-12px_rgba(11,27,63,0.25)] sm:ml-auto sm:mr-6 sm:max-w-[320px] lg:absolute lg:-bottom-14 lg:left-6 lg:m-0 lg:w-[288px]">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#155DFC] font-heading text-base font-bold text-white">
                S
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-snug text-[#0B1B3F]">Frontend Developer Intern</p>
                <p className="mt-0.5 text-sm text-[#4A5670]">SEED Inc.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F7FF] px-2 py-1 text-[#0B1B3F]">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Bamenda · Hybrid
              </span>
              {/* Orange is reserved for urgency across the page. */}
              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF1E8] px-2 py-1 font-medium text-[#C2410C]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Closes in 6 days
              </span>
            </div>
          </div>
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
