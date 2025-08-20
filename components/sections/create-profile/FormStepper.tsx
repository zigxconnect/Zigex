type FormStepperProps = {
  currentStep: number;
  totalSteps: number;
};

const steps = [
  {
    number: 1,
    title: "Personal Information",
    subtitle:
      "Please fill in your personal information to create your student profile.",
  },
  { number: 2, title: "Education", subtitle: "Tell us about your education." },
  { number: 3, title: "Skills", subtitle: "List your skills." },
  {
    number: 4,
    title: "Experience",
    subtitle: "Add your previous work experience.",
  },
  {
    number: 5,
    title: "Additional Info",
    subtitle: "Let us know more about you.",
  },
];

/**
 * FormStepper Component
 * This component displays the current step information with improved, professional styling.
 */
export const FormStepper = ({ currentStep }: FormStepperProps) => {
  const currentStepInfo =
    steps.find((step) => step.number === currentStep) || steps[0];

  return (
    <div className="md:sticky md:top-12 h-full">
      {/*
        THE FIX IS HERE:
        - The top label is now uppercase with letter spacing for a premium feel.
        - The main title uses a dark, readable text color for the static part.
        - The orange color is applied ONLY to the dynamic part of the title.
        - The subtitle has more relaxed line spacing for readability.
      */}
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        STUDENT PROFILE
      </p>
      <h2 className="mt-4 text-4xl font-bold text-gray-900">
        Step {currentStepInfo.number}:{" "}
        <span className="text-orange-500">{currentStepInfo.title}</span>
      </h2>
      <p className="mt-4 text-gray-600 leading-relaxed">
        {currentStepInfo.subtitle}
      </p>
    </div>
  );
};
