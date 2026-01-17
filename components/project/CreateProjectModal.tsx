"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Github, Link, Loader2, Save, Rocket, Target, Lightbulb, FileText, Globe, Code2, ChevronRight, ChevronLeft, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectModalProps } from "@/app/types/project.types";
import { createProjectAction } from "@/lib/actions/project.actions";
import { InputField } from "../feed/project-form/InputField";
import { TextareaField } from "../feed/project-form/TextareaField";
import { VideoUpload } from "../feed/project-form/VideoUpload";
import { SelectField } from "../feed/project-form/SelectField";
import { MultiImageUpload } from "../feed/project-form/MultiImageUpload";
import { FileUpload } from "../feed/project-form/FileUpload";
import { useProjectForm } from "@/hooks/useProjectForm";
import ProjectSuccessModal from "./ProjectSuccessModal";
import { Badge } from "@/components/ui/badge";
import { getCompaniesAction } from "@/lib/actions/company.actions";
import { ProjectFormData } from "@/app/types/project.types";

const PROJECT_CATEGORIES = [
  { value: "SaaS", label: "SaaS / Software" },
  { value: "Fintech", label: "Fintech" },
  { value: "Edtech", label: "Edtech" },
  { value: "Healthtech", label: "Healthtech" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "AI/ML", label: "AI / Machine Learning" },
  { value: "Blockchain", label: "Blockchain" },
  { value: "Social", label: "Social Media" },
  { value: "Sustainability", label: "Green Tech" },
];

const COMMON_TECH = ["Next.js", "React", "TypeScript", "Node.js", "Python", "Supabase", "PostgreSQL", "TailwindCSS", "Prisma", "Go", "Rust", "Swift", "Kotlin"];

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedProjectTitle, setSubmittedProjectTitle] = useState("");
  const [techInput, setTechInput] = useState("");
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();

  const {
    formData,
    errors,
    touched,
    previewUrls,
    videoPreviewUrl,
    handleInputChange,
    handleBlur,
    handleImagesChange,
    handleVideoChange,
    handlePitchDeckChange,
    removeImage,
    validateForm,
    validateStep,
    resetForm,
    getFormData,
  } = useProjectForm();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { 
    setIsMounted(true); 
    const fetchCompanies = async () => {
      const result = await getCompaniesAction();
      if (result.success && result.data) {
        const formatted = result.data.map((c: any) => ({
          value: c.id,
          label: c.company_name
        }));
        setCompanies([{ value: "open", label: "🌍 Open Pitch (Visible to Everyone)" }, ...formatted]);
      }
    };
    fetchCompanies();
  }, []);

  const totalSteps = 4;

  const nextStep = () => {
    let fieldsToValidate: (keyof ProjectFormData)[] = [];
    
    if (currentStep === 1) fieldsToValidate = ["title", "tagline", "category", "targetCompanyId"];
    if (currentStep === 2) fieldsToValidate = ["problemStatement", "solutionDescription"];
    if (currentStep === 3) fieldsToValidate = ["videoFile", "coverImages"];
    if (currentStep === 4) fieldsToValidate = ["pitchDeck", "techStack", "repoLink"];

    const isValid = validateStep(fieldsToValidate);
    
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Find the first error message for the current slide
      const firstErrorKey = fieldsToValidate.find(field => errors[field]);
      const errorMessage = firstErrorKey ? errors[firstErrorKey] : "Please check your inputs";
      toast.error(errorMessage);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const addTech = (tech: string) => {
    const cleanTech = tech.trim();
    if (!cleanTech) return;
    const currentStack = formData.techStack || [];
    if (!currentStack.includes(cleanTech)) {
      handleInputChange("techStack", [...currentStack, cleanTech]);
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    const currentStack = formData.techStack || [];
    handleInputChange("techStack", currentStack.filter(t => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateForm();
    
    if (!isValid) {
      toast.error("Please complete all required fields correctly across all steps");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = getFormData();
      const result = await createProjectAction(data);

      if (result.success) {
        setSubmittedProjectTitle(formData.title || "Project");
        toast.success("Project Pitch Launched! 🚀");
        onClose();
        resetForm();
        setShowSuccessModal(true);
        router.refresh();
      } else {
        toast.error(result.error || "Launch failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Rocket className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Project Identity</h3>
                   <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Slide 1 of 4</p>
                </div>
             </div>
             
             <InputField
              id="title"
              label="Project Title"
              value={formData.title || ""}
              onChange={(v) => handleInputChange("title", v)}
              placeholder="e.g. Zigex Connect"
              required
              error={errors.title}
              touched={touched.title}
            />

            <InputField
              id="tagline"
              label="Elevator Pitch (Tagline)"
              value={formData.tagline || ""}
              onChange={(v) => handleInputChange("tagline", v)}
              placeholder="Explain your mission in one sentence..."
              required
              error={errors.tagline}
              touched={touched.tagline}
            />

            <SelectField
              id="category"
              label="Domain / Category"
              value={formData.category || ""}
              onChange={(v) => handleInputChange("category", v)}
              options={PROJECT_CATEGORIES}
              placeholder="Select project category"
              required
              error={errors.category}
              icon={<Target className="w-4 h-4 text-blue-500" />}
            />

            <SelectField
              id="targetCompanyId"
              label="Target Company (Pitch To)"
              value={formData.targetCompanyId || ""}
              onChange={(v) => handleInputChange("targetCompanyId", v)}
              options={companies}
              placeholder="Submit to a specific company?"
              error={errors.targetCompanyId}
              icon={<Globe className="w-4 h-4 text-emerald-500" />}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">The Problem & Solution</h3>
                   <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Slide 2 of 4</p>
                </div>
             </div>

             <TextareaField
              id="problemStatement"
              label="The Problem"
              value={formData.problemStatement || ""}
              onChange={(v) => handleInputChange("problemStatement", v)}
              placeholder="What pain point are you solving? (min 20 chars)"
              required
              error={errors.problemStatement}
              rows={4}
            />

            <TextareaField
              id="solutionDescription"
              label="Your Solution"
              value={formData.solutionDescription || ""}
              onChange={(v) => handleInputChange("solutionDescription", v)}
              placeholder="How does your project fix it? Describe the innovation... (min 50 chars)"
              required
              error={errors.solutionDescription}
              rows={6}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Media Assets</h3>
                   <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Slide 3 of 4</p>
                </div>
             </div>

             <div className="p-4 bg-slate-50 rounded-[2rem] border border-blue-50">
               <VideoUpload
                videoPreviewUrl={videoPreviewUrl}
                onVideoChange={handleVideoChange}
                onRemove={() => handleVideoChange(null)}
                error={errors.videoFile}
               />
             </div>

             <div className="p-4 bg-slate-50 rounded-[2rem] border border-blue-50">
               <MultiImageUpload
                 previewUrls={previewUrls}
                 onImagesChange={handleImagesChange}
                 onRemove={removeImage}
                 error={errors.coverImages}
               />
             </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Investor & Dev Details</h3>
                   <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Slide 4 of 4</p>
                </div>
             </div>

             <FileUpload 
              label="Pitch Deck (PDF)"
              file={formData.pitchDeck || null}
              onFileChange={handlePitchDeckChange}
              error={errors.pitchDeck}
             />

             <div className="grid grid-cols-2 gap-4">
                <InputField
                    id="fundingGoal"
                    label="Funding Goal ($)"
                    type="number"
                    value={formData.fundingGoal || ""}
                    onChange={(v) => handleInputChange("fundingGoal", v)}
                    placeholder="Optional amount"
                    icon={<Check className="w-4 h-4 text-emerald-500" />}
                />
                <InputField
                    id="repo"
                    label="Github Repository"
                    value={formData.repoLink || ""}
                    onChange={(v) => handleInputChange("repoLink", v)}
                    placeholder="https://github.com/..."
                    icon={<Github className="w-4 h-4 text-slate-900" />}
                    error={errors.repoLink}
                />
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Tech Stack</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                   {(formData.techStack || []).map(tech => (
                     <Badge key={tech} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-2">
                        {tech}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTech(tech)} />
                     </Badge>
                   ))}
                </div>
                <div className="flex gap-2">
                   <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech(techInput))}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-blue-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Add technology (Press Enter)"
                   />
                   <button 
                    type="button" 
                    onClick={() => addTech(techInput)}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                   {COMMON_TECH.filter(t => !(formData.techStack || []).includes(t)).slice(0, 8).map(tech => (
                     <button
                        key={tech}
                        type="button"
                        onClick={() => addTech(tech)}
                        className="text-[9px] font-bold uppercase tracking-tighter px-2 py-1 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                     >
                       + {tech}
                     </button>
                   ))}
                </div>
             </div>

             <InputField
                id="roadmap"
                label="Roadmap Link (Optional)"
                value={formData.roadmap || ""}
                onChange={(v) => handleInputChange("roadmap", v)}
                placeholder="Product Hunt, Notion, or Trello link"
                icon={<Link className="w-4 h-4 text-blue-500" />}
             />
          </div>
        );
      default:
        return null;
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 safe-area-inset-bottom"
    >
      <div
        className="relative w-full sm:max-w-2xl bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl h-[95dvh] sm:h-[90vh] flex flex-col border border-blue-50 sm:m-4 overflow-hidden transition-all ease-out duration-500"
      >
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border bg-card/95 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center bg-muted hover:bg-muted/80 text-primary transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-foreground truncate tracking-tight uppercase">
                New Pitch
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1">
                Mission Deployment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex gap-1.5 mr-4">
                {[1, 2, 3, 4].map(step => (
                    <div 
                        key={step} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${step === currentStep ? 'w-6 bg-blue-600' : (step < currentStep ? 'bg-blue-300' : 'bg-slate-200')}`} 
                    />
                ))}
             </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8">
            {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-6 border-t border-border bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 disabled:opacity-0 transition-all px-4 py-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="group flex items-center gap-2 px-8 py-3 bg-slate-900 border-2 border-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-slate-900 transition-all shadow-xl shadow-slate-200"
              >
                Next Slide <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  relative overflow-hidden group
                  px-10 py-3
                  rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]
                  bg-blue-600 hover:bg-blue-700
                  text-white shadow-xl shadow-blue-200
                  flex items-center justify-center gap-2
                  transition-all duration-300
                  ${isSubmitting ? 'opacity-80' : ''}
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    <span>Launch Pitch</span>
                  </>
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMounted && createPortal(modalContent, document.body)}
      <ProjectSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        projectTitle={submittedProjectTitle}
      />
    </>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <label className={`block text-sm font-medium text-slate-700 mb-1 ${className}`}>
        {children}
    </label>
);