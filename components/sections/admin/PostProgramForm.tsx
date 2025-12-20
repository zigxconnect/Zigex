"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";

// Reusable layout components
const FormSection = ({ title, children }: any) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-black mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children, className, required }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export const PostProgramForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // *** 1. DETECT EDIT MODE ***
  const isEditMode = Boolean(initialData);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const [applicationLocation, setApplicationLocation] = useState(initialData?.location|| "")

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
    (initialData?.required_skills || []).join(",")
  );
  const [programPicture, setProgramPicture] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProgramPicture(e.target.files[0]);
    }
  };

  // *** 2. THE CORRECTED SUBMIT HANDLER ***
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("program_category", programCategory);
    formData.append("start_date", new Date(startDate).toISOString());
    formData.append("end_date", new Date(endDate).toISOString());
    formData.append("location", applicationLocation);
    if (applicationDeadline)
      formData.append(
        "application_deadline",
        new Date(applicationDeadline).toISOString()
      );
    if (programFormat) formData.append("program_format", programFormat);
    if (requiredSkills) formData.append("required_skills", requiredSkills);
    if (programPicture) formData.append("program_picture", programPicture);

    // ** THIS IS THE CRITICAL FIX: INCLUDE THE ID FOR PATCH REQUESTS **
    if (isEditMode) {
      formData.append("id", initialData.id);
    }

    try {
      // DYNAMICALLY SET THE HTTP METHOD
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

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Program Information">
        <FormField label="Program Title" required className="md:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Program Category" required>
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
        <FormField label="Program Format" required>
          <Select
            value={programFormat}
            onChange={(e) => setProgramFormat(e.target.value)}
            required
          >
            <option value="remote">Remote</option>
            <option value="in_person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </FormField>
      </FormSection>

      <FormSection title="Program Schedule">
        <FormField label="Start Date" required>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>
        <FormField label="End Date" required>
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

        <FormField label="Location" required>
          <Input
            type="text"
            value={applicationLocation}
            onChange={(e) => setApplicationLocation(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Details & Branding">
        <FormField label="Description & Activities" required className="md:col-span-2">
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
            placeholder="e.g., JavaScript,Project Management"
          />
        </FormField>
        <FormField label="Program Picture" className="md:col-span-2" required>
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
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode
              ? "Upload a new file to replace the current one."
              : "An image is required."}
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
        <Button type="submit" variant="primary" disabled={isSubmitting}>
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
