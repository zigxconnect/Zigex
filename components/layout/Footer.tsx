"use client";

import React from "react";
import Link from "next/link";
import { FaLinkedin, FaTwitter, FaFacebook, FaGithub } from "react-icons/fa";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { ADMIN_APP_URL } from "@/lib/app-urls";

// UX: every footer link goes somewhere real (they all pointed at /feed or "#").
const PLATFORM_LINKS = [
  { label: "Browse Opportunities", href: "/feed" },
  { label: "Upcoming Events", href: "/feed" },
  { label: "Blog", href: "/dashboard/blog" },
  { label: "For Companies", href: `${ADMIN_APP_URL}/company/sign-up` },
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
    <footer className="bg-gradient-to-br from-[#0f2a8c] via-[#1534b3] to-[#1e40af] text-white pt-20 pb-10 border-t border-blue-700/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <img
                src="https://i.ibb.co/Cp502Yby/logo.png"
                alt="Zigex Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-sm">
              Connecting talented individuals with world-class internship opportunities.
              Bridging the gap between education and industry in Bamenda and beyond.
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
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-[#EA580C] text-white transition-all duration-300 shadow-md backdrop-blur-sm border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <social.icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-white relative inline-block">
              Platform
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#EA580C] rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-sm text-blue-100/70">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-white relative inline-block">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#EA580C] rounded-full"></span>
            </h4>
            <ul className="space-y-5 text-sm text-blue-100/70">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#EA580C] shrink-0" />
                <span>Commercial Avenue, Bamenda, NW Region, Cameroon</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#EA580C] shrink-0" />
                <a href="mailto:zigexconnect.com@gmail.com" className="hover:text-white transition-colors">zigexconnect.com@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#EA580C] shrink-0" />
                <a href="tel:+237650146590" className="hover:text-white transition-colors">+237 650 146 590</a>
              </li>
            </ul>
          </div>

          {/* Improved Newsletter */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <h4 className="text-lg font-bold mb-4 text-white">Join the Community</h4>
            <p className="text-xs text-blue-100/60 mb-6 leading-relaxed">
              Get notified about new internship roles and career bootcamps.
            </p>
            {/* UX: replaces a newsletter form that silently did nothing. New
                opportunities reach students through their account notifications. */}
            <Link
              href="/sign-up"
              className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Create a free account
              <ArrowRight size={14} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-blue-100/75">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Zigex Platform.</span>
              <span className="hidden md:inline text-white/10">|</span>
              <span>Built for the next generation of African talent.</span>
            </div>
            <div className="flex gap-8">
              {/* TODO(content): add Terms of Service and Cookie Policy pages, then link them here. */}
              <Link href="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
