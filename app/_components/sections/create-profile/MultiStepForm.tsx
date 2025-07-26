"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/Button";
import { FormStepper } from "./FormStepper";
import { Step1Personal } from "./Step1Personal";
import { Step2Education } from "./Step2Education";
import { Step3Skills } from "./Step3Skills";
import { Step4Experience } from "./Step4Experience";
import { Step5Additional } from "./Step5Additional";

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const totalSteps = 5;

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (data: object) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = () => {
    console.log("FINAL FORM DATA:", formData);
    router.push("/profile-complete");
  };

  const steps = [
    <Step1Personal key={1} updateFormData={updateFormData} />,
    <Step2Education key={2} updateFormData={updateFormData} />,
    <Step3Skills key={3} updateFormData={updateFormData} />,
    <Step4Experience key={4} updateFormData={updateFormData} />,
    <Step5Additional key={5} updateFormData={updateFormData} />,
  ];

  return (
    // UPDATED: This container now takes up the full height of its parent (the layout).
    <div className="container mx-auto max-w-7xl h-full p-6 lg:p-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 h-full">
        <FormStepper currentStep={currentStep} totalSteps={totalSteps} />

        {/*
              THE MAIN FIX IS HERE:
              - flex and flex-col: Turns this container into a vertical flexbox.
              - h-full: Makes the card take up the full height of the grid row.
            */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 flex flex-col h-full">
          {/*
                  - flex-1 (or flex-grow): This makes the content area take up ALL available space, pushing the buttons down.
                  - overflow-y-auto: If the content INSIDE this div is too long, a scrollbar will appear HERE, not on the whole page.
                  - REMOVED min-h-[500px]
                */}
          <div className="flex-1 overflow-y-auto pr-4 -mr-4">
            {steps[currentStep - 1]}
          </div>

          {/* This section is now guaranteed to be at the bottom. */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end gap-4">
            {currentStep > 1 && (
              <Button
                variant="form-secondary"
                onClick={handlePrevious}
                className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-gray-400"
              >
                Previous
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button
                variant="form-primary"
                onClick={handleNext}
                className="bg-[#1E3A8A] hover:bg-blue-900 focus:ring-[#1E3A8A]"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="form-primary"
                onClick={handleSubmit}
                className="bg-[#1E3A8A] hover:bg-blue-900 focus:ring-[#1E3A8A]"
              >
                Submit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
