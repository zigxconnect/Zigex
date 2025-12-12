import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const FormStepper = ({ steps, currentStep, onStepClick }: FormStepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 -z-10"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isCurrent
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300 absolute -bottom-8 w-32 text-center",
                  isCurrent ? "text-blue-700" : "text-gray-500"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8" /> {/* Spacer for labels */}
    </div>
  );
};
