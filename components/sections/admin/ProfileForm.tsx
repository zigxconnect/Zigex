"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/uiComponent/Select";
import { Textarea } from "@/components/uiComponent/Textarea";
import { FileUpload } from "@/components/uiComponent/FileUpload";
// import { Textarea } from "@/components/ui/textarea";

// Reusable section
const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="space-y-6 ">{children}</div>
  </div>
);

// Reusable field
const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-blue-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export const ProfileForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form className="space-y-8">
      <FormSection title="Company Logo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="h-full object-cover"
                />
              ) : (
                <span className="text-slate-500 text-4xl font-bold">TC</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <FormField label="Upload New Logo">
              {/* Update FileUpload component to accept onChange handler */}
              <FileUpload onFileSelect={handleLogoChange} />
            </FormField>
            <ul className="mt-4 text-xs text-gray-500 list-disc list-inside space-y-1">
              <li>Recommended size: 400x400 pixels</li>
              <li>Square format works best</li>
              <li>Will be displayed in various sizes across the platform</li>
            </ul>
          </div>
        </div>
      </FormSection>

      <FormSection title="Company Information">
        <FormField label="Company Name *">
          <Input
            type="text"
            placeholder="Enter your company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </FormField>
        <FormField label="Industry *">
          <Select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Select your industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
          </Select>
        </FormField>
        <FormField label="Company Description">
          <Textarea
            placeholder="Tell us about your company..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
      </FormSection>
    </form>
  );
};
