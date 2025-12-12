"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { FormStepper } from "@/components/ui/FormStepper";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

// Helper UI Components
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, className, ...props }) => (
  <input
    id={id}
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
      className ?? ""
    }`}
    {...props}
  />
);

const FormField = ({
  label,
  children,
  className,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  hint?: string;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const STEPS = ["Basics", "Schedule", "Details", "Compensation", "Review"];

export const PostInternshipForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialData?.required_skills || []
  );
  const [skillInput, setSkillInput] = useState("");
  const [category, setCategory] = useState(initialData?.category || "");
  const [startDate, setStartDate] = useState(
    formatDateForInput(initialData?.start_date)
  );
  const [deadline, setDeadline] = useState(
    formatDateForInput(initialData?.deadline)
  );
  const [internshipType, setInternshipType] = useState(
    initialData?.type || "onsite"
  );
  const [compensation, setCompensation] = useState(
    initialData?.compensation || ""
  );
  const [isPaid, setIsPaid] = useState(Boolean(initialData?.compensation));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Basics
        if (!title || !category || !location || !internshipType) {
          toast.error("Please fill in all required fields.");
          return false;
        }
        return true;
      case 1: // Schedule
        if (!startDate || !deadline) {
          toast.error("Please fill in all required dates.");
          return false;
        }
        return true;
      case 2: // Details
        if (!description) {
          toast.error("Please provide a job description.");
          return false;
        }
        return true;
      case 3: // Compensation
        if (isPaid && !compensation) {
          toast.error("Please specify compensation details.");
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

    const internshipData = {
      id: isEditMode ? initialData.id : undefined,
      title,
      description,
      location,
      category,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      type: internshipType,
      required_skills: requiredSkills,
      compensation: isPaid ? compensation : null,
    };

    try {
      const endpoint = isEditMode
        ? `/api/companies/internships/${initialData.id}`
        : "/api/companies/internships";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(internshipData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || "Failed to submit form"
        );
      }

      toast.success(
        `Internship ${isEditMode ? "updated" : "published"} successfully!`
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
              <FormField label="Internship Title" required className="md:col-span-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Junior Frontend Developer"
                />
              </FormField>
              <FormField label="Category" required>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option>Software Development</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                  <option>Data Science</option>
                  <option>Design</option>
                </Select>
              </FormField>
              <FormField label="Internship Type" required>
                <Select
                  value={internshipType}
                  onChange={(e) => setInternshipType(e.target.value)}
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </FormField>
              <FormField label="Location" required className="md:col-span-2">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY or Remote"
                />
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
              <FormField label="Application Deadline" required>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <FormField label="Job Description & Responsibilities" required>
              <Textarea
                rows={12}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and what the intern will learn..."
              />
            </FormField>
            <FormField label="Required Skills">
              <div className="flex gap-2 mb-3">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </FormField>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  id="paid"
                  className="mt-1"
                  checked={isPaid}
                  onChange={() => setIsPaid(!isPaid)}
                />
                <div>
                  <label htmlFor="paid" className="text-sm font-medium text-gray-900">
                    This is a paid internship
                  </label>
                  <p className="text-sm text-gray-500">
                    Check this box if you offer a salary or stipend.
                  </p>
                </div>
              </div>
              {isPaid && (
                <FormField label="Compensation Details" required>
                  <Input
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                    placeholder="e.g. $25/hr or $1000/month stipend"
                  />
                </FormField>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Review Internship Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Title</span>
                  <span className="font-medium">{title}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Category</span>
                  <span className="font-medium">{category}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Type</span>
                  <span className="font-medium capitalize">{internshipType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Location</span>
                  <span className="font-medium">{location}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Start Date</span>
                  <span className="font-medium">{startDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Deadline</span>
                  <span className="font-medium">{deadline}</span>
                </div>
                 <div>
                  <span className="text-gray-500 block">Compensation</span>
                  <span className="font-medium">{isPaid ? compensation : "Unpaid"}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block text-sm mb-1">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {requiredSkills.map(s => (
                    <span key={s} className="text-xs bg-white border px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Please review all details before publishing. You can edit this later.
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
              {isSubmitting ? "Publishing..." : isEditMode ? "Save Changes" : "Publish Internship"}
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
