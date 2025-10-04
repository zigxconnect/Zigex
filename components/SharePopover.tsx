"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Linkedin, Link2, Check, X, MessageCircle, Facebook } from "lucide-react";

// Custom X (Twitter) Icon using lucide style
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

interface SharePopoverProps {
  title: string;
  urlPath: string;
}

export const SharePopover = ({ title, urlPath }: SharePopoverProps) => {
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${urlPath}`);
  }, [urlPath]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!fullUrl) return null;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(`Check out this: ${title}`);

  const socialLinks = [
    {
      name: "WhatsApp",
      Icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bgColor: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-600",
    },
    {
      name: "X",
      Icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bgColor: "bg-gray-900",
      hoverColor: "hover:bg-black",
    },
    {
      name: "Facebook",
      Icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    {
      name: "LinkedIn",
      Icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      bgColor: "bg-sky-600",
      hoverColor: "hover:bg-sky-700",
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2500);
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes slideUpDesktop {
            from { transform: translate(-50%, -40%); opacity: 0; scale: 0.95; }
            to { transform: translate(-50%, -50%); opacity: 1; scale: 1; }
          }
          @keyframes toastSlideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .animate-toastSlideDown { animation: toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          @media (min-width: 768px) {
            .animate-slideUpDesktop { animation: slideUpDesktop 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          }
        `
      }} />

      <Button
        variant="outline"
        size="icon"
        className="rounded-lg flex-shrink-0"
        onClick={() => setIsOpen(true)}
      >
        <Share2 size={16} />
        <span className="sr-only">Share</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Modal */}
          <div
            className="fixed z-50 left-1/2 -translate-x-1/2 w-[90%] max-w-md
                       bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2
                       bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden
                       animate-slideUp md:animate-slideUpDesktop"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Share</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Spread the word
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Social Links Grid */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-4 gap-3">
                {socialLinks.map(({ name, Icon, url, bgColor, hoverColor }) => (
                  <button
                    key={name}
                    className="flex flex-col items-center gap-2 group"
                    onClick={() => {
                      window.open(url, "_blank", "noopener,noreferrer");
                      setIsOpen(false);
                    }}
                  >
                    <div
                      className={`w-14 h-14 ${bgColor} ${hoverColor} rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Page Link
                  </p>
                  <p className="text-sm text-gray-900 truncate font-mono">
                    {fullUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {copied ? (
                    <div className="flex items-center gap-1.5">
                      <Check size={16} />
                      <span>Copied</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Link2 size={16} />
                      <span>Copy</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Toast Notification */}
          {showToast && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-toastSlideDown">
              <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
                <Check size={18} className="text-emerald-400" />
                <span className="font-medium">Link copied to clipboard!</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};