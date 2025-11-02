"use client";

import React, { useState, useEffect } from "react";
import { QrCode, X, Download, Linkedin, MessageCircle, Mail, Share2 } from "lucide-react";
import Link from "next/link";

interface QRCodeButtonProps {
  linkedinUrl?: string | null;
  whatsappUrl?: string | null;
  email?: string | null;
  fullName?: string | null;
  profileUrl: string;
}

export default function QRCodeButton({ 
  linkedinUrl, 
  whatsappUrl, 
  email, 
  fullName,
  profileUrl 
}: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && !qrCodeDataUrl) {
      // Generate QR code using API
      const qrData = encodeURIComponent(profileUrl);
      setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&bgcolor=ffffff&color=000000`);
    }
  }, [isOpen, profileUrl, qrCodeDataUrl]);
 
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullName || 'profile'}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }; 

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connect with ${fullName || 'me'}`,
          text: `Check out ${fullName || 'this'}'s profile on ZigeX!`,
          url: profileUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    }
  };

  return (
    <>
      {/* QR Code Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-xl border-2 border-gray-200 hover:border-blue-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group relative z-10"
        aria-label="Show QR Code"
      >
        <QrCode size={24} className="text-gray-700 group-hover:text-blue-600 transition-colors" />
        
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-xl bg-blue-500 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
      </button>

      {/* Modal Overlay - HIGHEST Z-INDEX */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          style={{ zIndex: 9999 }}
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all duration-300 animate-scaleIn overflow-hidden"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                  <QrCode size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Quick Connect
                </h2>
                <p className="text-sm text-gray-600">
                  Scan to connect with {fullName?.split(' ')[0] || 'me'}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-all duration-200 group"
                aria-label="Close"
              >
                <X size={20} className="text-gray-600 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-200" />
              </button>
            </div>

            {/* QR Code Display */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-6 relative overflow-hidden">
                {qrCodeDataUrl ? (
                  <div className="relative">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 rounded-br-xl"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                  </div>
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-blue-400 opacity-20"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  <span>Download QR Code</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Share2 size={20} />
                  <span>Share Profile</span>
                </button>
              </div>

              {/* Quick Connect Links */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  Or connect directly:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* LinkedIn */}
                  {linkedinUrl && (
                    <Link
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-3 bg-[#0A66C2]/10 rounded-xl hover:bg-[#0A66C2]/20 transition-all duration-200 group transform hover:scale-105"
                    >
                      <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Linkedin size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">LinkedIn</span>
                    </Link>
                  )}

                  {/* WhatsApp */}
                  {whatsappUrl && (
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-3 bg-[#25D366]/10 rounded-xl hover:bg-[#25D366]/20 transition-all duration-200 group transform hover:scale-105"
                    >
                      <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <MessageCircle size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                    </Link>
                  )}

                  {/* Email */}
                  {email && (
                    <Link
                      href={`mailto:${email}`}
                      className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all duration-200 group transform hover:scale-105"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Mail size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Email</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Footer Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  📱 Scan this QR code with your phone camera to instantly access the profile
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(280px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
}