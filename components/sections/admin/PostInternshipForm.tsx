"use client"

export interface InternshipFormData {
  title: string;
  description: string;
  location?: string;
  startDate?: string | Date;
  duration?: number;
  stipend?: number;
  tags?: string[];
  // Add other fields as used in the form
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}
import React from "react";

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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
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
      className="block text-sm font-medium text-blue-700 mb-1.5"
      htmlFor={name}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

export const PostInternshipForm = ({
  initialData,
}: {
  initialData?: Partial<InternshipFormData>;
}) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const internshipData = {
      title,
      description,
      location,
      category,
      start_date: startDate ? `${startDate}T00:00:00.000Z` : null,
      deadline: deadline ? `${deadline}T23:59:59.999Z` : null,
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
      if (!response.ok)
        throw new Error(result.error || "Failed to submit form");

      toast.success(
        `Internship ${isEditMode ? "updated" : "published"} successfully!`
      );

      setTimeout(() => {
        router.push("/admin/postings");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Internship Information">
        <FormField label="Internship Title*" className="md:col-span-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Category*">
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
        <FormField label="Location*">
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Internship Type*">
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
        <FormField label="Start Date*">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Application Deadline*">
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Job Details">
        <FormField
          label="Job Description & Responsibilities*"
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
            <FormField label="Compensation Details">
              <Input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
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
        <Button type="submit" variant="orange" disabled={isSubmitting}>
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
