"use client";

import Link from "next/link";
import { Linkedin, MessageCircle } from "lucide-react";

interface AnimatedConnectButtonsProps {
  linkedinUrl?: string | null;
  whatsappUrl?: string | null;
}

export default function AnimatedConnectButtons({
  linkedinUrl,
  whatsappUrl,
}: AnimatedConnectButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* LinkedIn Connect Button */}
      {linkedinUrl ? (
        <Link
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-primary/5 text-primary rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          title="Connect on LinkedIn"
        >
          <Linkedin size={18} />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center w-10 h-10 bg-muted text-muted-foreground/30 rounded-full border border-border cursor-not-allowed"
        >
          <Linkedin size={18} />
        </button>
      )}

      {/* WhatsApp Message Button */}
      {whatsappUrl ? (
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-success/5 text-success rounded-full border border-success/20 hover:bg-success hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          title="Message on WhatsApp"
        >
          <MessageCircle size={18} />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center w-10 h-10 bg-muted text-muted-foreground/30 rounded-full border border-border cursor-not-allowed"
        >
          <MessageCircle size={18} />
        </button>
      )}
    </div>
  );
}