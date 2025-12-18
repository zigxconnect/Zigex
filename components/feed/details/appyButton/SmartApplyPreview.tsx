"use client";

import { useState } from "react";
import { X, Copy, Check, Send, AlertCircle, Edit, Download } from "lucide-react";
import { submitSmartApplication } from "@/lib/actions/feed/smart-apply.actions";
import { EditableApplicationModal } from "./EditableApplicationModal";

interface SmartApplyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  draft: {
    title: string;
    content: string;
    highlights: string[];
    personalizedPoints: string[];
  } | null;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: "internship" | "program" | "event";
  companyName: string;
  companyEmail?: string;
}

export function SmartApplyPreview({
  isOpen,
  onClose,
  draft,
  opportunityId,
  opportunityTitle,
  opportunityType,
  companyName,
  companyEmail,
}: SmartApplyPreviewProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!isOpen || !draft) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEditAndSubmit = async (editedContent: string) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Use fallback email if company email is not available
    const emailToUse = (companyEmail && companyEmail.trim() !== "") 
      ? companyEmail 
      : "iwstechnical7@gmail.com";

    try {
      const result = await submitSmartApplication(
        opportunityId,
        opportunityType,
        editedContent,
        emailToUse,
        opportunityTitle
      );

      if (result.success) {
        // Show success toast with emoji
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 md:bottom-8 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300';
        toast.innerHTML = `
          <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-6 py-4 md:py-5 shadow-2xl max-w-sm border border-green-400">
            <div class="text-center">
              <div class="text-4xl md:text-5xl mb-2">✅</div>
              <p class="font-bold text-base md:text-lg">Application Submitted!</p>
              <p class="text-xs md:text-sm text-green-100 mt-1">Will be reviewed in less than 1 hour</p>
            </div>
          </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4', 'duration-300');
          setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        setTimeout(() => onClose(), 500);
      } else {
        setSubmitError(result.error || "Failed to submit application");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Use fallback email if company email is not available
    const emailToUse = (companyEmail && companyEmail.trim() !== "") 
      ? companyEmail 
      : "iwstechnical7@gmail.com";

    try {
      const result = await submitSmartApplication(
        opportunityId,
        opportunityType,
        draft.content,
        emailToUse,
        opportunityTitle
      );

      if (result.success) {
        // Show success toast with emoji
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 md:bottom-8 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300';
        toast.innerHTML = `
          <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-6 py-4 md:py-5 shadow-2xl max-w-sm border border-green-400">
            <div class="text-center">
              <div class="text-4xl md:text-5xl mb-2">✅</div>
              <p class="font-bold text-base md:text-lg">Application Submitted!</p>
              <p class="text-xs md:text-sm text-green-100 mt-1">Will be reviewed in less than 1 hour</p>
            </div>
          </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4', 'duration-300');
          setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        setTimeout(() => onClose(), 500);
      } else {
        setSubmitError(result.error || "Failed to submit application");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto pb-20 md:pb-0">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md md:max-w-2xl my-4 md:my-8 max-h-[90vh] md:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 line-clamp-2">{draft.title}</h2>
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
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 overflow-y-auto">
          {/* Smart Apply Benefits Banner */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 p-4 md:p-5 border border-orange-300 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-300 rounded-full -mr-12 -mt-12 opacity-20" />
            <div className="relative z-10">
              <h3 className="font-bold text-white text-base md:text-lg mb-2 flex items-center gap-2">
                ⚡ Smart Apply Advantage
              </h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white/90 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm font-semibold text-orange-900 mb-1">
                    Smart Apply
                  </p>
                  <p className="text-lg md:text-xl font-bold text-orange-600">2 Hours</p>
                  <p className="text-xs text-gray-600">Review time</p>
                </div>
                <div className="bg-white/90 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Manual Apply
                  </p>
                  <p className="text-lg md:text-xl font-bold text-gray-600">48 Hours</p>
                  <p className="text-xs text-gray-600">Review time</p>
                </div>
              </div>
              <p className="text-white text-xs md:text-sm mt-3 font-medium">
                💡 Don't be 1 hour late! Smart Apply gets your application reviewed in just 2 hours.
              </p>
            </div>
          </div>

          {/* Personalized Points */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Why You're Perfect for This Role
            </h3>
            <div className="space-y-2">
              {draft.personalizedPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="text-blue-600 font-bold flex-shrink-0">✓</div>
                  <p className="text-sm text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Highlights */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Key Highlights
            </h3>
            <div className="space-y-2">
              {draft.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <div className="text-purple-600 font-bold flex-shrink-0">
                    ★
                  </div>
                  <p className="text-sm text-gray-700">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Content */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Full Application
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {draft.content}
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900 text-sm">
                  Error submitting application
                </p>
                <p className="text-red-700 text-xs mt-1">{submitError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm md:text-base"
            >
              {isCopied ? (
                <>
                  <Check size={16} className="md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm md:text-base"
            >
              <Edit size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={handleSubmit}
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

      {/* Edit Modal */}
      <EditableApplicationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditAndSubmit}
        applicationTitle={draft.title}
        initialContent={draft.content}
        companyName={companyName}
        opportunityTitle={opportunityTitle}
      />
    </div>
  );
}
