"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { ImageUpload } from "@/components/feed/project-form/ImageUpload";
import { createClient } from "@/lib/supabase/client";

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
  const isEditMode = Boolean(initialData);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

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
      const supabase = createClient();
      let uploadedImageUrl = coverImageUrl;

      // Handle Image Upload if new image selected
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `internships/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-assets')
          .upload(fileName, coverImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-assets')
          .getPublicUrl(uploadData.path);
        
        uploadedImageUrl = publicUrl;
      }

      const internshipData = {
        id: isEditMode ? initialData.id : undefined,
        title,
        description,
        location,
        category,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        type: internshipType,
        required_skills: requiredSkills,
        is_paid: isPaid,
        compensation_amount: isPaid ? compensationAmount : null,
        cover_image_url: uploadedImageUrl
      };

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
        throw new Error(result.error?.message || result.error || "Failed to submit form");
      }

      toast.success(`Internship ${isEditMode ? "updated" : "published"} successfully!`);
      router.push("/admin/postings");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
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

      <FormSection title="Job Details">
        <FormField
          label="Job Description & Responsibilities"
          required
          className="md:col-span-2"
        >
          <Textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
            <FormField label="Monthly Compensation (Amount)">
              <Input
                type="text"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(e.target.value)}
                placeholder="e.g., 50,000 FCFA, $500, etc."
              />
            </FormField>
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
    </form>
  );
};
