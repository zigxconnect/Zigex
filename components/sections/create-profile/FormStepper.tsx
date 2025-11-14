import { Check } from "lucide-react";
import clsx from "clsx";

type FormStepperProps = {
  currentStep: number;
  totalSteps?: number;
};

const steps = [
  { number: 1, title: "Personal Information" },
  { number: 2, title: "Education" },
  { number: 3, title: "Skills" },
  { number: 4, title: "Experience" },
  { number: 5, title: "Additional Info" },
];

export const FormStepper = ({ currentStep }: FormStepperProps) => {
  return (
    <div className="hidden md:sticky md:top-24 h-full md:block">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Create Your Profile
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Complete the steps to build a standout profile for employers.
      </p>
      <div className="space-y-6">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          return (
            <div key={step.number} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                    {
                      "bg-blue-500 text-white": isCompleted,
                      "bg-blue-500 text-white ring-4 ring-blue-200": isCurrent,
                      "bg-gray-200 text-gray-500": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? <Check size={20} /> : step.number}
                </div>
                {step.number < steps.length && (
                  <div
                    className={clsx(
                      "w-0.5 h-12 mt-2 transition-colors duration-300",
                      isCompleted ? "bg-blue-500" : "bg-gray-200"
                    )}
                  ></div>
                )}
              </div>
              <div
                className={clsx(
                  "pt-1.5 transition-opacity duration-300",
                  isCurrent ? "opacity-100" : "opacity-75"
                )}
              >
                <h3
                  className={clsx(
                    "font-bold transition-colors duration-300",
                    isCurrent ? "text-blue-600" : "text-gray-700"
                  )}
                >
                  {step.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
