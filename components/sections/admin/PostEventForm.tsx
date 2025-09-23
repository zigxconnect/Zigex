"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";

const FormSection = ({ title, children }: any) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children, className }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-blue-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export const PostEventForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // State for all form fields, matching the API endpoint
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [eventType, setEventType] = useState(
    initialData?.event_type || "conference"
  );
  const [startDate, setStartDate] = useState(
    formatDateForInput(initialData?.start_date)
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(initialData?.end_date)
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [eventImage, setEventImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventImage && !isEditMode) {
      toast.error("An event image is required when creating a new event.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("event_type", eventType);
    formData.append("start_date", new Date(startDate).toISOString());
    formData.append("end_date", new Date(endDate).toISOString());
    formData.append("location", location);
    if (eventImage) {
      formData.append("event_image", eventImage);
    }

    try {
      const endpoint = isEditMode
        ? `/api/companies/events/${initialData.id}`
        : "/api/companies/events";

      // 2. Determine the HTTP method.
      const method = isEditMode ? "PATCH" : "POST";

      // 3. Send the request.
      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("API Error:", result);
        throw new Error(result.error || "Failed to submit form");
      }

      toast.success(
        `Event ${isEditMode ? "updated" : "published"} successfully!`
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
      <FormSection title="Event Information">
        <FormField label="Event Title*" className="md:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Event Type*">
          <Select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
          >
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="networking">Networking</option>
            <option value="hackathon">Hackathon</option>
          </Select>
        </FormField>
        <FormField label="Location* (Online or Physical Address)">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Event Schedule">
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
      </FormSection>

      <FormSection title="Details & Branding">
        <FormField label="Event Description*" className="md:col-span-2">
          <Textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Event Image" className="md:col-span-2">
          {isEditMode && initialData.event_picture_url && !eventImage && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current Image:</p>
              <Image
                src={initialData.event_picture_url}
                alt="Current event image"
                width={200}
                height={100}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode
              ? "Upload a new file to replace the current image."
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
        <Button type="submit" variant="orange" disabled={isSubmitting}>
          {isEditMode
            ? isSubmitting
              ? "Saving Changes..."
              : "Save Changes"
            : isSubmitting
            ? "Publishing..."
            : "Publish Event"}
        </Button>
      </div>
    </form>
  );
};
