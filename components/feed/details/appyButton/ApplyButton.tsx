"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, CheckCircle2, AlertCircle, Zap, Loader, Lock } from "lucide-react";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { cn } from "@/lib/utils";
import ApplicationModal from "./Modal";
import { SmartApplyPreview } from "./SmartApplyPreview";
import { generateSmartApplicationDraft } from "@/lib/actions/feed/smart-apply.actions";
import { WaitingListModal } from "./WaitingListModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [showWaitingList, setShowWaitingList] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingError, setGeneratingError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  // Triggered when user clicks "Smart Apply"
  const handleSmartApplyClick = () => {
    setShowWaitingList(true);
  };

  if (!isOpen) {
    // ... existing closed state return
    return (
      <div className={fullWidth ? "w-full" : ""}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0">
                    <Lock className="text-gray-500 dark:text-gray-400" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Applications Closed
                    </p>
                    {reason && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">
                        {reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{reason || "This opportunity is no longer accepting applications."}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider
              transition-all duration-300
              bg-primary
              hover:bg-secondary
              text-white
              shadow-lg shadow-blue-200/50 hover:shadow-xl
              transform hover:scale-[1.01] active:scale-[0.99]
              group
            "
          >
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
              px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
              transition-all duration-300
              bg-white border border-primary text-primary
              hover:bg-primary/5
              disabled:bg-muted disabled:border-muted-foreground/30
              disabled:text-muted-foreground
              shadow-sm hover:shadow-md
              transform hover:scale-[1.01] disabled:hover:scale-100 active:scale-[0.99]
              group
            "
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} className="text-secondary" />
                  Smart Apply
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

      {/* Waiting List Modal */}
      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        opportunityTitle={title}
        opportunityType={type}
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

