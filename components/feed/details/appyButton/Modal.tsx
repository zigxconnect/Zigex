import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Calendar, Briefcase, GraduationCap, Loader2, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definitions
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

// Form configurations
const formContents: Record<FormType, { title: string; subtitle?: string; submitText: string; fields: FormField[] }> = {
  program: {
    title: "Program Application",
    subtitle: "Fill in your details to apply for this program.",
    submitText: "Submit Application",
    fields: [
      { label: "Full Name", name: "programName", type: "text", placeholder: "Enter your full name", required: true },
      { label: "Experience Level", name: "level", type: "select", options: ["Beginner", "Intermediate", "Advanced"], required: true },
      { label: "Your Expectations", name: "expectations", type: "textarea", placeholder: "What do you hope to achieve from this program?", required: true },
      { label: "Additional Comments", name: "comments", type: "textarea", placeholder: "Any questions or additional information? (Optional)" },
      { label: "I understand this is a year-long program running every weekend", name: "info", type: "checkbox", required: true },
    ],
  },
  event: {
    title: "Event RSVP",
    subtitle: "Confirm your attendance for this event.",
    submitText: "Confirm RSVP",
    fields: [
      { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name", required: true },
      { label: "What do you hope to gain?", name: "expectations", type: "textarea", placeholder: "e.g., Networking, learning new skills...", required: true },
      { label: "Additional Comments", name: "comments", type: "textarea", placeholder: "Any questions or dietary requirements? (Optional)" },
      { label: "", name: "rsvp_status", type: "hidden", value: "true" },
    ],
  },
  internship: {
    title: "Internship Application",
    subtitle: "Apply for this exciting opportunity.",
    submitText: "Submit Application",
    fields: [
      { label: "Duration", name: "duration", type: "select", options: ["1-3 months", "3-6 months", "6-12 months", "Flexible"], required: true },
      { label: "Preferred Department", name: "department", type: "select", options: ["Frontend", "Backend", "AI / ML", "Data Science", "DevOps", "Full Stack"], required: true },
      { label: "Work Mode Preference", name: "location", type: "select", options: ["On-site", "Remote", "Hybrid"], required: true },
      { label: "Your Expectations & Skills", name: "expectations", type: "textarea", placeholder: "Tell us about your motivation, skills, and what you hope to learn...", required: true },
      { label: "Resume", name: "resume", type: "file", required: true, helperText: "PDF, DOC, or DOCX • Max 10MB" },
    ],
  },
};

const getFormIcon = (type: FormType) => {
  switch (type) {
    case "event": return Calendar;
    case "program": return GraduationCap;
    case "internship": return Briefcase;
  }
};

// Main Modal Component
export default function ApplicationModal({
  isOpen,
  onClose,
  type,
  id,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: FormType;
  id: string;
  title: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const currentContent = formContents[type];
  const FormIcon = getFormIcon(type);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    
    // Add file if present
    if (file) {
      submitData.append('resume', file);
    }
    
    // Add type-specific ID
    submitData.append(`${type}_id`, id);

    try {
      const response = await fetch("/api/students/applications", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({});
        setFile(null);
        setFileName("");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
      setSuccess(false);
      setFormData({});
      setFile(null);
      setFileName("");
    }
  };

  const [isFormValid, setIsFormValid] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Mount component on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkFormValid = () => {
    return currentContent.fields.every(field => {
      if (!field.required) return true;
      if (field.type === "hidden") return true;
      if (field.type === "file") return file !== null;
      return formData[field.name] && formData[field.name] !== "";
    });
  };

  if (!isOpen) return null;

  // Success State
  if (success) {
    if (!isMounted) return null;
    
    return createPortal(
      <div className="fixed w-screen h-screen inset-0 flex items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-200 p-4" style={{ zIndex: 9999 }}>
        <div className="relative w-full max-w-sm mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 sm:mb-3">
            Success!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
            Your application has been submitted successfully.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            We'll review it and get back to you soon.
          </p>
        </div>
      </div>,
      document.body
    );
  }

  if (!isMounted) return null;

  return createPortal(
    <div 
      className="w-screen h-screen fixed inset-0 flex items-center sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-4 mb-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div 
        className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-950 sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border-t sm:border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-blue-600 to-indigo-600 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FormIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate line-clamp-1">
                {currentContent.title}
              </h2>
              <p className="text-xs sm:text-xs text-blue-100 truncate line-clamp-1">
                {title}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0 bg-white rounded-full p-3"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-sm">
              <AlertDescription className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                {currentContent.subtitle}
              </AlertDescription>
            </Alert>

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 text-sm">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm text-red-900 dark:text-red-100 ml-1">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            {currentContent.fields.map((field) => {
              if (field.type === "hidden") {
                return null;
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <select
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 text-sm text-gray-900 dark:text-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
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
              }

              if (field.type === "checkbox") {
                return (
                  <div key={field.name} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={formData[field.name] || false}
                      onChange={(e) => handleInputChange(field.name, e.target.checked)}
                      className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-md border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor={field.name} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer select-none flex-1">
                      {field.label}
                    </label>
                  </div>
                );
              }

              if (field.type === "file") {
                return (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id={field.name}
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor={field.name}
                        className="flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-3 sm:py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                          {fileName || "Choose file or drag"}
                        </span>
                      </label>
                    </div>
                    {field.helperText && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{field.helperText}</p>
                    )}
                  </div>
                );
              }

              // Default: text input
              return (
                <div key={field.name} className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              );
            })}

            <div className="h-4" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !checkFormValid()}
            className="w-full py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              currentContent.submitText
            )}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}