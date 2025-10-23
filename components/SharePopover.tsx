"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Linkedin, Link2, Check, X, MessageCircle, Facebook } from "lucide-react";

// Custom X (Twitter) Icon
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
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalIdRef = useRef(`share-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${urlPath}`);
  }, [urlPath]);

  useEffect(() => {
    if (isOpen) {
      // Close other modals
      window.dispatchEvent(new CustomEvent('close-share-modals', { 
        detail: { exceptId: modalIdRef.current } 
      }));
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
      setDragY(0);
      setIsDragging(false);
    }
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClose = (e: CustomEvent) => {
      if (e.detail?.exceptId !== modalIdRef.current && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('close-share-modals', handleClose as EventListener);
    return () => window.removeEventListener('close-share-modals', handleClose as EventListener);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const diff = touch.clientY - startY;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  if (!fullUrl) return null;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(`Check out this: ${title}`);

  const socialLinks = [
    {
      name: "WhatsApp",
      Icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      gradient: "from-emerald-400 via-emerald-500 to-green-600",
    },
    {
      name: "X",
      Icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      gradient: "from-gray-700 via-gray-800 to-black",
    },
    {
      name: "Facebook",
      Icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      gradient: "from-blue-500 via-blue-600 to-blue-700",
    },
    {
      name: "LinkedIn",
      Icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      gradient: "from-sky-500 via-blue-500 to-blue-600",
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="rounded-lg flex-shrink-0 transition-all duration-150 active:scale-90 hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <Share2 size={16} />
        <span className="sr-only">Share</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-[fadeIn_0.25s_ease-out]"
            onClick={handleClose}
            style={{
              touchAction: 'none',
            }}
          />

          {/* Mobile Bottom Sheet */}
          <div
            className="md:hidden absolute inset-x-0 bottom-0 animate-[slideUpMobile_0.4s_cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bg-white rounded-t-[32px] shadow-2xl max-w-lg mx-auto">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pt-4 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Share</h3>
                    <p className="text-sm text-gray-500 mt-1">Spread the word</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="px-6 pb-5">
                <div className="grid grid-cols-4 gap-4">
                  {socialLinks.map(({ name, Icon, url, gradient }, idx) => (
                    <button
                      key={name}
                      className="flex flex-col items-center gap-2.5 group"
                      style={{
                        animation: `popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05 + idx * 0.05}s backwards`
                      }}
                      onClick={() => {
                        window.open(url, "_blank", "noopener,noreferrer");
                        handleClose();
                      }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-[20px] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-active:scale-95`}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Copy Link */}
              <div className="px-6 py-6 pb-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-3 border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Link</p>
                    <p className="text-sm text-gray-900 truncate font-mono">{fullUrl}</p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all ${
                      copied
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                        : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {copied ? <Check size={18} strokeWidth={3} /> : <Link2 size={18} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Modal */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-[scaleIn_0.3s_cubic-bezier(0.32,0.72,0,1)]">
            <div className="bg-white rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="px-6 pt-6 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Share</h3>
                    <p className="text-sm text-gray-500 mt-1">Spread the word</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="px-6 pb-5">
                <div className="grid grid-cols-4 gap-4">
                  {socialLinks.map(({ name, Icon, url, gradient }, idx) => (
                    <button
                      key={name}
                      className="flex flex-col items-center gap-2.5 group"
                      style={{
                        animation: `popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05 + idx * 0.05}s backwards`
                      }}
                      onClick={() => {
                        window.open(url, "_blank", "noopener,noreferrer");
                        handleClose();
                      }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-[20px] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-active:scale-95`}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Copy Link */}
              <div className="px-6 py-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-3 border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Link</p>
                    <p className="text-sm text-gray-900 truncate font-mono">{fullUrl}</p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all ${
                      copied
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                        : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {copied ? <Check size={18} strokeWidth={3} /> : <Link2 size={18} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 animate-[toastBounce_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
                <span className="font-bold text-base whitespace-nowrap">Link copied!</span>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUpMobile {
          from { 
            transform: translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from { 
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          to { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes popIn {
          0% { 
            transform: scale(0.5);
            opacity: 0;
          }
          50% { 
            transform: scale(1.1);
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes toastBounce {
          0% { 
            transform: translate(-50%, -150%);
            opacity: 0;
          }
          60% { 
            transform: translate(-50%, 10px);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};