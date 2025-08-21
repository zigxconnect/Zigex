"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/uiComponenet/Select";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { useState } from "react";

// ✅ Embedded Checkbox component
const Checkbox = ({
  id,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    id={id}
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

// 🔁 Reusable Section Component
const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

// 🔁 Reusable Field Wrapper
const FormField = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-blue-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export const PostInternshipForm = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  return (
    <form className="space-y-8">
      {/* Basic Info */}
      <FormSection title="Internship Information">
        <FormField label="Internship Title*" className="md:col-span-2">
          <Input type="text" placeholder="e.g., Software Development Intern" />
        </FormField>

        <FormField label="Industry*">
          <Select>
            <option value="">Select an industry</option>
            <option>Software</option>
            <option>Finance</option>
            <option>Marketing</option>
          </Select>
        </FormField>

        <FormField label="Location*">
          <Input type="text" placeholder="e.g., Bamenda, Cameroon" />
        </FormField>
      </FormSection>

      {/* Job Details */}
      <FormSection title="Job Details">
        <FormField label="Job Description*" className="md:col-span-2">
          <Textarea rows={6} placeholder="Describe the internship role..." />
        </FormField>
        <FormField label="Key Responsibilities" className="md:col-span-2">
          <Textarea rows={6} placeholder="List the responsibilities..." />
        </FormField>
      </FormSection>

      {/* Requirements */}
      <FormSection title="Requirements & Skills">
        <FormField label="Required Skills*" className="md:col-span-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., JavaScript, Communication"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <Button type="button" onClick={addSkill} variant="orange" >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill, i) => (
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

      {/* Compensation */}
      <FormSection title="Compensation"  >
        <div className="md:col-span-2">
          <div className="flex items-start gap-3">
            <Checkbox id="paid" className="mt-1" />
            <div>
              <label htmlFor="paid" className="text-sm font-medium text-blue-700">
                This is a paid internship
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Check this box if you will be providing monetary compensation for this internship position.
              </p>
            </div>
          </div>
      </div>
      </FormSection>


      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {/* @ts-ignore */}
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="button" >
          Save as Draft
        </Button>
        <Button type="submit" variant="orange">Publish Internship</Button>
      </div>
    </form>
  );
};




