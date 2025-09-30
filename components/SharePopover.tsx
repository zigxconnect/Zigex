"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator"; // <-- New import
import { Share2, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";

// --- Custom SVG Icons for accurate branding ---

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12.06 0C5.4 0 0 5.4 0 12.06c0 3.48 1.44 6.6 3.78 8.76L0 24l3.3-3.66c2.1 1.44 4.56 2.22 7.14 2.22 6.66 0 12.06-5.4 12.06-12.06S18.72 0 12.06 0zm0 0c0 0 0 0 0 0zm0 0c0 0 0 0 0 0zm5.22 16.32c-.3-.18-1.8- .9-2.1-1.02-.3-.12-.54-.18-.78.18s-.84 1.02-.96 1.2c-.18.18-.3.24-.6.12-.3-.12-1.2-.42-2.34-1.44-.84-.78-1.38-1.74-1.56-2.04-.18-.3-.06-.54.06-.66.12-.12.24-.3.36-.48.12-.12.18-.24.24-.42.12-.18.06-.36 0-.54s-.78-1.8-.96-2.52c-.18-.6-.36-.54-.54-.54-.12 0-.3-.06-.48-.06s-.42 0-.66.12c-.24.18-.9  .84-1.14 2.1-.24 1.2.12 2.4.18 2.58.06.18 1.8 2.82 4.32 3.78 2.52.96 2.52.66 2.94.6.42-.06 1.8-.78 2.04-.9.3-.18.3-.3.18-.48zm0 0" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0Z" />
  </svg>
);

interface SharePopoverProps {
  title: string;
  urlPath: string;
}

export const SharePopover = ({ title, urlPath }: SharePopoverProps) => {
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${urlPath}`);
  }, [urlPath]);

  // Don't render server-side
  if (!fullUrl) return null;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(`Check out this: ${title}`);

  // --- Array for social links for easier mapping ---
  const socialLinks = [
    {
      name: "WhatsApp",
      Icon: WhatsAppIcon,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      hoverClasses: "hover:bg-emerald-50 hover:text-emerald-600",
    },
    {
      name: "X (Twitter)",
      Icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      hoverClasses: "hover:bg-gray-100 hover:text-gray-900",
    },
    {
      name: "Facebook",
      Icon: FacebookIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverClasses: "hover:bg-blue-50 hover:text-blue-700",
    },
    {
      name: "LinkedIn",
      Icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      hoverClasses: "hover:bg-sky-50 hover:text-sky-700",
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      const timeoutId = setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg flex-shrink-0"
        >
          <Share2 size={16} />
          <span className="sr-only">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 rounded-xl">
        <div className="space-y-2">
          <p className="font-semibold text-sm text-gray-900 px-2 pt-1">
            Share this post
          </p>
          <div className="flex flex-col gap-1">
            {socialLinks.map(({ name, Icon, url, hoverClasses }) => (
              <Button
                key={name}
                variant="ghost"
                className={`w-full justify-start font-medium text-gray-700 ${hoverClasses}`}
                onClick={() =>
                  window.open(url, "_blank", "noopener,noreferrer")
                }
              >
                <Icon className="mr-2.5 h-4 w-4 fill-current" />
                {name}
              </Button>
            ))}
          </div>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start font-medium text-gray-700 hover:bg-gray-100"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="mr-2.5 h-4 w-4 text-emerald-500" />
            ) : (
              <LinkIcon className="mr-2.5 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
