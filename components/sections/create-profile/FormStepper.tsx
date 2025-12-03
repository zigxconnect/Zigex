import { Check } from "lucide-react";
import clsx from "clsx";

export type Step = {
  number: number;
  title: string;
  description?: string;
};

type FormStepperProps = {
  currentStep: number;
  steps: Step[];
};

export const FormStepper = ({ currentStep, steps }: FormStepperProps) => {
  return (
    <div className="hidden md:block h-full">
      <div className="sticky top-24">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create Your Profile
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Follow these steps to build a professional profile that stands out to
            employers.
          </p>
        </div>

        <div className="relative">
          {/* Continuous Vertical Line Background */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-100" />

          <div className="space-y-0">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number} className="relative flex gap-6 pb-8">
                  {/* Step Indicator */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2",
                        {
                          "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110":
                            isCurrent,
                          "bg-blue-50 border-blue-500 text-blue-600":
                            isCompleted,
                          "bg-white border-gray-200 text-gray-400":
                            !isCompleted && !isCurrent,
                        }
                      )}
                    >
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        step.number
                      )}
                    </div>
                    {/* Active Line Segment */}
                    {!isLast && isCompleted && (
                      <div className="absolute top-10 bottom-[-32px] w-0.5 bg-blue-500 transition-all duration-500" />
                    )}
                  </div>

                  {/* Text Content */}
                  <div
                    className={clsx(
                      "pt-1.5 transition-all duration-500",
                      isCurrent ? "opacity-100 translate-x-0" : "opacity-60"
                    )}
                  >
                    <h3
                      className={clsx(
                        "font-bold text-base transition-colors duration-300",
                        isCurrent ? "text-blue-700" : "text-gray-700"
                      )}
                    >
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
