"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, Send, GripHorizontal } from "lucide-react";
import { generatePDFFromApplication } from "@/lib/utils/pdf-generator";

interface EditableApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  applicationTitle: string;
  initialContent: string;
  companyName: string;
  opportunityTitle: string;
}

export function EditableApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  applicationTitle,
  initialContent,
  companyName,
  opportunityTitle,
}: EditableApplicationModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(280); // Initial height in pixels
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleSaveAndSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(content);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await generatePDFFromApplication({
        title: applicationTitle,
        content,
        companyName,
        opportunityTitle,
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setSubmitError("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // Drag handle for mobile resize
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = editorHeight;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.max(150, dragStartHeight.current + deltaY);
      const maxHeight = window.innerHeight * 0.7;
      setEditorHeight(Math.min(newHeight, maxHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const charCount = content.length;
  const isContentGood = charCount >= 300 && charCount <= 400;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 md:p-4 pb-20 sm:pb-20 md:pb-4">
      {/* Main Modal - Optimized for no scroll */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[93vh] flex flex-col overflow-hidden">
        
        {/* Header - Elegant gradient background */}
        <div className="flex items-start justify-between p-4 sm:p-5 md:p-7 border-b-2 border-gray-100 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              ✏️ Edit Application
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm md:text-base mt-1">
              {companyName} • {opportunityTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
          >
            <X size={20} className="text-white sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </button>
        </div>

        {/* Main Content - Two column grid, no scrolling needed */}
        <div className="flex-1 overflow-hidden p-4 sm:p-5 md:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 h-full">
            
            {/* Left Column - Editor (2 cols on lg) */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <label className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                    📝 Application Content
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs sm:text-sm px-2.5 py-1 rounded-full font-semibold ${
                      charCount < 300 ? 'bg-yellow-100 text-yellow-700' :
                      charCount > 400 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {charCount} chars
                    </span>
                  </div>
                </div>
                
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 sm:p-4 md:p-5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-mono text-xs sm:text-sm md:text-base leading-relaxed transition-all"
                  style={{ height: `${editorHeight}px` }}
                  placeholder="Edit your application content here..."
                />

                {/* Drag Handle - Only visible on mobile (lg:hidden) */}
                <div 
                  onMouseDown={handleMouseDown}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    dragStartY.current = touch.clientY;
                    dragStartHeight.current = editorHeight;
                    setIsDragging(true);
                  }}
                  className="lg:hidden flex items-center justify-center h-5 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-t-2 border-gray-200 cursor-ns-resize transition-colors group select-none"
                  title="Drag to resize"
                >
                  <GripHorizontal size={16} className="text-blue-600 group-hover:text-blue-700 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Word count progress bar */}
                <div className="mt-2.5 sm:mt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Recommended: 300-400 characters
                    </p>
                    <p className="text-xs sm:text-sm font-bold">
                      {charCount < 300 ? `${300 - charCount} more` : charCount > 400 ? `${charCount - 400} over` : '✓ Perfect'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 pointer-events-none ${
                        charCount < 300 ? 'bg-yellow-500 w-1/2' :
                        charCount > 400 ? 'bg-orange-500 w-full' :
                        'bg-gradient-to-r from-blue-500 to-indigo-500 w-full'
                      }`}
                      style={{ width: `${Math.min((charCount / 400) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview & Info (1 col on lg) */}
            <div className="lg:col-span-1 flex flex-col gap-3 sm:gap-4 min-h-0">
              
              {/* Live Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm flex-1 flex flex-col min-h-0">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                  👁️ Preview
                </h3>
                <div className="flex-1 bg-white rounded-lg p-2.5 sm:p-3 md:p-4 border border-gray-200 overflow-y-auto min-h-0">
                  <p className="text-xs sm:text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {content || "Your content will appear here..."}
                  </p>
                </div>
              </div>

              {/* Quality Indicator */}
              <div className={`rounded-xl border-2 p-3 sm:p-4 md:p-5 transition-all ${
                isContentGood 
                  ? 'bg-green-50 border-green-300' 
                  : charCount < 300 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-orange-50 border-orange-300'
              }`}>
                <p className={`text-xs sm:text-sm md:text-base font-bold ${
                  isContentGood ? 'text-green-900' : charCount < 300 ? 'text-yellow-900' : 'text-orange-900'
                }`}>
                  {isContentGood ? '✅ Content looks great!' : charCount < 300 ? '⏳ Add more details' : '⚠️ A bit too long'}
                </p>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 rounded-xl border-2 border-red-300 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-bold text-red-900">❌ {submitError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 md:p-7 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          
          {/* Download Button - Full Width */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2.5 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md disabled:opacity-50 transition-all font-bold text-sm sm:text-base md:text-lg"
          >
            <Download size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>{isDownloading ? "⏳ Downloading..." : "📄 Download PDF"}</span>
          </button>

          {/* Submit Buttons - Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-xl transition-all font-bold text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg"
            >
              ✕ Cancel
            </button>
            <button
              onClick={handleSaveAndSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all font-bold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              <Send size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>{isSubmitting ? "Sending..." : "Submit"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
