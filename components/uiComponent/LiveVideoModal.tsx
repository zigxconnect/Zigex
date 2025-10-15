import React, { useState, useEffect } from 'react';
import { X, Users, Maximize2, Minimize2 } from 'lucide-react';

interface LiveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  company: string;
  description: string;
  thumbnail: string;
  viewerCount: number;
}

export const LiveVideoModal: React.FC<LiveVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  company,
  description,
  thumbnail,
  viewerCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animatedViewers, setAnimatedViewers] = useState(viewerCount);

  // Extract Vimeo video ID from URL
  const getVimeoId = (url: string) => {
    // Handle different Vimeo URL formats
    const patterns = [
      /vimeo\.com\/video\/(\d+)/,
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const vimeoId = getVimeoId(videoUrl);

  // Animate viewer count
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setAnimatedViewers(prev => {
        const change = Math.floor(Math.random() * 10) - 4;
        return Math.max(100, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

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

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div 
        className={`relative bg-gray-900 rounded-none sm:rounded-2xl shadow-2xl w-full transition-all duration-300 ${
          isFullscreen 
            ? 'h-full max-w-full' 
            : 'h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:m-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-800 sm:rounded-t-2xl border-b border-gray-700">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-red-600 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs sm:text-sm font-semibold">LIVE</span>
            </div>
            
            {/* Viewer Count */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-300 flex-shrink-0">
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                {animatedViewers.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors hidden sm:block"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-300" />
              ) : (
                <Maximize2 size={18} className="text-gray-300" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`overflow-y-auto ${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[calc(100%-60px)] sm:max-h-[calc(90vh-60px)]'}`}>
          {/* Video Container */}
          <div className="relative w-full bg-black">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {vimeoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=0&autopause=0&muted=0&title=0&byline=0&portrait=0`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center p-4">
                    <div className="text-gray-400 mb-2">Unable to load video</div>
                    <div className="text-sm text-gray-500">Invalid Vimeo URL</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 sm:p-6 bg-gray-900">
            <div className="space-y-3 sm:space-y-4">
              {/* Title and Company */}
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                  {title}
                </h2>
                <p className="text-sm sm:text-base text-gray-400">{company}</p>
              </div>

              {/* Description */}
              <div className="pt-3 sm:pt-4 border-t border-gray-800">
                <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
                  About this stream
                </h3>
                <div 
                  className="text-xs sm:text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors">
                  Apply Now
                </button>
                <button className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors">
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Custom scrollbar for desktop */
        @media (min-width: 640px) {
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1f2937;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        }
      `}</style>
    </div>
  );
};