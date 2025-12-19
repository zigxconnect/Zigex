"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/* Helper UI Components */
/* ------------------------------------------------------------------ */

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-black mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {children}
    </div>
  </div>
);

const FormField = ({
  label,
  children,
  required,
  className,
}: FormFieldProps) => (
  <div className={className}>
    <label className="block text-sm font-medium text-black mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Main Component */
/* ------------------------------------------------------------------ */

interface EditCompanyProfileFormProps {
  initialData: {
    email?: string;
    company_name?: string;
    industry?: string;
    description?: string;
    phone?: string;
    address?: string;
    website_url?: string;
  };
}

export const EditCompanyProfileForm = ({
  initialData,
}: EditCompanyProfileFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Text state
  const [companyName, setCompanyName] = useState(
    initialData.company_name || ""
  );
  const [industry, setIndustry] = useState(initialData.industry || "");
  const [description, setDescription] = useState(
    initialData.description || ""
  );
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [websiteUrl, setWebsiteUrl] = useState(
    initialData.website_url || ""
  );

  // File refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  /* ------------------------------------------------------------------ */
  /* Submit */
  /* ------------------------------------------------------------------ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("industry", industry);
      formData.append("description", description);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("website_url", websiteUrl);

      if (logoInputRef.current?.files?.[0]) {
        formData.append("logo", logoInputRef.current.files[0]);
      }

      if (coverInputRef.current?.files?.[0]) {
        formData.append("cover_image", coverInputRef.current.files[0]);
      }

      const response = await fetch("/api/companies/profiles", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render */
  /* ------------------------------------------------------------------ */

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Company Details */}
      <FormSection title="Company Details">
        <FormField label="Company Name" required className="md:col-span-2">
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Industry" required>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          />
        </FormField>

        <FormField
          label="Company Description"
          required
          className="md:col-span-2"
        >
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      {/* Contact Information */}
      <FormSection title="Contact Information">
        <FormField label="Email Address">
          <Input
            value={initialData.email || ""}
            disabled
            className="bg-slate-50 cursor-not-allowed"
          />
        </FormField>

        <FormField label="Phone Number">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>

        <FormField label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>

        <FormField label="Website URL">
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </FormField>
      </FormSection>

      {/* Branding */}
      <FormSection title="Branding">
        <FormField label="Logo Image">
          <Input type="file" accept="image/*" ref={logoInputRef} />
          <p className="text-xs text-gray-500 mt-1">
            Upload a logo image (JPG, PNG, etc.)
          </p>
        </FormField>

        <FormField label="Cover Image">
          <Input type="file" accept="image/*" ref={coverInputRef} />
          <p className="text-xs text-gray-500 mt-1">
            Upload a cover image (JPG, PNG, etc.)
          </p>
        </FormField>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
