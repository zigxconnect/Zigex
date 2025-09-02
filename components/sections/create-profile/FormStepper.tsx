import { Check } from "lucide-react";

type FormStepperProps = {
  currentStep: number;
  totalSteps: number;
};

const steps = [
  { number: 1, title: "Personal Information" },
  { number: 2, title: "Education" },
  { number: 3, title: "Skills" },
  { number: 4, title: "Experience" },
  { number: 5, title: "Additional Info" },
];

/**
 * A desktop-only visual stepper component.
 * It is hidden on mobile to provide a better user experience.
 */
export const FormStepper = ({ currentStep }: FormStepperProps) => {
  return (
    // THE FIX IS HERE: This entire component is now hidden by default and only appears on medium screens and up.
    <div className="hidden md:sticky md:top-12 h-full md:block">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Create Your Profile
      </p>
      <div className="mt-6 space-y-8">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          return (
            <div key={step.number} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    isCompleted ? "bg-orange-500 text-white" : ""
                  } ${
                    isCurrent
                      ? "bg-orange-500 text-white ring-4 ring-orange-200"
                      : ""
                  } ${
                    !isCompleted && !isCurrent
                      ? "bg-gray-200 text-gray-500"
                      : ""
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : step.number}
                </div>
                {step.number < steps.length && (
                  <div
                    className={`w-0.5 h-12 mt-2 transition-colors duration-300 ${
                      isCompleted ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
              <div
                className={`pt-1.5 transition-opacity duration-300 ${
                  isCurrent ? "opacity-100" : "opacity-50"
                }`}
              >
                <h3
                  className={`font-bold ${
                    isCurrent ? "text-gray-900" : "text-gray-600"
                  }`}
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
