"use client";

import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart,
  ArrowUp
} from "lucide-react";
import { useState, useEffect } from "react";

export const DashboardFooter = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FP</span>
              </div>
              <span className="text-blue-900 font-semibold text-xl">Future Prospect</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering students to discover and secure their dream internships. 
              Build your future with confidence and connect with top companies.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-blue-900 font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/upload-resume" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/applied-internships" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Applied Internships
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/student-directory" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Student Directory
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/track-progress" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Track Progress
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-blue-900 font-semibold text-lg">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-blue-900 font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    123 Education Street<br />
                    University District<br />
                    City, State 12345
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-600 flex-shrink-0" />
                <a 
                  href="tel:+1234567890" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-600 flex-shrink-0" />
                <a 
                  href="mailto:support@futureprospect.com" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  support@futureprospect.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <span>© 2024 Future Prospect. Made with</span>
              <Heart size={14} className="text-red-500 fill-current" />
              <span>for students worldwide.</span>
            </div>
            <div className="text-gray-500 text-sm">
              All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} className="mx-auto" />
        </button>
      )}
    </footer>
  );
};