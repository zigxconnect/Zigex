// components/feed/detail/ApplyButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, CheckCircle2, AlertCircle } from "lucide-react";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { cn } from "@/lib/utils";
import ApplicationModal from "./Modal";

interface ApplyButtonProps {
  isOpen: boolean;
  reason?: string;
  type: "internship" | "program" | "event";
  id: string;
  title: string;
}

export function ApplyButton({ isOpen, reason, type, id, title }: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (!isOpen) {
    return (
      <div className="w-full">
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
      <Button
        onClick={() => setShowModal(true)}
        className={cn(
          "w-full text-base py-6 font-semibold rounded-2xl",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "transform hover:scale-[1.02] active:scale-[0.98]",
          "bg-gradient-to-r from-blue-600 to-indigo-600",
          "hover:from-blue-700 hover:to-indigo-700",
          "border-0 group relative overflow-hidden"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          Apply Now
          <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
        </span>
        
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
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

