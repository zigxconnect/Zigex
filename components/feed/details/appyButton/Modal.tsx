import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Calendar,
  Briefcase,
  GraduationCap,
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
const formContents: Record<
  FormType,
  { title: string; subtitle?: string; submitText: string; fields: FormField[] }
> = {
  program: {
    title: "Program Application",
    subtitle: "Take the next step in your career journey.",
    submitText: "Submit Application",
    fields: [
      {
        label: "Full Name",
        name: "programName",
        type: "text",
        placeholder: "e.g. Jane Doe",
        required: true,
      },
      {
        label: "Experience Level",
        name: "level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      {
        label: "Your Expectations",
        name: "expectations",
        type: "textarea",
        placeholder: "What do you hope to achieve from this program?",
        required: true,
      },
      {
        label: "Additional Comments",
        name: "comments",
        type: "textarea",
        placeholder: "Any questions or additional information? (Optional)",
      },
      {
        label: "I understand this is a year-long program running every weekend",
        name: "info",
        type: "checkbox",
        required: true,
      },
    ],
  },
  event: {
    title: "Event RSVP",
    subtitle: "Secure your spot for this exclusive event.",
    submitText: "Confirm Attendance",
    fields: [
      {
        label: "Full Name",
        name: "name",
        type: "text",
        placeholder: "e.g. John Smith",
        required: true,
      },
      {
        label: "What do you hope to gain?",
        name: "expectations",
        type: "textarea",
        placeholder: "e.g., Networking, learning new skills...",
        required: true,
      },
      {
        label: "Additional Comments",
        name: "comments",
        type: "textarea",
        placeholder: "Any questions or dietary requirements? (Optional)",
      },
      { label: "", name: "rsvp_status", type: "hidden", value: "true" },
    ],
  },
  internship: {
    title: "Internship Application",
    subtitle: "Launch your career with a top-tier internship.",
    submitText: "Submit Application",
    fields: [
      {
        label: "Duration",
        name: "duration",
        type: "select",
        options: ["1-3 months", "3-6 months", "6-12 months", "Flexible"],
        required: true,
      },
      {
        label: "Preferred Department",
        name: "department",
        type: "select",
        options: [
          "Frontend Engineering",
          "Backend Engineering",
          "AI / Machine Learning",
          "Data Science",
          "DevOps & Cloud",
          "Full Stack Development",
          "Product Design",
        ],
        required: true,
      },
      {
        label: "Work Mode Preference",
        name: "location",
        type: "select",
        options: ["On-site", "Remote", "Hybrid"],
        required: true,
      },
      {
        label: "Your Expectations & Skills",
        name: "expectations",
        type: "textarea",
        placeholder:
          "Briefly describe your motivation, key skills, and what you hope to learn...",
        required: true,
      },
      {
        label: "Resume",
        name: "resume",
        type: "file",
        required: true,
        helperText: "PDF, DOC, or DOCX • Max 10MB",
      },
      {
        label: "Cover Letter",
        name: "cover_letter",
        type: "file",
        required: true,
        helperText: "PDF, DOC, or DOCX • Max 10MB",
      },
    ],
  },
};

const getFormIcon = (type: FormType) => {
  switch (type) {
    case "event":
      return Calendar;
    case "program":
      return GraduationCap;
    case "internship":
      return Briefcase;
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
  
  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const currentContent = formContents[type];
  const FormIcon = getFormIcon(type);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) {
      return `File "${file.name}" exceeds the 10MB limit.`;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return `File "${file.name}" is not a valid document type (PDF, DOC, DOCX).`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        e.target.value = ""; // Clear input
        return;
      }
      setFiles((prev) => ({ ...prev, [name]: selectedFile }));
      setFileNames((prev) => ({ ...prev, [name]: selectedFile.name }));
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [name]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [name]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFiles((prev) => ({ ...prev, [name]: droppedFile }));
      setFileNames((prev) => ({ ...prev, [name]: droppedFile.name }));
      setError(null);
    }
  };

  const removeFile = (name: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[name];
      return newFiles;
    });
    setFileNames((prev) => {
      const newNames = { ...prev };
      delete newNames[name];
      return newNames;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    Object.entries(files).forEach(([key, file]) => {
      submitData.append(key, file);
    });

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
        setFiles({});
        setFileNames({});
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
      setFiles({});
      setFileNames({});
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkFormValid = () => {
    return currentContent.fields.every((field) => {
      if (!field.required) return true;
      if (field.type === "hidden") return true;
      if (field.type === "file") return files[field.name] !== undefined;
      if (field.type === "checkbox") return formData[field.name] === true;
      return formData[field.name] && formData[field.name] !== "";
    });
  };

  if (!isOpen) return null;

  if (success) {
    if (!isMounted) return null;

    return createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 z-[9999]"
      >
        <div className="relative w-full max-w-sm mx-auto bg-white dark:bg-gray-950 rounded-xl shadow-lg p-8 text-center animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Application Sent
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We've received your application and will review it shortly.
          </p>
          <button 
            onClick={handleClose}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  if (!isMounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b-2 border-blue-50 bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg">
              <FormIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white truncate uppercase tracking-wide">
                {currentContent.title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 truncate font-medium">
                {title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar bg-white dark:bg-gray-950">
          <div className="px-6 py-8 space-y-8">
            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F6F8FF] border-2 border-blue-100">
              <Info className="w-5 h-5 text-[#155DFC] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {currentContent.subtitle}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 text-sm rounded-lg animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <AlertDescription className="text-red-900 dark:text-red-100 ml-3 font-medium leading-relaxed">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {currentContent.fields.map((field) => {
                if (field.type === "hidden") return null;

                const commonLabel = (
                  <label className="block text-xs sm:text-sm font-black text-[#155DFC] uppercase tracking-wider mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                );

                if (field.type === "textarea") {
                  return (
                    <div key={field.name} className="group">
                      {commonLabel}
                      <textarea
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-blue-50 bg-slate-50/50 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 transition-all duration-200 resize-none text-sm text-slate-900 placeholder-slate-400 font-medium"
                      />
                    </div>
                  );
                }

                if (field.type === "select") {
                  return (
                    <div key={field.name} className="group">
                      {commonLabel}
                      <div className="relative">
                        <select
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200 text-sm text-gray-900 dark:text-white cursor-pointer appearance-none"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (field.type === "checkbox") {
                  return (
                    <div
                      key={field.name}
                      className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
                      onClick={() =>
                        handleInputChange(field.name, !formData[field.name])
                      }
                    >
                      <div className="relative flex items-center pt-0.5">
                        <input
                          type="checkbox"
                          id={field.name}
                          checked={formData[field.name] || false}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.checked)
                          }
                          className="peer h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                        />
                      </div>
                      <label
                        htmlFor={field.name}
                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer select-none flex-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                      >
                        {field.label}
                      </label>
                    </div>
                  );
                }

                if (field.type === "file") {
                  return (
                    <div key={field.name} className="group">
                      {commonLabel}
                      <div
                        className={cn(
                          "relative group/file w-full",
                          dragActive[field.name] ? "scale-[1.01]" : ""
                        )}
                        onDragEnter={(e) => handleDrag(e, field.name)}
                        onDragLeave={(e) => handleDrag(e, field.name)}
                        onDragOver={(e) => handleDrag(e, field.name)}
                        onDrop={(e) => handleDrop(e, field.name)}
                      >
                        <input
                          type="file"
                          id={field.name}
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, field.name)}
                          className="hidden"
                        />
                        
                        {!fileNames[field.name] ? (
                          <label
                            htmlFor={field.name}
                            className={cn(
                              "flex flex-col items-center justify-center gap-3 w-full px-6 py-8 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer bg-gray-50 dark:bg-gray-900/50",
                              dragActive[field.name]
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOC, DOCX (Max 10MB)
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {fileNames[field.name]}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Ready to upload
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(field.name)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Default: text input
                return (
                  <div key={field.name} className="group">
                    {commonLabel}
                    <input
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-5 border-t-2 border-blue-50 bg-gradient-to-br from-[#F6F8FF] to-blue-50/50 shrink-0 space-y-3 z-10">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !checkFormValid()}
            className="w-full py-3.5 sm:py-4 rounded-2xl font-black uppercase tracking-wider text-sm bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] hover:from-[#1A3CB9] hover:to-[#155DFC] text-white shadow-2xl shadow-blue-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              currentContent.submitText
            )}
          </Button>
          <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1 font-medium">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}