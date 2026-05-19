"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/app/types/profile";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormStepper } from "@/components/sections/create-profile/FormStepper";
import { Step1Personal } from "@/components/sections/create-profile/Step1Personal";
import { Step1Uploads } from "@/components/sections/create-profile/Step1Uploads";
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
  ["first_name", "last_name", "username", "phone", "location", "about"],
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

export const EditProfileModal = ({
  isOpen,
  onClose,
  initialData,
  userId,
  onSaveSuccess,
}: EditProfileModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    mode: "onTouched",
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      username: initialData.username || "",
      phone: initialData.phone || "",
      location: initialData.location || "",
      about: initialData.about || "",
      avatar_url: initialData.avatar_url || "",
      cover_image: initialData.cover_image || "",
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

    // Ensure username is present and valid
    if (!formData.username || formData.username.trim().length < 3) {
      toast.error("Username is required and must be at least 3 characters.", { id: toastId });
      setIsSubmitting(false);
      return;
    }

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
    <Step1Uploads key={2} />,
    <Step2Education key={3} />,
    <Step3Skills key={4} />,
    <Step4Experience key={5} />,
    <Step5Additional key={6} />,
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden transform scale-95 sm:scale-100 transition-all duration-300 border border-border/50">
        {/* Header */}
        <div className="bg-card border-b border-border p-5 sm:p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Edit Profile</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
            type="button"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-0">
              <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {steps[currentStep - 1]}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-card border-t border-border p-4 sm:p-6 flex gap-3 sm:justify-between sm:gap-4 shrink-0">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </Button>
              )}
              <div className="contents sm:flex sm:gap-4 sm:ml-auto">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner /> Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
