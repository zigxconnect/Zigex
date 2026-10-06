"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { landingButton, landingContainer } from "@/components/sections/landing/landing-ui";

/**
 * The one header signed-out visitors see, on the landing page and on /feed,
 * so moving between them feels like one site rather than two.
 * Links use "/#section" so they work from any page.
 */
const NAV_LINKS = [
  { label: "Opportunities", href: "/feed" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "For companies", href: "/#companies" },
  { label: "About", href: "/#mission" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu after navigating, and on Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => href === "/feed" && pathname?.startsWith("/feed");

  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE5F5] bg-white/90 backdrop-blur-md">
      <div className={`${landingContainer} flex h-[72px] items-center justify-between gap-6`}>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
        >
          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="Main">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`text-[15px] font-medium transition-colors hover:text-[#0B1B3F] ${
                      isActive(link.href) ? "text-[#0B1B3F]" : "text-[#4A5670]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div id="site-mobile-menu" className="border-t border-[#DCE5F5] bg-white md:hidden">
          <nav aria-label="Main" className={`${landingContainer} flex flex-col py-3`}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center text-base font-medium text-[#0B1B3F]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#DCE5F5] pt-4">
              <Link href="/sign-in" className={landingButton("secondary", "md")}>
                Sign in
              </Link>
              <Link href="/sign-up" className={landingButton("primary", "md")}>
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
