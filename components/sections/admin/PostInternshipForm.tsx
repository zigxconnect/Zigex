"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/feed/project-form/ImageUpload";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

// Helper UI Components

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  name?: string;
  required?: boolean;
  hint?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, className, ...props }) => (
  <input
    id={id}
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-black focus:ring-blue-500 ${
      className ?? ""
    }`}
    {...props}
  />
);

const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className,
}) => (
  <div
    className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 ${
      className ?? ""
    }`}
  >
    <h2 className="text-lg font-semibold text-black mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  className,
  name,
  required,
  hint,
}) => (
  <div className={className}>
    <label
      className="block text-sm font-medium text-foreground mb-1.5"
      htmlFor={name}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

// Main Form Component

export const PostInternshipForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isEditMode = Boolean(initialData);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const [isVisible, setIsVisible] = useState(
    initialData?.is_visible ?? true
  );

  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
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

  const [compensationAmount, setCompensationAmount] = useState(
    initialData?.compensation_amount || ""
  );
  const [monthlyRate, setMonthlyRate] = useState(
    initialData?.monthly_rate || 0
  );
  const [isPaid, setIsPaid] = useState(Boolean(initialData?.is_paid));
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.cover_image_url || null);
  const [endDate, setEndDate] = useState(
    formatDateForInput(initialData?.end_date)
  );

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("category", category);
      formData.append("start_date", new Date(startDate).toISOString());
      formData.append("end_date", endDate ? new Date(endDate).toISOString() : "");
      formData.append("deadline", new Date(deadline).toISOString());
      formData.append("type", internshipType);
      formData.append("is_paid", String(isPaid));
      formData.append("compensation_amount", isPaid ? compensationAmount : "");
      formData.append("monthly_rate", String(monthlyRate));
      formData.append("required_skills", JSON.stringify(requiredSkills));
      formData.append("is_visible", String(isVisible));
      if (coverImage) {
        formData.append("cover_image", coverImage);
      } else if (coverImageUrl) {
        formData.append("cover_image_url", coverImageUrl);
      }
      const endpoint = isEditMode
        ? `/api/companies/internships/${initialData.id}`
        : "/api/companies/internships";
      const method = isEditMode ? "PATCH" : "POST";
      console.log(`Sending ${method} request to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method,
        body: formData,
      });
      console.log("API response status:", response.status);
      let result;
      try {
        result = await response.json();
        console.log("API response data:", result);
      } catch (err) {
        console.error("Failed to parse JSON response:", err);
        throw new Error("The server returned an invalid response. Please try again.");
      }
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.error || "Failed to submit form");
      }
      toast.success(`Internship ${isEditMode ? "updated" : "published"} successfully!`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Form submission error details:", error);
      toast.error(error.message || "An unexpected error occurred. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Internship Information">
        <FormField label="Internship Title" required className="md:col-span-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Category" required>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            <option>Software Development</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Data Science</option>
            <option>Design</option>
            <option>Product Management</option>
            <option>Project Management</option>
            <option>Embedded Systems & IoT</option>
            <option>Product Management</option>
            <option>Project Management</option>
            <option>Embedded Systems & IoT</option>
          </Select>
        </FormField>
        <FormField label="Location" required>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Internship Type" required>
          <Select
            value={internshipType}
            onChange={(e) => setInternshipType(e.target.value)}
            required
          >
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </FormField>
        <FormField label="Start Date" required>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>
        <FormField label="End Date">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormField>
        <FormField label="Application Deadline" required>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Visuals">
         <div className="md:col-span-2">
            <ImageUpload 
              previewUrl={coverImage ? URL.createObjectURL(coverImage) : coverImageUrl}
              onImageChange={(file) => setCoverImage(file)}
              onRemove={() => {
                setCoverImage(null);
                setCoverImageUrl(null);
              }}
              maxSize="5MB"
            />
         </div>
      </FormSection>

      <FormSection title="Visibility">
        <div className="md:col-span-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="visible"
              className="mt-1"
              checked={isVisible}
              onChange={() => setIsVisible(!isVisible)}
            />
            <div>
              <label
                htmlFor="visible"
                className="text-sm font-medium text-blue-700"
              >
                Publish virtual event
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Is currently live for students to see it in jobs. Also visible for users.
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Job Details">
        <FormField
          label="Job Description & Responsibilities"
          required
          className="md:col-span-2"
        >
          <RichTextEditor
            value={description}
            onChange={setDescription}
          />
        </FormField>
      </FormSection>

      <FormSection title="Requirements & Skills">
        <FormField label="Required Skills" className="md:col-span-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g., JavaScript"
            />
            <Button type="button" onClick={addSkill} variant="orange">
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {requiredSkills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Compensation">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="paid"
              className="mt-1"
              checked={isPaid}
              onChange={() => setIsPaid(!isPaid)}
            />
            <div>
              <label
                htmlFor="paid"
                className="text-sm font-medium text-blue-700"
              >
                This is a paid internship
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Check this box to specify compensation details.
              </p>
            </div>
          </div>
          {isPaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Monthly Stipend (Paid to Intern)">
                <Input
                  type="text"
                  value={compensationAmount}
                  onChange={(e) => setCompensationAmount(e.target.value)}
                  placeholder="e.g., 50,000 FCFA"
                />
              </FormField>
              <FormField label="Program Fee (Paid by Intern)">
                <Input
                  type="number"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(parseInt(e.target.value) || 0)}
                  placeholder="e.g., 25000"
                />
              </FormField>
            </div>
          )}
        </div>
      </FormSection>

      <div className="flex justify-end gap-4">
        <Button
          variant="secondary"
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? "Saving Changes..."
              : "Publishing..."
            : isEditMode
            ? "Save Changes"
            : "Publish Internship"}
        </Button>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-blue-50">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-12 w-12 text-blue-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {isEditMode ? "Update Successful!" : "Publication Successful!"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-lg max-w-[280px] mx-auto">
                The internship has been {isEditMode ? "updated" : "published"} and is now live on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 w-full">
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/admin/postings");
                  router.refresh();
                }}
                variant="primary"
                className="w-full py-6 text-lg font-semibold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Postings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};



