"use client";

import React, { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const FormField = ({ label, children, className }: FormFieldProps) => (
  <div className={className}>
    <label className="block text-sm font-medium text-blue-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

interface ProgramData {
  id?: string;
  title?: string;
  description?: string;
  program_category?: string;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  program_format?: string;
  required_skills?: string[];
  program_picture_url?: string;
}

export const PostProgramForm = ({
  initialData,
}: {
  initialData?: ProgramData;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData);

  // Helper to format ISO date strings to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // State initialization for all form fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
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
    Array.isArray(initialData?.required_skills)
      ? initialData.required_skills.join(",")
      : ""
  );
  const [programPicture, setProgramPicture] = useState<File | null>(null);

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const [fileError, setFileError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setFileError("Only JPG, PNG, or WEBP images are allowed.");
        setProgramPicture(null);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setFileError("Image size must be less than 5MB.");
        setProgramPicture(null);
        e.target.value = "";
        return;
      }
      setFileError("");
      setProgramPicture(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate dates before appending
    const errors: string[] = [];
    const isValidDate = (value: string) => {
      if (!value) return false;
      const d = new Date(value);
      return d.toString() !== "Invalid Date";
    };

    if (!isValidDate(startDate)) errors.push("Start date is invalid.");
    if (!isValidDate(endDate)) errors.push("End date is invalid.");
    if (applicationDeadline && !isValidDate(applicationDeadline))
      errors.push("Application deadline is invalid.");

    // Logical date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = applicationDeadline ? new Date(applicationDeadline) : null;

    if (isValidDate(startDate) && isValidDate(endDate) && end <= start) {
      toast.error("End date must be after start date.");
      setIsSubmitting(false);
      return;
    }
    if (deadline && isValidDate(applicationDeadline) && deadline >= start) {
      toast.error(
        "Application deadline must be before the program start date."
      );
      setIsSubmitting(false);
      return;
    }

    if (errors.length > 0) {
      toast.error(errors.join(" "));
      setIsSubmitting(false);
      return;
    }

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
      // Your API uses the same endpoint for POST and PATCH with form-data
      const endpoint = "/api/companies/programs";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to submit form");

      toast.success(
        `Program ${isEditMode ? "updated" : "published"} successfully!`
      );

      // Redirect back to the postings list after success
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
      <FormSection title="Program Information">
        <FormField label="Program Title*" className="md:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Program Category*">
          <Select
            value={programCategory}
            onChange={(e) => setProgramCategory(e.target.value)}
            required
          >
            <option value="bootcamp">Bootcamp</option>
            <option value="hackathon">Hackathon</option>
            <option value="mentorship">Mentorship</option>
            <option value="volunteer">Volunteer</option>
            <option value="apprenticeship">Apprenticeship</option>
          </Select>
        </FormField>
        <FormField label="Program Format">
          <Select
            value={programFormat}
            onChange={(e) => setProgramFormat(e.target.value)}
          >
            <option value="remote">Remote</option>
            <option value="in_person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </FormField>
      </FormSection>

      <FormSection title="Program Schedule">
        <FormField label="Start Date*">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>
        <FormField label="End Date*">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Application Deadline (Optional)">
          <Input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Program Details">
        <FormField label="Description & Activities*" className="md:col-span-2">
          <Textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Required Skills (comma-separated)"
          className="md:col-span-2"
        >
          <Input
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="e.g., JavaScript,Project Management,Public Speaking"
          />
        </FormField>
      </FormSection>

      <FormSection title="Branding">
        <FormField label="Program Picture" className="md:col-span-2">
          {isEditMode && initialData.program_picture_url && !programPicture && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current Image:</p>
              <Image
                src={initialData.program_picture_url}
                alt="Current program picture"
                width={200}
                height={100}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {fileError && (
            <p className="text-xs text-red-600 mt-2">{fileError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode
              ? "Upload a new file to replace the current one."
              : "Upload an image for your program."}
          </p>
        </FormField>
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
            : "Publish Program"}
        </Button>
      </div>
    </form>
  );
};
