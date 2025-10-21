"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type FormType = "event" | "program" | "internship";

interface FormField {
  label: string;
  name: string;
  type?: "text" | "textarea" | "select" | "file" | "checkbox" | "hidden";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  value?: string;
}

interface FormContentProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText: string;
}

// ✨ UPDATED: Form fields now perfectly match what the backend API expects.
const formContents: Record<FormType, FormContentProps> = {
  program: {
    title: "Program Application",
    subtitle: "Fill in your details to apply for this program.",
    submitText: "Enroll",
    fields: [
      {
        label: "Your Current Experience Level",
        name: "level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      {
        label: "What are your expectations for this program?",
        name: "expectations",
        type: "textarea",
        placeholder: "e.g., I hope to learn advanced React hooks...",
        required: true,
      },
      {
        label: "Any additional comments or questions?",
        name: "comments",
        type: "textarea",
        placeholder: "(Optional)",
      },
    ],
  },
  event: {
    title: "Event RSVP",
    subtitle: "Fill in the details to confirm your attendance.",
    submitText: "RSVP",
    fields: [
      {
        label: "What do you hope to gain from attending?",
        name: "expectations",
        type: "textarea",
        placeholder: "e.g., Networking with industry professionals...",
      },
      {
        label: "Any additional comments?",
        name: "comments",
        type: "textarea",
        placeholder: "(Optional)",
      },
      // This hidden field sends 'true' when the form is submitted
      { label: "", name: "rsvp_status", type: "hidden", value: "true" },
    ],
  },
  internship: {
    title: "Internship Application",
    subtitle: "Apply for this internship opportunity.",
    submitText: "Apply",
    fields: [
      {
        label: "Duration (in months)",
        name: "duration",
        type: "text",
        placeholder: "e.g., 3",
        required: true,
      },
      {
        label: "Preferred Department",
        name: "department",
        type: "select",
        options: ["Frontend", "Backend", "AI / ML", "Data Science", "DevOps"],
        required: true,
      },
      {
        label: "Preferred Work Mode",
        name: "location", // This name is used for work_mode
        type: "select",
        options: ["On-site", "Remote", "Hybrid"],
        required: true,
      },
      {
        label: "What are your expectations for this internship?",
        name: "expectations",
        type: "textarea",
        required: true,
      },
      {
        label: "Upload Resume (PDF, DOC, DOCX)",
        name: "resume",
        type: "file",
        required: true,
      },
    ],
  },
};

// ✨ FIX: This is now a single string, as intended.
const apiEndpoint = "/api/students/applications";

// The component accepts a `type` and an `id` prop
interface DynamicFormProps {
  type: FormType;
  id: string; // The UUID of the program, event, or internship
}
// ✨ FIX: Removed the duplicate interface definition that was here.

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

    // This is the CRITICAL line that tells our unified backend which type of application this is.
    formData.append(`${type}_id`, id);

    try {
      // ✨ FIX: The fetch call now correctly uses the single endpoint string.
      const response = await fetch(apiEndpoint, {
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
        <p className="mb-4 m-2 text-gray-600">{currentContent.subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentContent.fields.map((field) => {
          if (field.type === "hidden") {
            return (
              <input
                type="hidden"
                key={field.name}
                name={field.name}
                value={field.value}
              />
            );
          }
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
          }
          if (field.type === "select") {
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
                  <option value="">Please select</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.type === "file") {
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
          }
          // Default to text input
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium">{field.label}</label>
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                className="mt-1 w-full border rounded p-2"
              />
            </div>
          );
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
