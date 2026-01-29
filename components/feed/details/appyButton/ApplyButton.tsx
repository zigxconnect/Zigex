"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, CheckCircle2, AlertCircle, Zap, Loader, Lock, BookOpen, ChevronRight, Clock } from "lucide-react";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { cn } from "@/lib/utils";
import ApplicationModal from "./Modal";
import InternshipApplicationModal from "./InternshipApplicationModal";
import { SmartApplyPreview } from "./SmartApplyPreview";
import { generateSmartApplicationDraft } from "@/lib/actions/feed/smart-apply.actions";
import { WaitingListModal } from "./WaitingListModal";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApplicationStatus {
  hasApplied: boolean;
  status: string | null;
  paymentCompleted?: boolean;
  applicationId?: string;
}

interface ApplyButtonProps {
  isOpen: boolean;
  reason?: string;
  type: "internship" | "program" | "event";
  id: string;
  title: string;
  fullWidth?: boolean;
  buttonText?: string;
  opportunityData?: any;
  applicationStatus?: ApplicationStatus;
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
  opportunityData,
  applicationStatus
}: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
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
  
  const handleApplyClick = () => {
    if (type === "internship") {
      setShowInternshipModal(true);
    } else {
      setShowModal(true);
    }
  };

  // Check if user is accepted
  const isAccepted = applicationStatus?.hasApplied && applicationStatus?.status === "accepted";
  const isUnderReview = applicationStatus?.hasApplied && 
    (applicationStatus?.status === "pending" || 
     applicationStatus?.status === "reviewing" || 
     applicationStatus?.status === "reviewed");


  // If user is accepted, show the "View Updates" button
  if (isAccepted) {
// ... (keep existing accepted logic)
    const updatesUrl = type === "program" 
      ? `/programs/${id}/updates` 
      : type === "internship" 
        ? `/intern/workspace` 
        : `/events/${id}`;

    const buttonLabel = type === "internship" 
      ? "Visit Your Internship Dashboard" 
      : type === "program" 
        ? "View Program Updates" 
        : "View Event Details";

    return (
      <div className={fullWidth ? "w-full" : ""}>
        <div className="fixed bottom-16 md:static left-0 right-0 z-40 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 md:border-gray-200 shadow-2xl md:shadow-none md:mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 md:space-y-4">
            {/* Accepted Status - View Program Updates */}
            <Link href={updatesUrl} className="block">
              <button
                className="
                  w-full relative overflow-hidden flex items-center justify-center gap-2 
                  px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider
                  transition-all duration-300
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  text-white
                  shadow-lg shadow-blue-200/50 hover:shadow-xl
                  transform hover:scale-[1.01] active:scale-[0.99]
                  group cursor-pointer
                "
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <BookOpen size={18} />
                  {buttonLabel}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>

            {/* Congrats Message */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">You're In!</p>
                  <p className="text-blue-700 text-xs">
                    Congratulations! Access your curriculum, updates, and resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has a pending application, show "Under Review" status
  if (isUnderReview) {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        <div className="fixed bottom-16 md:static left-0 right-0 z-40 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 md:border-gray-200 shadow-2xl md:shadow-none md:mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 md:space-y-4">
            {/* Pending Status */}
            <button
              disabled
              className="
                w-full relative overflow-hidden flex items-center justify-center gap-2 
                px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider
                bg-amber-100 text-amber-700 border-2 border-amber-200
                cursor-not-allowed
              "
            >
              <Clock size={18} />
              Application In Review
            </button>

            {/* Info Message */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Under Review</p>
                  <p className="text-amber-700 text-xs">
                    Feedback will be given as soon as reviews are done.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for deadline
  const deadline = opportunityData?.deadline;
  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;

  if (isDeadlinePassed) {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0">
                    <X className="text-gray-500 dark:text-gray-400" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Applications Closed
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">
                      The deadline ({new Date(deadline).toLocaleDateString()}) has passed.
                    </p>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This opportunity is no longer accepting applications.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (!isOpen) {
    // ... rest of closed logic
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
            onClick={handleApplyClick}
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

      {/* Internship Specific Modal */}
      {showInternshipModal && (
        <InternshipApplicationModal
          isOpen={showInternshipModal}
          onClose={() => setShowInternshipModal(false)}
          internshipId={id}
          internshipTitle={title}
          companyName={opportunityData?.company_profiles?.company_name || "Company"}
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

