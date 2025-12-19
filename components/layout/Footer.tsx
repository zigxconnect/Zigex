import React from "react";
import { FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 px-6 mt-0 mx-0">
      <div className="max-w-7xl flex flex-col md:flex-row gap-10 md:gap-[12rem] p-2">
        <div className="md:w-[26rem]">
          <h3 className="text-2xl font-bold">FutureProspect</h3>
          <p className="text-secondary-foreground/80 mt-2 text-[14px]">
            Connecting talented individuals with amazing internship
            opportunities in Bamenda and beyond. Your future starts here.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#">
              <FaLinkedin className="w-7 h-7 p-1 text-primary-foreground text-[24px] bg-primary align-middle rounded-md"/>
            </a>
            <a href="#">
              <FaTwitter
                className="w-7 h-7 p-1  text-primary-foreground bg-primary align-middle rounded-md"
              />
            </a>
            <a href="#">
              <FaFacebook
                className="w-7 h-7 p-1  text-primary-foreground  bg-primary align-middle rounded-md"
              />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-secondary-foreground font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-2 text-secondary-foreground/80 text-[16px]">
            <li>
              <a className="tex" href="#">
                Browse Jobs
              </a>
            </li>
            <li>
              <a href="#">Companies</a>
            </li>
            <li>
              <a href="#">Career Advice</a>
            </li>
            <li>
              <a href="#">Success Stories</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-secondary-foreground font-semibold mb-2 text-[16px]">
            Support
          </h4>
          <ul className="space-y-2 text-secondary-foreground/80">
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-secondary-foreground/60 text-[14px] mt-8">
        © 2025 FutureProspect. All rights reserved. Made with ❤ in Bamenda.
      </div>
    </footer>
  );
};
