// components/feed/detail/ApplyButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ApplicationModal from "./Modal";
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
}

export function ApplyButton({
  isOpen,
  reason,
  type,
  id,
  title,
  fullWidth = false,
  buttonText = "Apply Now",
}: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (!isOpen) {
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
      <Button
        onClick={() => setShowModal(true)}
        className={cn(
          "text-base font-bold rounded-xl",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "border-0 group relative overflow-hidden",
          fullWidth ? "w-full p-6" : "w-full p-6"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {buttonText}
          <ExternalLink
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </span>
      </Button>

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
    </>
  );
}

