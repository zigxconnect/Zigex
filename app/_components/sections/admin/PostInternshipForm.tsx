"use client";

import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Button } from "@/app/_components/ui/Button";
import { useState } from "react";

const Checkbox = ({ id, className, ...props }) => (
  <input
    id={id}
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const FormSection = ({ title, children }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-blue-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children, className }) => (
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    deadline: "",
    type: "onsite", // Default value
    compensation: "",
    category: "",
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/companies/internships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        required_skills: skills,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Internship posted successfully:', data);
    } else {
      console.error('Error posting internship:', data.error);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Internship Information">
        <FormField label="Internship Title*" className="md:col-span-2">
          <Input
            type="text"
            placeholder="e.g., Software Development Intern"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Description*" className="md:col-span-2">
          <Textarea
            rows={4}
            placeholder="Describe the internship role..."
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Location*">
          <Input
            type="text"
            placeholder="e.g., Bamenda, Cameroon"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Start Date*">
          <Input
            type="datetime-local"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Deadline*" className="md:col-span-2">
          <Input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Internship Type*">
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </FormField>

        <FormField label="Compensation*" className="md:col-span-2">
          <Input
            type="text"
            placeholder="e.g., $500/month"
            name="compensation"
            value={formData.compensation}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Category*">
          <Input
            type="text"
            placeholder="e.g., Engineering, Marketing"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </FormField>
      </FormSection>

      <FormSection title="Requirements & Skills">
        <FormField label="Required Skills*" className="md:col-span-2">
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
            {skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </FormField>
      </FormSection>

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