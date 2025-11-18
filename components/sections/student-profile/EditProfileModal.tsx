"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/app/types/profile";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormStepper } from "@/components/sections/create-profile/FormStepper";
import { Step1Personal } from "@/components/sections/create-profile/Step1Personal";
import { Step2Education } from "@/components/sections/create-profile/Step2Education";
import { Step3Skills } from "@/components/sections/create-profile/Step3Skills";
import { Step4Experience } from "@/components/sections/create-profile/Step4Experience";
import { Step5Additional } from "@/components/sections/create-profile/Step5Additional";
import { Spinner } from "@/components/uiComponent/Spinner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<ProfileFormData>;
  userId: string;
  onSaveSuccess?: () => void;
}

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

export const EditProfileModal = ({
  isOpen,
  onClose,
  initialData,
  userId,
  onSaveSuccess,
}: EditProfileModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    mode: "onTouched",
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      phone: initialData.phone || "",
      location: initialData.location || "",
      about: initialData.about || "",
      university: initialData.university || "",
      degree: initialData.degree || "",
      field_of_study: initialData.field_of_study || "",
      graduation_year: initialData.graduation_year,
      gpa: initialData.gpa,
      hard_skills: initialData.hard_skills || [],
      soft_skills: initialData.soft_skills || [],
      languages: initialData.languages || [],
      portfolio_url: initialData.portfolio_url || "",
      github_url: initialData.github_url || "",
      linkedin_url: initialData.linkedin_url || "",
      previous_roles: initialData.previous_roles || [],
      preferred_industries: initialData.preferred_industries || [],
      work_mode: initialData.work_mode,
      interests: initialData.interests || [],
      achievements: initialData.achievements || [],
      accommodations: initialData.accommodations || "",
    },
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    const fieldsToValidate = stepsFields[currentStep - 1];
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating your profile...");

    try {
      const response = await fetch(`/api/students/student/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!", { id: toastId });
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(`Update failed: ${errorMessage}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    <Step1Personal key={1} />,
    <Step2Education key={2} />,
    <Step3Skills key={3} />,
    <Step4Experience key={4} />,
    <Step5Additional key={5} />,
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6">
                <div key={currentStep} className="animate-in fade-in duration-500">
                  {steps[currentStep - 1]}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
                <div className="flex gap-4 ml-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
