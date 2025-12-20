"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Calendar, Briefcase, GraduationCap } from "lucide-react";

type FormType = "event" | "program" | "internship";

interface FormField {
  label: string;
  name: string;
  type?: "text" | "textarea" | "select" | "file" | "checkbox" | "hidden";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  value?: string;
  helperText?: string;
}

interface FormContentProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText: string;
}

// Form fields match the backend API expectations
const formContents: Record<FormType, FormContentProps> = {
  program: {
    title: "Program Application",
    subtitle: "Fill in your details to apply for this program.",
    submitText: "Enroll",
    fields: [
      {
        label: "Full Name",
        name: "programName",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
      },
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
      {
        label: "I understand this is a year-long program running every weekend (Saturday and Sunday)",
        name: "info",
        type: "checkbox",
        required: true,
      },
    ],
  },
  event: {
    title: "Event RSVP",
    subtitle: "Fill in the details to confirm your attendance.",
    submitText: "RSVP",
    fields: [
      {
        label: "Full Name",
        name: "name",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
      },
      {
        label: "What do you hope to gain from attending?",
        name: "expectations",
        type: "textarea",
        placeholder: "e.g., Networking with industry professionals...",
        required: true,
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
        placeholder: "Tell us about your motivation, relevant skills, and what you hope to learn...",
        required: true,
      },
      {
        label: "Upload Resume (PDF, DOC, DOCX)",
        name: "resume",
        type: "file",
        required: true,
        helperText: "PDF, DOC, or DOCX format • Max 10MB",
      },
    ],
  },
};

// Unified API endpoint for all application types
const apiEndpoint = "/api/students/applications";

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

    // This is the CRITICAL line that tells our unified backend which type of application this is.
    formData.append(`${type}_id`, id);

    try {
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
    <div className="z-50 relative p-6 sm:p-8 lg:p-12 bg-card rounded-3xl border border-border shadow-sm">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <FormIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-tight mb-3">
          {currentContent.title}
        </h1>
        {currentContent.subtitle && (
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">{currentContent.subtitle}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
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

          const commonLabel = (
            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest ml-1">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
          );

          if (field.type === "textarea") {
            return (
              <div key={field.name} className="space-y-2">
                {commonLabel}
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none text-foreground bg-muted/20 font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name} className="space-y-2">
                {commonLabel}
                <select
                  name={field.name}
                  required={field.required}
                  className="w-full px-5 py-4 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 bg-muted/20 text-foreground cursor-pointer appearance-none font-medium"
                >
                  <option value="" className="bg-card">Select Option</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option} className="bg-card">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <div
                key={field.name}
                className="flex items-center gap-4 p-5 border border-border rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all duration-200"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    className="h-5 w-5 rounded-lg border border-border text-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 cursor-pointer bg-card"
                  />
                </div>
                <label
                  htmlFor={field.name}
                  className="text-xs font-bold text-foreground leading-tight cursor-pointer select-none flex-1 uppercase tracking-tight"
                >
                  {field.label}
                </label>
              </div>
            );
          }

          if (field.type === "file") {
            return (
              <div key={field.name} className="space-y-2">
                {commonLabel}
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  accept=".pdf,.doc,.docx"
                  required={field.required}
                  className="block w-full text-xs text-muted-foreground 
                    file:mr-4 file:py-2.5 file:px-5 
                    file:rounded-xl file:border-0 
                    file:text-[10px] file:font-bold file:uppercase file:tracking-widest
                    file:bg-primary file:text-white 
                    hover:file:bg-primary/90 file:transition-all 
                    file:duration-200 file:cursor-pointer
                    focus:outline-none focus:ring-4 focus:ring-primary/10
                    border border-border rounded-2xl p-3 bg-muted/20"
                />
                {field.helperText && (
                  <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1 opacity-60">{field.helperText}</p>
                )}
              </div>
            );
          }

          // Default to text input
          return (
            <div key={field.name} className="space-y-2">
              {commonLabel}
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-5 py-4 rounded-2xl border border-border 
                  focus:border-primary focus:ring-4 focus:ring-primary/10 
                  transition-all duration-200 text-foreground 
                  font-medium placeholder:text-muted-foreground/50 bg-muted/20"
              />
            </div>
          );
        })}

        {error && (
          <div className="p-4 text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in fade-in slide-in-from-top-2 uppercase tracking-tight">
            Submission Error: {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full mt-10 py-7 text-xs font-bold uppercase tracking-[0.2em]
            bg-primary hover:bg-primary/90 text-white
            rounded-2xl shadow-xl shadow-primary/20
            transition-all duration-300 ease-in-out 
            transform hover:scale-[1.01] active:scale-[0.99]
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