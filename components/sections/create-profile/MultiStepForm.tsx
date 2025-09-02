"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/app/types/profile";
import { Button } from "@/components/ui/button";

import { FormStepper } from "./FormStepper";
import { Step1Personal } from "./Step1Personal";
import { Step2Education } from "./Step2Education";
import { Step3Skills } from "./Step3Skills";
import { Step4Experience } from "./Step4Experience";
import { Step5Additional } from "./Step5Additional";
import { Spinner } from "@/components/uiComponenet/Spinner";

const stepsFields: (keyof ProfileFormData)[][] = [
  ["first_name", "last_name", "phone", "location", "about"],
  ["university", "degree", "field_of_study", "graduation_year", "gpa"],
  [
    "hard_skills",
    "soft_skills",
    "languages",
    "portfolio_url",
    "github_url",
    "linkedin_url",
  ],
  ["preferred_industries", "work_mode", "previous_roles"],
  ["interests", "achievements", "accommodations"],
];

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const totalSteps = 5;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
  });

  const {
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
      else router.push("/sign-in");
    };
    getUser();
  }, [supabase, router]);

  const handleNext = async () => {
    const fieldsToValidate = stepsFields[currentStep - 1];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) {
      alert("Error: User session not found.");
      return;
    }
    try {
      const response = await fetch(`/api/students/student/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || "Failed to update profile.");
      router.push("/profile-complete");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const steps = [
    <Step1Personal key={1} />,
    <Step2Education key={2} />,
    <Step3Skills key={3} />,
    <Step4Experience key={4} />,
    <Step5Additional key={5} />,
  ];

  if (!userId)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading User Session...
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="container mx-auto max-w-7xl md:p-6 lg:p-12"
      >
        <div className="md:grid md:grid-cols-3 md:gap-12 lg:gap-24">
          <FormStepper currentStep={currentStep} totalSteps={totalSteps} />

          <div className="md:col-span-2 flex flex-col md:bg-white md:rounded-2xl md:shadow-xl md:p-8">
            <div className="md:hidden p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h1 className="text-xl font-bold text-center text-gray-900">
                Create Your Profile
              </h1>
              <p className="text-sm text-center text-gray-500">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            <div
              key={currentStep}
              className="flex-1 overflow-y-auto p-4 md:p-0 animate-in fade-in duration-500"
            >
              {steps[currentStep - 1]}
            </div>

            <div className="mt-auto pt-4 md:pt-8 bg-white md:bg-transparent border-t border-gray-200 flex justify-end gap-4 p-4 md:p-0">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary-outline"
                  onClick={handlePrevious}
                  className="flex-1 md:flex-none"
                >
                  Previous
                </Button>
              ) : (
                <div className="flex-1 md:hidden"></div>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary-dark"
                  onClick={handleNext}
                  className="flex-1 md:flex-none"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary-dark"
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "Submit Profile"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
