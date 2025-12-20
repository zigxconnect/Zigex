"use client";

import React from "react";
import Link from "next/link";
import { FaLinkedin, FaTwitter, FaFacebook, FaGithub, FaInstagram } from "react-icons/fa";
import { Send, MapPin, Mail, Phone } from "lucide-react";

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
              {[
                { icon: FaLinkedin, href: "#" },
                { icon: FaTwitter, href: "#" },
                { icon: FaFacebook, href: "#" },
                { icon: FaGithub, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-[#EA580C] text-white transition-all duration-300 shadow-md backdrop-blur-sm border border-white/10"
                >
                  <social.icon size={18} />
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
              {['Browse Jobs', 'For Companies', 'Mentorship', 'Upcoming Events', 'Technical Blog'].map((item) => (
                <li key={item}>
                  <a href="/feed" className="hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
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
                  <a href="mailto:hello@zigex.com" className="hover:text-white transition-colors">hello@zigex.com</a>
               </li>
               <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[#EA580C] shrink-0" />
                  <a href="tel:+237123456789" className="hover:text-white transition-colors">+237 6XX XXX XXX</a>
               </li>
            </ul>
          </div>

          {/* Improved Newsletter */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <h4 className="text-lg font-bold mb-4 text-white">Join the Community</h4>
            <p className="text-xs text-blue-100/60 mb-6 leading-relaxed">
              Get weekly updates on new internship roles and career bootcamps.
            </p>
            <form className="relative space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all"
              />
              <button className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 group">
                Subscribe
                <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-blue-100/40">
            <div className="flex items-center gap-2">
              <span>© 2025 Zigex Platform.</span>
              <span className="hidden md:inline text-white/10">|</span>
              <span>Built for the next generation of African talent.</span>
            </div>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
