"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, CheckCircle2, AlertCircle, Zap, Loader } from "lucide-react";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { cn } from "@/lib/utils";
import ApplicationModal from "./Modal";
import { SmartApplyPreview } from "./SmartApplyPreview";
import { generateSmartApplicationDraft } from "@/lib/actions/feed/smart-apply.actions";
import { MonetbilPaymentModal } from "@/components/payment/MonetbilPaymentModal";

interface ApplyButtonProps {
  isOpen: boolean;
  reason?: string;
  type: "internship" | "program" | "event";
  id: string;
  title: string;
  fullWidth?: boolean;
  buttonText?: string;
  opportunityData?: any;
}

interface Draft {
  title: string;
  content: string;
  highlights: string[];
  personalizedPoints: string[];
}

export function ApplyButton({ 
  isOpen, 
  reason, 
  type, 
  id, 
  title, 
  fullWidth = false, 
  buttonText = "Apply Now",
  opportunityData
}: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showSmartPreview, setShowSmartPreview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // New state for payment
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingError, setGeneratingError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  // Triggered when user clicks "Smart Apply"
  const handleSmartApplyClick = () => {
    setShowPaymentModal(true);
  };

  // Triggered after successful payment
  const handlePaymentSuccess = async () => {
    // For prototyping: Just confirm payment without generating
    console.log("Payment successful for opportunity:", id);
    // In a real app, you would verify the transaction here
  };

  if (!isOpen) {
    // ... existing closed state return
    return (
      <div className={fullWidth ? "w-full" : ""}>
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-900 text-sm">Applications Closed</p>
              <p className="text-red-700 text-xs mt-1">{reason}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed bottom buttons container - Mobile only */}
      <div className="fixed bottom-16 md:static left-0 right-0 z-40 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 md:border-gray-200 shadow-2xl md:shadow-none md:mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 md:space-y-4">
          {/* Apply Now Button */}
          <button
            onClick={() => setShowModal(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="
              w-full relative overflow-hidden flex items-center justify-center gap-2 
              px-6 py-4 rounded-lg font-semibold text-base 
              transition-all duration-300 
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              text-white
              shadow-lg hover:shadow-xl
              transform hover:scale-[1.02] active:scale-[0.98]
              group
            "
          >
            {/* ... existing Apply Now button content ... */}
            <span
              className={`
                absolute inset-0 bg-blue-400
                ${isHovered ? "animate-ping opacity-20" : "opacity-0"}
              `}
            />

            <span
              className={`
                absolute inset-0 -translate-x-full
                bg-gradient-to-r from-transparent via-white/30 to-transparent
                ${isHovered ? "animate-shimmer" : ""}
              `}
            />

            <span className="relative z-10 flex items-center justify-center gap-2">
              Apply Now
              <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Smart Apply Button */}
          <button
            onClick={handleSmartApplyClick}
            disabled={isGenerating}
            className="
              w-full relative overflow-hidden flex items-center justify-center gap-2 
              px-6 py-4 rounded-lg font-semibold text-base 
              transition-all duration-300 
              bg-gradient-to-r from-orange-500 to-orange-600
              hover:from-orange-600 hover:to-orange-700
              disabled:from-orange-400 disabled:to-orange-500
              text-white
              shadow-md hover:shadow-lg
              transform hover:scale-[1.02] disabled:hover:scale-100 active:scale-[0.98]
              group
            "
          >
            {/* ... existing Smart Apply button content ... */}
            <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity" />

            <span className="relative z-10 flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Zap size={18} className="group-hover:animate-pulse" />
                  Smart Apply with AI
                </>
              )}
            </span>
          </button>

          {/* Error Message */}
          {generatingError && (
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-red-900 text-xs">{generatingError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <ApplicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={type}
          id={id}
          title={title}
        />
      )}

      {/* Payment Modal */}
      <MonetbilPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={1000} // Set your price here (e.g., 1000 XAF)
      />

      {/* Smart Apply Preview Modal */}
      <SmartApplyPreview
        isOpen={showSmartPreview}
        onClose={() => setShowSmartPreview(false)}
        draft={draft}
        opportunityId={id}
        opportunityTitle={title}
        opportunityType={type}
        companyName={opportunityData?.company_profiles?.company_name || "Company"}
        companyEmail={opportunityData?.company_profiles?.email || ""}
      />
    </>
  );
}


