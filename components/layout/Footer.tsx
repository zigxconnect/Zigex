"use client";

import React from "react";
import Link from "next/link";
import { FaLinkedin, FaTwitter, FaFacebook, FaGithub } from "react-icons/fa";
import { MapPin, Mail, Phone } from "lucide-react";
import { ADMIN_APP_URL } from "@/lib/app-urls";

// UX: every footer link goes somewhere real (they all pointed at /feed or "#").
const PLATFORM_LINKS = [
  { label: "Opportunities", href: "/feed" },
  { label: "Internships", href: "/feed?type=internships" },
  { label: "Programs", href: "/feed?type=programs" },
  { label: "Events", href: "/feed?type=events" },
  { label: "For companies", href: `${ADMIN_APP_URL}/company/sign-up` },
];

// TODO(content): add the real profile URLs; until then these icons are not shown as links.
const SOCIAL_LINKS: { label: string; icon: typeof FaLinkedin; href: string }[] = [
  { label: "Zigex on LinkedIn", icon: FaLinkedin, href: "#" },
  { label: "Zigex on X (Twitter)", icon: FaTwitter, href: "#" },
  { label: "Zigex on Facebook", icon: FaFacebook, href: "#" },
  { label: "Zigex on GitHub", icon: FaGithub, href: "#" },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1B3F] text-white pt-20 pb-10">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" aria-label="Zigex home" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {/* The logo has its own blue tile; the old invert filter turned it into a white square. */}
              <span className="flex items-center gap-2.5">
                <img src="/brand/logo.png" alt="" className="h-10 w-10 object-contain" />
                <span className="font-heading text-2xl font-bold tracking-tight">Zigex</span>
              </span>
            </Link>
            <p className="text-[#C9D6F2] text-sm leading-relaxed max-w-sm">
              Internships, training programs and events for students in Bamenda and across Cameroon. One profile for every application.
            </p>
            <div className="flex space-x-3">
              {/* UX: icon-only links need an accessible name; "#" links are not rendered. */}
              {SOCIAL_LINKS.filter((social) => social.href !== "#").map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-[#155DFC] text-white transition-all duration-300 shadow-md backdrop-blur-sm border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <social.icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-bold mb-8 text-white relative inline-block">
              Platform
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#155DFC] rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-sm text-[#C9D6F2]">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h4 className="text-lg font-bold mb-8 text-white relative inline-block">
              Get in touch
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#155DFC] rounded-full"></span>
            </h4>
            <ul className="space-y-5 text-sm text-[#C9D6F2]">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#7FA6FF] shrink-0" />
                <span>Mawa, Mile 6 Nkwen, Bamenda, North West Region, Cameroon</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#7FA6FF] shrink-0" />
                <a href="mailto:zigexconnect.com@gmail.com" className="hover:text-white transition-colors">zigexconnect.com@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#7FA6FF] shrink-0" />
                <a href="tel:+237650146590" className="hover:text-white transition-colors">+237 650 146 590</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#AFC0E6]">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} SEED Inc. Zigex is a product of SEED Inc, Bamenda.</span>
            </div>
            <nav aria-label="Legal" className="flex gap-8">
              <Link href="/terms" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/privacy#cookies" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Cookies
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};
