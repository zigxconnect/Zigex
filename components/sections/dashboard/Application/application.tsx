"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type FormType = "event" | "program" | "internship";

interface FormContentProps {
  title: string;
  subtitle?: string;
  fields: {
    label: string;
    name: string;
    type?: "text" | "textarea" | "select" | "file" | "checkbox";
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }[];
  submitText: string;
}

const formContents: Record<FormType, FormContentProps> = {
  program: {
    title: "Program Form",
    subtitle: "Fill in your program details",
    submitText: "Enroll",
    fields: [
      { label: "Program Name", name: "eventName", type: "text", required: true },
      {
        label: "Level of Experience",
        name: "level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      {
        label: "Expectations",
        name: "expectations",
        type: "textarea",
        required: true,
      },
      { label: "Comments", name: "comments", type: "textarea" },
      {
        label:
          "Weekend of code is a year long program that runs every weekend Saturday and Sunday",
        name: "info",
        type: "checkbox",
        required: true,
      },
    ],
  },
  event: {
    title: "Event Form",
    subtitle: "Fill in the details for the event",
    submitText: "RSVP",
    fields: [
      {
        label: "Name",
        name: "name",
        type: "text",
        placeholder: "Enter your name",
        required: true,
      },
      {
        label: "Expectations",
        name: "expectations",
        type: "textarea",
        placeholder: "Your expectations",
        required: true,
      },
    ],
  },
  internship: {
    title: "Internship Form",
    subtitle: "Apply for an internship",
    submitText: "Apply",
    fields: [
      { label: "Duration", name: "duration", type: "text", required: true },
      {
        label: "Department",
        name: "department",
        type: "select",
        options: ["Frontend", "Backend", "AI / ML", "Data Science", "DevOps"],
        required: true,
      },
      {
        label: "Location",
        name: "location",
        type: "select",
        options: ["On-site", "Remote", "Hybrid"],
        required: true,
      },
      {
        label: "Expectations",
        name: "expectations",
        type: "textarea",
        required: true,
      },
      {
        label: "Upload Resume",
        name: "resume",
        type: "file",
        required: true,
      },
    ],
  },
};

export default function DynamicForm({ type }: { type: FormType }) {
  const [formType] = useState<FormType>(type);
  const currentContent = formContents[formType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);

    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        data[key] = value.name; 
      } else {
        data[key] = value;
      }
    });

    console.log(`Submitting ${formType} form:`, data);
    alert("Form submitted! Check console for data.");
  };

  return (
    <main className="p-5 max-w-md mx-auto shadow-md rounded-xl border border-gray-200 mt-4">
      <h1 className="text-2xl font-bold text-center text-[#155DFC] m-2">{currentContent.title}</h1>
      {currentContent.subtitle && (
        <p className=" mb-4 m-2, text-[#155DFC] ">{currentContent.subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentContent.fields.map((field) => {
          if (field.type === "textarea") {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="mt-1 w-full border rounded p-2"
                />
              </div>
            );
          } else if (field.type === "select") {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium">
                  {field.label}
                </label>
                <select
                  name={field.name}
                  required={field.required}
                  className="mt-1 w-full border rounded p-2"
                >
                  <option value="">Select</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          } else if (field.type === "checkbox") {
            return (
              <div
                key={field.name}
                className="flex items-start gap-2 p-2 border rounded-md bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={field.name}
                  className="text-sm text-gray-700 leading-snug cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            );
          } else if (field.type === "file") {
            return (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  accept=".pdf,.doc,.docx"
                  required={field.required}
                  className="mt-1 block w-full text-sm text-gray-600 
                             file:mr-4 file:py-2 file:px-4 
                             file:rounded-full file:border-0 
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700 
                             hover:file:bg-blue-100"
                />
              </div>
            );
          } else {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="mt-1 w-full border rounded p-2"
                />
              </div>
            );
          }
        })}

        <Button type="submit" className="w-full mt-4">
          {currentContent.submitText}
        </Button>
      </form>
    </main>
  );
}
