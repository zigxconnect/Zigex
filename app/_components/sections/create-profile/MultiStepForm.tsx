"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// THE FIX IS HERE: We now import the correct client factory function.
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/_components/ui/Button";
import { FormStepper } from "./FormStepper";
import { Step1Personal } from "./Step1Personal";
import { Step2Education } from "./Step2Education";
import { Step3Skills } from "./Step3Skills";
import { Step4Experience } from "./Step4Experience";
import { Step5Additional } from "./Step5Additional";
import { ProfileFormData } from "@/app/types/profile";

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  // THE FIX IS HERE: We create a new instance of the browser client.
  const supabase = createClient();
  const totalSteps = 5;

  useEffect(() => {
    const getUser = async () => {
      // This call will now correctly find the session set by the server.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        // This redirect should no longer happen after a successful login.
        console.log("No session found, redirecting to sign-in.");
        router.push("/sign-in");
      }
    };
    getUser();
  }, [supabase, router]); // Dependencies are correct.

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("Error: User session not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    console.log("Submitting final profile data:", formData);

    try {
      const response = await fetch(`/api/profiles/student/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update profile.");

      router.push("/profile-complete");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    <Step1Personal key={1} data={formData} onUpdate={updateFormData} />,
    <Step2Education key={2} data={formData} onUpdate={updateFormData} />,
    <Step3Skills key={3} data={formData} onUpdate={updateFormData} />,
    <Step4Experience key={4} data={formData} onUpdate={updateFormData} />,
    <Step5Additional key={5} data={formData} onUpdate={updateFormData} />,
  ];

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading User Session...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl h-full p-6 lg:p-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 h-full">
        <FormStepper currentStep={currentStep} totalSteps={totalSteps} />
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pr-4 -mr-4">
            {steps[currentStep - 1]}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end gap-4">
            {currentStep > 1 && (
              <Button variant="secondary-outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button variant="primary-dark" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                variant="primary-dark"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Profile"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
