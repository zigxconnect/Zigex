"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Github, Calendar, Link, Loader2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectModalProps, PROJECT_DURATIONS } from "@/app/types/project.types";
import { createProjectAction } from "@/lib/actions/project.actions";
import { InputField } from "../feed/project-form/InputField";
import { TextareaField } from "../feed/project-form/TextareaField";
import { ImageUpload } from "../feed/project-form/ImageUpload";
import { VideoUpload } from "../feed/project-form/VideoUpload";
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
    videoPreviewUrl,
    handleInputChange,
    handleBlur,
    handleImageChange,
    handleVideoChange,
    removeImage,
    removeVideo,
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
      console.log('Form validation result:', { isValid, validationErrors, formData });

      if (!isValid) {
        console.warn('Form validation failed:', validationErrors);
        setSubmitError("Please fix the highlighted fields");
        // Show toast with more specific errors
        const errorMessages = Object.entries(validationErrors || {})
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        toast.error('Validation failed', {
          description: errorMessages.substring(0, 100) // Limit description length
        });
        return;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setSubmitError("Form validation failed");
      toast.error("Form validation failed");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      console.log('Starting project creation...');

      const formDataToSubmit = getFormData();
      console.log('Submitting form data:', { 
        title: formDataToSubmit.get('title'),
        description: formDataToSubmit.get('description'),
        githubLink: formDataToSubmit.get('githubLink'),
        youtubeLink: formDataToSubmit.get('youtubeLink'),
        duration: formDataToSubmit.get('duration'),
        hasCoverImage: !!formDataToSubmit.get('coverImage'),
        hasVideo: !!formDataToSubmit.get('uploadedVideo')
      });
      
      const result = await createProjectAction(formDataToSubmit);
      console.log('Project creation result:', result);

      if (result.success) {
        console.log('Project created successfully');
        setSubmittedProjectTitle(formData.title || "Your project");
        
        // Clear the draft on successful submission
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        
        toast.success("Project created successfully! 🎉");
        
        onClose();
        resetForm();
        
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 200);
        
        router.refresh();
      } else {
        console.error('Project creation failed:', result);
        const errorMsg = result.error || "Failed to create project";
        setSubmitError(errorMsg);

        if (result.fieldErrors) {
          console.warn('Field errors:', result.fieldErrors);
          toast.error(errorMsg);
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
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

  // Handle portal mounting on client side
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 safe-area-inset-bottom"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
          }
        }}
      >
        <div 
          className="relative w-full sm:max-w-2xl bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl h-[95dvh] sm:h-[85vh] flex flex-col border border-blue-50 sm:m-4 overflow-hidden transition-all ease-out duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Premium Brand Style */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F6F8FF] bg-white/95 backdrop-blur-xl shrink-0 safe-area-top">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center bg-[#F6F8FF] hover:bg-blue-100 text-[#155DFC] transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate tracking-tight uppercase">
                  New Project
                </h2>
                <p className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest leading-none mt-1">
                  Zigex Spotlight
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                relative overflow-hidden group
                px-8 sm:px-10 py-3
                rounded-2xl font-black text-xs sm:text-sm 
                h-12 shrink-0 ml-4
                text-white uppercase tracking-[0.1em]
                bg-[#155DFC] hover:bg-[#1A3CB9]
                shadow-xl shadow-blue-200/50
                hover:shadow-blue-300/60
                hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center
                transition-all duration-500
                ${isSubmitting ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              <div className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Draft Notification - Themed */}
          {hasDraft && (
            <div className="px-6 sm:px-8 pt-6 pb-2 shrink-0">
              <div className="bg-[#F6F8FF] border border-blue-100 rounded-[1.5rem] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-50">
                    <Save className="h-5 w-5 text-[#155DFC]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900 uppercase">Saved Progress Found</p>
                    <p className="text-[10px] text-slate-500 font-medium">Continue where you left off?</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={loadDraft}
                    className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-[#155DFC] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1A3CB9] transition-all"
                  >
                    Restore
                  </button>
                  <button
                    onClick={clearDraft}
                    className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-white border border-blue-100 text-[#155DFC] text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content - Enhanced Scrolling */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-6 sm:px-10 py-8 space-y-8">
              {/* Error Alert */}
              {submitError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {submitError}
                  </p>
                </div>
              )}

              {/* Info Alert - Premium Style */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#F6F8FF] rounded-3xl -rotate-1 transition-transform group-hover:rotate-0" />
                <div className="relative bg-[#155DFC] rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-black uppercase tracking-widest text-xs mb-1">Elite Showcase</h4>
                      <p className="text-sm text-blue-50 leading-relaxed font-medium">
                        Your project will be featured in the Zigex community feed. Make it count! 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-6">
                <InputField
                  id="title"
                  label="Project Title"
                  value={formData.title || ""}
                  onChange={(value) => handleInputChange("title", value)}
                  onBlur={() => handleBlur("title")}
                  placeholder="e.g. Next-Gen AI Workspace"
                  required
                  error={errors.title}
                  touched={touched.title}
                  maxLength={100}
                  showCharCount
                />

                <TextareaField
                  id="description"
                  label="Mission Description"
                  value={formData.description || ""}
                  onChange={(value) => handleInputChange("description", value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Tell the community about your breakthrough..."
                  required
                  error={errors.description}
                  touched={touched.description}
                  maxLength={500}
                  rows={4}
                />

                <div className="p-1 bg-[#F6F8FF] rounded-[2rem] border border-blue-50 overflow-hidden">
                  <ImageUpload
                    previewUrl={previewUrl}
                    onImageChange={handleImageChange}
                    onRemove={removeImage}
                    error={errors.coverImage}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField
                    id="github"
                    label="Repository"
                    type="url"
                    value={formData.githubLink || ""}
                    onChange={(value) => handleInputChange("githubLink", value)}
                    onBlur={() => handleBlur("githubLink")}
                    placeholder="github.com/your/project"
                    error={errors.githubLink}
                    touched={touched.githubLink}
                    icon={<Github className="h-4 w-4 text-[#155DFC]" />}
                  />

                  <InputField
                    id="youtube"
                    label="Video Demo"
                    type="url"
                    value={formData.youtubeLink || ""}
                    onChange={(value) => handleInputChange("youtubeLink", value)}
                    onBlur={() => handleBlur("youtubeLink")}
                    placeholder="youtube.com/watch?v=..."
                    required
                    error={errors.youtubeLink}
                    touched={touched.youtubeLink}
                    icon={<Link className="h-4 w-4 text-[#155DFC]" />}
                  />
                </div>

                <SelectField
                  id="duration"
                  label="Project Timeline"
                  value={formData.duration || ""}
                  onChange={(value) => handleInputChange("duration", value)}
                  onBlur={() => handleBlur("duration")}
                  options={PROJECT_DURATIONS}
                  placeholder="How long did it take?"
                  required
                  error={errors.duration}
                  touched={touched.duration}
                  icon={<Calendar className="h-4 w-4 text-[#155DFC]" />}
                />

                <div className="p-1 bg-[#F6F8FF] rounded-[2rem] border border-blue-50 overflow-hidden">
                  <VideoUpload
                    videoPreviewUrl={videoPreviewUrl}
                    onVideoChange={handleVideoChange}
                    onRemove={removeVideo}
                    error={errors.uploadedVideo}
                    coverImageUrl={previewUrl}
                  />
                </div>
              </div>

              {/* Bottom Spacing */}
              <div className="h-6 sm:h-4" />
            </div>
          </form>

          {/* Footer - Premium Branding */}
          <div className="px-8 py-4 border-t border-[#F6F8FF] bg-[#F6F8FF]/50 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest text-center sm:text-left">
                Progress automatically secured
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-medium text-slate-400">All fields mandatory for elite status</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );

  return (
    <>
      {isMounted && createPortal(modalContent, document.body)}
      
      {/* Success Modal */}
      <ProjectSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        projectTitle={submittedProjectTitle}
      />
    </>
  );
}