"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/uiComponenet/Select";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { useState } from "react";

// Helper Component: Checkbox
const Checkbox = ({ id, className, ...props }) => (
  <input
    id={id}
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

// Helper Component: FormSection
const FormSection = ({ title, children }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

// Helper Component: FormField
const FormField = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-blue-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

// --- MAIN FORM COMPONENT ---
export const PostInternshipForm = () => {
  // State updated to match the Zod schema
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  
  // New state variables for schema fields
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [internshipType, setInternshipType] = useState("onsite"); // Default to 'onsite' as in schema
  const [compensation, setCompensation] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure dates are converted to ISO 8601 format (datetime) required by the schema
    const formattedStartDate = startDate ? new Date(startDate).toISOString() : "";
    const formattedDeadline = deadline ? new Date(deadline).toISOString() : "";
    
    // Construct the data object to match the 'internshipSchema'
    const internshipData = {
      title,
      description,
      location,
      category,
      start_date: formattedStartDate,
      deadline: formattedDeadline,
      type: internshipType,
      required_skills: requiredSkills,
      // Only include compensation if the internship is paid and details are provided
      compensation: isPaid ? compensation : undefined,
    };

    // The browser automatically sends the auth cookie. Your server middleware reads it.
    // We REMOVE the manual token fetching from localStorage and the Authorization header.
    try {
      const response = await fetch("/api/companies/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The "Authorization: Bearer <token>" header is intentionally removed.
        },
        body: JSON.stringify(internshipData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Log the detailed error from the backend for easier debugging
        console.error("Failed to create internship:", result.error || response.statusText);
        throw new Error(result.error || "Failed to create internship");
      }
      
      console.log("Internship created:", result);
      alert("Internship published successfully!");
      // You can add logic here to reset the form or redirect the user
      // e.g., router.push('/company/dashboard');
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <FormSection title="Internship Information">
        <FormField label="Internship Title*" className="md:col-span-2">
          <Input
            type="text"
            placeholder="e.g., Software Development Intern"
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
            placeholder="e.g., Bamenda, Cameroon"
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

      {/* Job Details */}
      <FormSection title="Job Details">
        <FormField label="Job Description & Responsibilities*" className="md:col-span-2">
          <Textarea
            rows={8}
            placeholder="Provide a detailed description of the role, day-to-day tasks, and key responsibilities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>
      </FormSection>

      {/* Requirements */}
      <FormSection title="Requirements & Skills">
        <FormField label="Required Skills" className="md:col-span-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., JavaScript, Communication"
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

      {/* Compensation */}
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
              <label htmlFor="paid" className="text-sm font-medium text-blue-700">
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
                    placeholder="e.g., $20/hour, $3000/month stipend"
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                />
            </FormField>
          )}

        </div>
      </FormSection>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="button">
          Save as Draft
        </Button>
        <Button type="submit" variant="orange">Publish Internship</Button>
      </div>
    </form>
  );
};