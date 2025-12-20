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
          <div class="bg-white text-foreground rounded-2xl px-6 py-5 shadow-2xl max-w-sm border border-success/30 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <p class="font-black text-lg leading-tight uppercase tracking-tight">Submitted</p>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">Will be reviewed shortly</p>
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
          <div class="bg-white text-foreground rounded-2xl px-6 py-5 shadow-2xl max-w-sm border border-success/30 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <p class="font-black text-lg leading-tight uppercase tracking-tight">Submitted</p>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">Will be reviewed shortly</p>
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
            <h2 className="text-xl md:text-2xl font-black text-foreground line-clamp-2 uppercase tracking-tight">{draft.title}</h2>
            <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1.5 opacity-70">
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
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1 overflow-y-auto">
          {/* Smart Apply Benefits Banner - More professional */}
          <div className="relative overflow-hidden rounded-2xl bg-muted/30 p-5 border border-border">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                  Fast-Track Review
                </h3>
                <p className="text-muted-foreground text-xs font-medium">
                  Smart applications are prioritized for immediate review.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-card border border-primary/20 rounded-xl px-4 py-2 text-center min-w-[100px]">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Priority</p>
                  <p className="text-lg font-black text-primary leading-none">2 HRS</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-2 text-center min-w-[100px] opacity-50">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Standard</p>
                  <p className="text-lg font-black text-muted-foreground leading-none">48 HRS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Points */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Personalized Strengths
            </h3>
            <div className="space-y-2">
              {draft.personalizedPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-muted/20 rounded-xl border border-border"
                >
                  <div className="text-primary font-black flex-shrink-0">✓</div>
                  <p className="text-sm text-foreground font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Highlights */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Application Highlights
            </h3>
            <div className="space-y-2">
              {draft.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10"
                >
                  <div className="text-primary font-black flex-shrink-0">
                    ★
                  </div>
                  <p className="text-sm text-foreground font-medium">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Content */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Full Statement
            </h3>
            <div className="bg-muted/30 rounded-xl p-5 border border-border whitespace-pre-wrap text-sm text-foreground leading-relaxed font-medium">
              {draft.content}
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="flex gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-black text-destructive text-sm uppercase tracking-tight">
                  Submission Error
                </p>
                <p className="text-destructive/80 text-xs mt-1 font-medium">{submitError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-black uppercase tracking-widest text-[10px] md:text-xs"
            >
              {isCopied ? (
                <>
                  <Check size={16} className="md:w-5 md:h-5 text-success" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="md:w-5 md:h-5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-black uppercase tracking-widest text-[10px] md:text-xs"
            >
              <Edit size={16} className="md:w-5 md:h-5" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-primary hover:bg-primary/90 disabled:bg-muted-foreground/30 text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-primary/20"
            >
              <Send size={16} className="md:w-5 md:h-5" />
              <span>{isSubmitting ? "Wait..." : "Submit"}</span>
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
