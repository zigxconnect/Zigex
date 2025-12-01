"use client";

import { useState } from "react";
import { X, Download, Save, Eye, RotateCcw, Send } from "lucide-react";
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

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

  const handleResetContent = () => {
    if (confirm("Are you sure you want to reset to the original content?")) {
      setContent(initialContent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto pb-20 md:pb-0">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md md:max-w-4xl my-4 md:my-8 max-h-[90vh] md:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 line-clamp-2">
              Edit Application
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">
              {companyName} • {opportunityTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} className="text-gray-500 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 border-b border-gray-200 pb-4">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                !isPreviewMode
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isPreviewMode
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>

          {/* Edit Mode */}
          {!isPreviewMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Application Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Enter your application content..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {content.length} characters
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> You can freely edit the content before
                  submitting. Make sure to personalize it further if needed!
                </p>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {isPreviewMode && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {applicationTitle}
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-semibold text-red-900 text-sm">Error</p>
                <p className="text-red-700 text-xs mt-1">{submitError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-semibold text-sm md:text-base"
          >
            <Download size={16} className="md:w-5 md:h-5" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all font-semibold text-sm md:text-base"
            >
              <Send size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">{isSubmitting ? "Submitting..." : "Submit"}</span>
              <span className="sm:hidden">{isSubmitting ? "..." : "OK"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
