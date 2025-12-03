"use client";

import { Check } from "lucide-react";

type Step = {
  number: number;
  title: string;
};

type MobileStepperProps = {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
};

export const MobileStepper = ({
  currentStep,
  totalSteps,
  steps,
}: MobileStepperProps) => {
  const progress = (currentStep / totalSteps) * 100;
  const currentStepData = steps.find((s) => s.number === currentStep);

  return (
    <div className="md:hidden bg-white sticky top-0 z-20 border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {Math.round(progress)}% Completed
          </span>
        </div>
        {/* Custom Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
            {currentStep}
          </div>
          <h1 className="text-sm font-bold text-gray-900 truncate">
            {currentStepData?.title || "Create Profile"}
          </h1>
        </div>
      </div>
    </div>
  );
};
