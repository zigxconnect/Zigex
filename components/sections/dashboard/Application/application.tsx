"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Make sure you have `lucide-react` installed

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

// ✨ COMPLETE: The full form definitions are now included here.
const formContents: Record<FormType, FormContentProps> = {
  program: {
    title: "Program Form",
    subtitle: "Fill in your program details",
    submitText: "Enroll",
    fields: [
      {
        label: "Program Name",
        name: "eventName",
        type: "text",
        required: true,
      },
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

// Map form types to their API submission endpoints
const apiEndpoints: Record<FormType, string> = {
  event: "/api/students/applications/events/rsvp",
  program: "/api/students/applications/programs/apply",
  internship: "/api/students/applications/internship",
};

// The component accepts a `type` and an `id` prop
interface DynamicFormProps {
  type: FormType;
  id: string; // The UUID of the program, event, or internship
}

export default function DynamicForm({ type, id }: DynamicFormProps) {
  const currentContent = formContents[type];

  // State management for the submission flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);

    // CRITICAL: Append the specific ID to the form data
    formData.append(`${type}_id`, id);

    try {
      const endpoint = apiEndpoints[type];
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected error occurred.");
      }

      setSuccessMessage(result.message || "Your submission was successful!");
      formElement.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="p-8 max-w-md mx-auto text-center border-2 border-green-500 bg-green-50 rounded-xl mt-4">
        <h2 className="text-2xl font-bold text-green-700">Success!</h2>
        <p className="mt-2 text-green-600">{successMessage}</p>
      </div>
    );
  }

  return (
    <main className="p-5 max-w-md mx-auto shadow-md rounded-xl border border-gray-200 mt-4">
      <h1 className="text-2xl font-bold text-center text-[#155DFC] m-2">
        {currentContent.title}
      </h1>
      {currentContent.subtitle && (
        <p className="mb-4 m-2 text-[#155DFC]">{currentContent.subtitle}</p>
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
                  className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            currentContent.submitText
          )}
        </Button>
      </form>
    </main>
  );
}
