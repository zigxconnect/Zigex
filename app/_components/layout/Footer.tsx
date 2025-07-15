import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E3A8A] text-[#E2E8F0] py-12 px-6 mt-0">
      <div className="max-w-6xl mx-auto grid gap-17 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-bold">FutureProspect</h3>
          <p className="text-gray-300 mt-2">
            Connecting talented individuals with amazing internship opportunities in Bamenda and beyond.
            Your future starts here.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#"><img src="/twitter.png" alt="Twitter" className="w-7 h-7 p-2 bg-[#EA580C] align-middle rounded-md" /></a>
            <a href="#"><img src="/twitter.png" alt="Twitter" className="w-7 h-7 p-2 bg-[#EA580C] align-middle rounded-md" /></a>
            <a href="#"><img src="/linkedin.png" alt="LinkedIn" className="w-7 h-7 p-2 bg-[#EA580C] align-middle rounded-md" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-[#FFFFFF] font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#">Browse Jobs</a></li>
            <li><a href="#">Companies</a></li>
            <li><a href="#">Career Advice</a></li>
            <li><a href="#">Success Stories</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#FFFFFF] font-semibold mb-2">Support</h4>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-[#E2E8F0] mt-8">
        © 2025 FutureProspect. All rights reserved. Made with ❤ in Bamenda.
      </div>
    </footer>
  );
};