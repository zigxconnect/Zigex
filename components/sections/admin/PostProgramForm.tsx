"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { FormStepper } from "@/components/ui/FormStepper";
import { ArrowLeft, ArrowRight, Save, Upload } from "lucide-react";

const FormField = ({
  label,
  children,
  className,
  required,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const STEPS = ["Basics", "Schedule", "Details", "Review"];

export const PostProgramForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // State
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [programCategory, setProgramCategory] = useState(
    initialData?.program_category || "bootcamp"
  );
  const [startDate, setStartDate] = useState(
    formatDateForInput(initialData?.start_date)
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(initialData?.end_date)
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    formatDateForInput(initialData?.application_deadline)
  );
  const [programFormat, setProgramFormat] = useState(
    initialData?.program_format || "remote"
  );
  const [requiredSkills, setRequiredSkills] = useState(
    (initialData?.required_skills || []).join(",")
  );
  const [programPicture, setProgramPicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.program_picture_url || null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProgramPicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Basics
        if (!title || !programCategory || !programFormat) {
          toast.error("Please fill in all required fields.");
          return false;
        }
        return true;
      case 1: // Schedule
        if (!startDate || !endDate) {
          toast.error("Please fill in all required dates.");
          return false;
        }
        return true;
      case 2: // Details
        if (!description) {
          toast.error("Please provide a program description.");
          return false;
        }
        if (!isEditMode && !programPicture) {
           toast.error("Please upload a program image.");
           return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("program_category", programCategory);
    formData.append("start_date", new Date(startDate).toISOString());
    formData.append("end_date", new Date(endDate).toISOString());
    if (applicationDeadline)
      formData.append(
        "application_deadline",
        new Date(applicationDeadline).toISOString()
      );
    if (programFormat) formData.append("program_format", programFormat);
    if (requiredSkills) formData.append("required_skills", requiredSkills);
    if (programPicture) formData.append("program_picture", programPicture);

    if (isEditMode) {
      formData.append("id", initialData.id);
    }

    try {
      const method = isEditMode ? "PATCH" : "POST";
      const response = await fetch("/api/companies/programs", {
        method,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to submit form");

      toast.success(
        `Program ${isEditMode ? "updated" : "published"} successfully!`
      );

      router.push("/admin/postings");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Program Title" required className="md:col-span-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Coding Bootcamp"
                />
              </FormField>
              <FormField label="Category" required>
                <Select
                  value={programCategory}
                  onChange={(e) => setProgramCategory(e.target.value)}
                >
                  <option value="bootcamp">Bootcamp</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="apprenticeship">Apprenticeship</option>
                </Select>
              </FormField>
              <FormField label="Format" required>
                <Select
                  value={programFormat}
                  onChange={(e) => setProgramFormat(e.target.value)}
                >
                  <option value="remote">Remote</option>
                  <option value="in_person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </FormField>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Start Date" required>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormField>
              <FormField label="End Date" required>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormField>
              <FormField label="Application Deadline (Optional)">
                <Input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <FormField label="Description & Activities" required>
              <Textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the program structure, curriculum, benefits..."
              />
            </FormField>
            <FormField label="Required Skills (comma-separated)">
               <Input
                 value={requiredSkills}
                 onChange={(e) => setRequiredSkills(e.target.value)}
                 placeholder="e.g. Python, Data Analysis, Teamwork"
               />
            </FormField>
            <FormField label="Program Image" required={!isEditMode}>
               <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white font-medium flex items-center gap-2">
                           <Upload size={16} /> Change Image
                         </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Upload size={20} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 2MB)</p>
                    </div>
                  )}
               </div>
            </FormField>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Review Program Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Title</span>
                  <span className="font-medium">{title}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Category</span>
                  <span className="font-medium capitalize">{programCategory}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Format</span>
                  <span className="font-medium capitalize">{programFormat}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Start Date</span>
                  <span className="font-medium">{startDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">End Date</span>
                  <span className="font-medium">{endDate}</span>
                </div>
              </div>
              
              {imagePreview && (
                <div>
                  <span className="text-gray-500 block text-sm mb-2">Program Image</span>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Please review all details before publishing.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <FormStepper steps={STEPS} currentStep={currentStep} />
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{STEPS[currentStep]}</h2>
          <p className="text-gray-500">Step {currentStep + 1} of {STEPS.length}</p>
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Save size={16} />
              {isSubmitting ? "Publishing..." : isEditMode ? "Save Changes" : "Publish Program"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
