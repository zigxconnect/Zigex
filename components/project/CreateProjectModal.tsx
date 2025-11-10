"use client";

import React, { useState } from "react";
import { X, Github, Calendar, Link, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectModalProps, PROJECT_DURATIONS } from "@/app/types/project.types";
import { createProjectAction } from "@/lib/actions/project.actions";
import { InputField } from "../feed/project-form/InputField";
import { TextareaField } from "../feed/project-form/TextareaField";
import { ImageUpload } from "../feed/project-form/ImageUpload";
import { SelectField } from "../feed/project-form/SelectField";
import { useProjectForm } from "@/hooks/useProjectForm";

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    formData,
    errors,
    touched,
    previewUrl,
    handleInputChange,
    handleBlur,
    handleImageChange,
    removeImage,
    validateForm,
    resetForm,
    isFormValid,
    getFormData,
    validateAllFieldsOnChange
  } = useProjectForm();

  // Always validate all fields on change
  React.useEffect(() => {
    if (typeof validateAllFieldsOnChange === 'function') {
      validateAllFieldsOnChange();
    } else {
      validateForm();
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const { isValid, errors: validationErrors } = validateForm();

      if (!isValid && validationErrors) {
        Object.keys(validationErrors).forEach((key) => {
          handleBlur(key as keyof typeof formData);
        });
        setSubmitError("Please fix the highlighted fields");
        console.log('Validation failed:', validationErrors);
        return;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setSubmitError("Form validation failed");
      return;
    }

    console.log('handleSubmit called, validation passed:', formData);

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formDataToSubmit = getFormData();
      const result = await createProjectAction(formDataToSubmit);

      if (result.success) {
        toast.success("Project created successfully! 🎉");
        resetForm();
        onClose();
        router.refresh();
      } else {
        setSubmitError(result.error || "Failed to create project");

        if (result.fieldErrors) {
          toast.error(result.error || "Validation failed");
        } else {
          toast.error(result.error || "Something went wrong");
        }
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      setSubmitError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-999 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div 
        className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-950 sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border-t sm:border border-gray-200 dark:border-gray-800 sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              New Project
            </h2>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base h-8 sm:h-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden xs:inline">Creating...</span>
                <span className="xs:hidden">...</span>
              </>
            ) : (
              <>
                <span className="hidden xs:inline">Create Project</span>
                <span className="xs:hidden">Create</span>
              </>
            )}
          </Button>
        </div>

        {/* Content - Optimized Scrolling */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-3 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Error Alert */}
            {submitError && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertDescription className="text-xs sm:text-sm text-red-900 dark:text-red-100">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            {/* Info Alert - Mobile Friendly */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <AlertDescription className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                Share your project to find collaborators and get feedback! 🚀
              </AlertDescription>
            </Alert>

            {/* Project Title */}
            <InputField
              id="title"
              label="Project Title"
              value={formData.title || ""}
              onChange={(value) => handleInputChange("title", value)}
              onBlur={() => handleBlur("title")}
              placeholder="Give your project a name..."
              required
              error={errors.title}
              touched={touched.title}
              maxLength={100}
              showCharCount
            />

            {/* Description */}
            <TextareaField
              id="description"
              label="Description"
              value={formData.description || ""}
              onChange={(value) => handleInputChange("description", value)}
              onBlur={() => handleBlur("description")}
              placeholder="What's your project about? What problem does it solve?"
              required
              error={errors.description}
              touched={touched.description}
              maxLength={500}
              rows={4}
            />

            {/* Cover Image */}
            <ImageUpload
              previewUrl={previewUrl}
              onImageChange={handleImageChange}
              onRemove={removeImage}
              error={errors.coverImage}
            />

            {/* GitHub Link */}
            <InputField
              id="github"
              label="GitHub Repository"
              type="url"
              value={formData.githubLink || ""}
              onChange={(value) => handleInputChange("githubLink", value)}
              onBlur={() => handleBlur("githubLink")}
              placeholder="https://github.com/username/repo"
              error={errors.githubLink}
              touched={touched.githubLink}
              icon={<Github className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
            />

            {/* YouTube Link */}
            <InputField
              id="youtube"
              label="YouTube Demo"
              type="url"
              value={formData.youtubeLink || ""}
              onChange={(value) => handleInputChange("youtubeLink", value)}
              onBlur={() => handleBlur("youtubeLink")}
              placeholder="https://youtube.com/watch?v=..."
              error={errors.youtubeLink}
              touched={touched.youtubeLink}
              icon={<Link className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
            />

            {/* Duration */}
            <SelectField
              id="duration"
              label="Project Duration"
              value={formData.duration || ""}
              onChange={(value) => handleInputChange("duration", value)}
              onBlur={() => handleBlur("duration")}
              options={PROJECT_DURATIONS}
              placeholder="Select duration..."
              required
              error={errors.duration}
              touched={touched.duration}
              icon={<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
            />

            {/* Bottom Spacing for Mobile */}
            <div className="h-4 sm:h-0" />
          </div>
        </form>

        {/* Footer - Mobile Optimized */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </div>
    </div>
  );
}