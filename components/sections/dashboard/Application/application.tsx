"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Calendar, Briefcase, GraduationCap } from "lucide-react";

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
    helperText?: string;
  }[];
  submitText: string;
}

const formContents: Record<FormType, FormContentProps> = {
  program: {
    title: "Program Enrollment",
    subtitle: "Join our comprehensive program",
    submitText: "Submit Enrollment",
    fields: [
      {
        label: "Full Name",
        name: "programName",
        type: "text",
        placeholder: "Enter your full name",
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
        label: "What are your expectations?",
        name: "expectations",
        type: "textarea",
        placeholder: "Tell us what you hope to achieve from this program...",
        required: true,
      },
      { 
        label: "Additional Comments", 
        name: "comments", 
        type: "textarea",
        placeholder: "Any additional information you'd like to share (optional)"
      },
      {
        label: "I understand this is a year-long program running every weekend (Saturday and Sunday)",
        name: "info",
        type: "checkbox",
        required: true,
      },
    ],
  },
  event: {
    title: "Event Registration",
    subtitle: "Join us for this amazing event",
    submitText: "Complete Registration",
    fields: [
      {
        label: "Full Name",
        name: "name",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
      },
      {
        label: "What are your expectations?",
        name: "expectations",
        type: "textarea",
        placeholder: "Tell us what you hope to gain from this event...",
        required: true,
      },
    ],
  },
  internship: {
    title: "Internship Application",
    subtitle: "Take the next step in your career",
    submitText: "Submit Application",
    fields: [
      {
        label: "Duration Preference",
        name: "duration",
        type: "select",
        options: ["1-3 months", "3-6 months", "6-12 months", "Flexible"],
        required: true,
      },
      {
        label: "Preferred Department",
        name: "department",
        type: "select",
        options: ["Frontend", "Backend", "AI / ML", "Data Science", "DevOps", "Full Stack"],
        required: true,
      },
      {
        label: "Work Location Preference",
        name: "location",
        type: "select",
        options: ["On-site", "Remote", "Hybrid"],
        required: true,
      },
      {
        label: "Why are you interested in this internship?",
        name: "expectations",
        type: "textarea",
        placeholder: "Tell us about your motivation, relevant skills, and what you hope to learn...",
        required: true,
      },
      {
        label: "Upload Your Resume",
        name: "resume",
        type: "file",
        required: true,
        helperText: "PDF, DOC, or DOCX format • Max 10MB",
      },
    ],
  },
};

const apiEndpoints: Record<FormType, string> = {
  event: "/api/students/applications/events/rsvp",
  program: "/api/students/applications/programs/apply",
  internship: "/api/students/applications/internship",
};

interface DynamicFormProps {
  type: FormType;
  id: string;
}

const getFormIcon = (type: FormType) => {
  switch (type) {
    case "event":
      return Calendar;
    case "program":
      return GraduationCap;
    case "internship":
      return Briefcase;
    default:
      return Calendar;
  }
};

export default function DynamicForm({ type, id }: DynamicFormProps) {
  const currentContent = formContents[type];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const FormIcon = getFormIcon(type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    formData.append(`${type}_id`, id);

    try {
      const endpoint = apiEndpoints[type];
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server returned an invalid response");
      }

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
      <div className="p-8 sm:p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Application Submitted!
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">{successMessage}</p>
          <p className="text-sm text-gray-500">We'll review your application and get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
          <FormIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {currentContent.title}
        </h1>
        {currentContent.subtitle && (
          <p className="text-gray-600 text-base">{currentContent.subtitle}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        {currentContent.fields.map((field) => {
          if (field.type === "textarea") {
            return (
              <div key={field.name} className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
                />
              </div>
            );
          } else if (field.type === "select") {
            return (
              <div key={field.name} className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  name={field.name}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white text-gray-800 cursor-pointer appearance-none group-hover:border-gray-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                >
                  <option value="">Select an option</option>
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
                className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="mt-0.5 h-5 w-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                />
                <label
                  htmlFor={field.name}
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none flex-1"
                >
                  {field.label}
                </label>
              </div>
            );
          } else if (field.type === "file") {
            return (
              <div key={field.name} className="group">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  accept=".pdf,.doc,.docx"
                  required={field.required}
                  className="block w-full text-sm text-gray-600 
                    file:mr-4 file:py-3 file:px-6 
                    file:rounded-xl file:border-0 
                    file:text-sm file:font-semibold 
                    file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 
                    file:text-white hover:file:from-blue-700 
                    hover:file:to-indigo-700 file:transition-all 
                    file:duration-200 file:cursor-pointer file:shadow-md
                    focus:outline-none focus:ring-4 focus:ring-blue-100
                    border-2 border-gray-200 rounded-xl p-3 group-hover:border-gray-300 transition-all duration-200"
                />
                {field.helperText && (
                  <p className="mt-2 text-xs text-gray-500">{field.helperText}</p>
                )}
              </div>
            );
          } else {
            return (
              <div key={field.name} className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                    transition-all duration-200 text-gray-800 
                    placeholder-gray-400 bg-white group-hover:border-gray-300"
                />
              </div>
            );
          }
        })}

        {error && (
          <div className="p-4 text-sm text-red-800 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full mt-8 py-4 text-base font-semibold
            bg-gradient-to-r from-blue-600 to-indigo-600
            hover:from-blue-700 hover:to-indigo-700 text-white
            rounded-xl shadow-lg hover:shadow-xl 
            transition-all duration-300 ease-in-out 
            transform hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 border-0" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <span>{currentContent.submitText}</span>
          )}
        </Button>
      </form>
    </div>
  );
}