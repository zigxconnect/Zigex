"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

interface NavItem {
  name: string;
  href: string;
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "#" },
    { name: "Companies", href: "#" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "#" },
  ];

  const isActive = (href: string): boolean => {
    return pathname === href;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-primary px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center shadow-md p-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/25 hover:scale-105 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
          >
            <div className="flex items-center">
              <img
                src="https://i.ibb.co/Cp502Yby/logo.png"
                alt="Zigex Logo"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-primary-foreground hover:text-primary-foreground/80 transition-colors duration-200 font-medium ${
                  isActive(item.href) ? "border-b-2 border-primary-foreground pb-1" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <Link
              href="/sign-in"
              className="bg-background text-primary hover:bg-background/90 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`h-6 w-6 transform transition-transform duration-200 ${
                isMobileMenuOpen ? "rotate-90" : ""
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-1">
            {/* Mobile Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/90 py-3 px-4 rounded-md transition-colors duration-200 font-medium ${
                  isActive(item.href)
                    ? "bg-primary-foreground/20 border-l-4 border-primary-foreground"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-3 sm:hidden">
              <Link
                href="/sign-in"
                onClick={closeMobileMenu}
                className="block w-full bg-background text-primary hover:bg-background/90 py-3 px-4 rounded-md transition-colors duration-200 font-medium text-center"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className="block w-full border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary py-3 px-4 rounded-md transition-colors duration-200 font-medium text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
