"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Github, Calendar, Link, Loader2, Save } from "lucide-react";
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
import ProjectSuccessModal from "./ProjectSuccessModal";

// Local storage key for draft persistence
const DRAFT_STORAGE_KEY = "project_form_draft";

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedProjectTitle, setSubmittedProjectTitle] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
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

  // Check for saved draft on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Check if draft has any content
          const hasContent = Object.values(draft).some(val => 
            val !== "" && val !== null && val !== undefined
          );
          setHasDraft(hasContent);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [isOpen]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!isOpen) return;
    
    const saveDraft = () => {
      try {
        const draftData = {
          title: formData.title || "",
          description: formData.description || "",
          githubLink: formData.githubLink || "",
          youtubeLink: formData.youtubeLink || "",
          duration: formData.duration || "",
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, isOpen]);

  // Load draft when user wants to restore
  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        Object.entries(draft).forEach(([key, value]) => {
          if (key !== "timestamp" && value) {
            handleInputChange(key as any, value as string);
          }
        });
        toast.success("Draft restored!");
        setHasDraft(false);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error("Failed to load draft");
    }
  }, [handleInputChange]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      toast.success("Draft cleared");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, []);

  // Always validate all fields on change
  useEffect(() => {
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
        return;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setSubmitError("Form validation failed");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formDataToSubmit = getFormData();
      const result = await createProjectAction(formDataToSubmit);

      if (result.success) {
        setSubmittedProjectTitle(formData.title || "Your project");
        
        // Clear the draft on successful submission
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        
        onClose();
        resetForm();
        
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 200);
        
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
      // Don't reset form or clear draft - data persists
      setSubmitError(null);
      onClose();
      
      // Show a toast to inform user their progress is saved
      const hasContent = Object.values(formData).some(val => 
        val !== "" && val !== null && val !== undefined
      );
      if (hasContent) {
        toast.info("Your progress has been saved", {
          description: "You can continue where you left off"
        });
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSubmittedProjectTitle("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[998] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
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
          {/* Header - Fully Responsive */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-9 w-9 rounded-full shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                New Project
              </h2>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base h-9 sm:h-10 shrink-0 ml-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Creating...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Create Project</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </div>

          {/* Draft Notification */}
          {hasDraft && (
            <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <AlertDescription className="text-sm text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 shrink-0" />
                    <span>You have a saved draft</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadDraft}
                      className="flex-1 sm:flex-none h-8 text-xs bg-white dark:bg-gray-900"
                    >
                      Load Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearDraft}
                      className="flex-1 sm:flex-none h-8 text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Content - Enhanced Scrolling */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
              {/* Error Alert */}
              {submitError && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Alert - Responsive */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
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
                icon={<Github className="h-4 w-4 text-muted-foreground" />}
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
                icon={<Link className="h-4 w-4 text-muted-foreground" />}
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
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              />

              {/* Bottom Spacing */}
              <div className="h-6 sm:h-4" />
            </div>
          </form>

          {/* Footer - Enhanced */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              <span className="text-red-500">*</span> Required fields • Your progress is automatically saved
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ProjectSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        projectTitle={submittedProjectTitle}
      />
    </>
  );
}