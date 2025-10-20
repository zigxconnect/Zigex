"use client";

import React from "react";
import { Linkedin, Mail, Twitter } from "lucide-react";

interface Props {
  linkedin?: string | null;
  whatsapp?: string | null;
  x?: string | null;
  email?: string | null;
}

export const ConnectBar: React.FC<Props> = ({ linkedin, whatsapp, x, email }) => {
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d+]/g, "")}` : null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-3xl px-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">🤝</div>
          <div>
            <p className="text-sm text-gray-700">Connect with me</p>
            <p className="text-xs text-gray-400">Follow or send a message</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="Open LinkedIn profile"
              title="LinkedIn"
              className="p-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0A66C2] text-white">
                <Linkedin className="w-4 h-4" />
              </span>
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Open WhatsApp chat"
              title="WhatsApp"
              className="p-1 rounded-full hover:bg-green-50 transition-colors"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white">
                {/* WhatsApp SVG icon (white) */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.04 2C6.58 2 2 6.58 2 12.04c0 1.98.52 3.83 1.43 5.44L2 22l4.7-1.21A9.98 9.98 0 0012.04 22C17.5 22 22.08 17.42 22.08 11.96 22.08 6.5 17.5 2 12.04 2zm5.06 15.3c-.27.76-1.6 1.45-2.2 1.54-.58.09-1.35.13-3.05-.63-2.26-.99-3.72-3.25-3.84-3.4-.12-.15-1-1.22-1-2.33 0-1.11.6-1.66.82-1.89.22-.23.48-.29.64-.29.16 0 .33 0 .5.01.16.01.37-.06.57.43.2.49.66 1.7.71 1.82.06.12.09.27-.03.43-.12.16-.17.26-.34.41-.17.15-.36.33-.22.64.14.31.62 1.02 1.33 1.64.92.79 1.7 1.05 2.02 1.17.32.12.5.1.69-.06.19-.16.8-.93 1.02-1.26.22-.33.44-.27.73-.16.29.11 1.82.86 2.14 1.02.31.16.52.24.6.37.08.13.08.74-.19 1.5z" fill="white"/>
                </svg>
              </span>
            </a>
          )}

          {x && (
            <a
              href={x}
              target="_blank"
              rel="noreferrer"
              aria-label="Open X profile"
              title="X"
              className="p-1 rounded-full hover:bg-neutral-200 transition-colors"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white">
                <Twitter className="w-4 h-4" />
              </span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              aria-label="Send email"
              title="Email"
              className="p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EA4335] text-white">
                <Mail className="w-4 h-4" />
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectBar;
