
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/app/types/profile";
import { toast } from "react-hot-toast";
import clsx from "clsx";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FormStepper } from "./FormStepper";
import { MobileStepper } from "./MobileStepper";
import { Spinner } from "@/components/uiComponent/Spinner";

// Dynamic imports for steps to improve initial load performance
const Step1Personal = dynamic(() => import("./Step1Personal").then(mod => mod.Step1Personal), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});
const Step1Uploads = dynamic(() => import("./Step1Uploads").then(mod => mod.Step1Uploads), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});
const Step2Education = dynamic(() => import("./Step2Education").then(mod => mod.Step2Education), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});
const Step3Skills = dynamic(() => import("./Step3Skills").then(mod => mod.Step3Skills), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});
const Step4Experience = dynamic(() => import("./Step4Experience").then(mod => mod.Step4Experience), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});
const Step5Additional = dynamic(() => import("./Step5Additional").then(mod => mod.Step5Additional), {
  loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
});

const stepsFields: (keyof ProfileFormData)[][] = [
  ["first_name", "last_name", "phone", "location", "about"],
  ["avatar_url", "cover_image"],
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

const stepsData = [
  {
    number: 1,
    title: "Personal Details",
    description: "Basic info & location",
  },
  {
    number: 2,
    title: "Profile Images",
    description: "Photo & cover image",
  },
  {
    number: 3,
    title: "Education",
    description: "University & degree",
  },
  {
    number: 4,
    title: "Skills & Languages",
    description: "Technical & soft skills",
  },
  {
    number: 5,
    title: "Experience",
    description: "Work history",
  },
  {
    number: 6,
    title: "Preferences & Extras",
    description: "Work mode & interests",
  },
];

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const totalSteps = 6;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      location: "",
      about: "",
      avatar_url: "",
      cover_image: "",
      university: "",
      degree: "",
      field_of_study: "",
      graduation_year: undefined,
      gpa: "",
      hard_skills: [],
      soft_skills: [],
      languages: [],
      portfolio_url: "",
      github_url: "",
      linkedin_url: "",
      previous_roles: [],
      preferred_industries: [],
      work_mode: undefined,
      interests: [],
      achievements: [],
      accommodations: "",
    },
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
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        } else {
          toast.error("Session not found. Redirecting to sign-in.");
          router.push("/sign-in");
        }
      } catch (error) {
        console.error(
          "[getUser Error] Failed to retrieve user session:",
          error
        );
        toast.error("Unable to load your session. Please sign in again.");
        router.push("/sign-in");
      }
    };
    getUser();
  }, [supabase, router]);

  const handleNext = async () => {
    const fieldsToValidate = stepsFields[currentStep - 1];
    setIsNavigating(true);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      console.log(
        `[Step Navigation] Moving from step ${currentStep} to step ${Math.min(currentStep + 1, totalSteps)}`
      );
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      console.log(
        `[Step Validation] Validation failed for step ${currentStep}`
      );
    }
    setIsNavigating(false);
  };

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: ProfileFormData) => {
    console.log(
      `[Form Submit] Submitting profile at step ${currentStep}. Expected final step: ${totalSteps}`
    );
    if (!userId) {
      toast.error("Error: User session not found. Please sign in again.");
      return;
    }
    const toastId = toast.loading("Submitting your profile...");
    try {
      const response = await fetch(`/api/students/student/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile.");
      }
      toast.success("Profile updated successfully!", { id: toastId });
      router.push("/profile-complete");
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(`Submission failed: ${errorMessage}`, { id: toastId });
    }
  };

  const steps = [
    <Step1Personal key={1} />,
    <Step1Uploads key={2} />,
    <Step2Education key={3} />,
    <Step3Skills key={4} />,
    <Step4Experience key={5} />,
    <Step5Additional key={6} />,
  ];

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <Spinner /> <span className="ml-4">Loading User Session...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="container mx-auto max-w-7xl md:p-6 lg:p-12"
      >
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 items-start">
          <div className="md:col-span-4 lg:col-span-3">
            <FormStepper currentStep={currentStep} steps={stepsData} />
          </div>
          <div className="md:col-span-8 lg:col-span-9 flex flex-col">
            <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
              {/* Desktop Header */}
              <div className="hidden md:block px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {stepsData[currentStep - 1].title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {stepsData[currentStep - 1].description}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    Step {currentStep} of {totalSteps}
                  </div>
                </div>
              </div>
            <MobileStepper
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={stepsData}
            />
            <div
              key={currentStep}
              className="flex-1 overflow-y-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {steps[currentStep - 1]}
            </div>
            <div className="mt-auto p-4 md:px-8 md:py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={clsx(
                  "min-w-[100px] transition-all",
                  currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                Back
              </Button>
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  disabled={isNavigating}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="min-w-[120px] shadow-sm hover:shadow-md transition-all"
                >
                  {isNavigating ? <Spinner /> : "Next Step"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[140px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </form>
    </FormProvider>
  );
};
