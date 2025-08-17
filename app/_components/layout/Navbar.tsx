"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="bg-blue-800 px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-white text-lg sm:text-xl font-bold hover:text-blue-100 transition-colors duration-200 flex-shrink-0"
          >
            FutureProspect
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-white hover:text-blue-100 transition-colors duration-200 font-medium ${
                  isActive(item.href) ? "border-b-2 border-white pb-1" : ""
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
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="border border-white text-white hover:bg-white hover:text-blue-800 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
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
                className={`block text-white hover:text-blue-100 hover:bg-blue-700 py-3 px-4 rounded-md transition-colors duration-200 font-medium ${
                  isActive(item.href)
                    ? "bg-blue-700 border-l-4 border-white"
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
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium text-center"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className="block w-full border border-white text-white hover:bg-white hover:text-blue-800 py-3 px-4 rounded-md transition-colors duration-200 font-medium text-center"
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
