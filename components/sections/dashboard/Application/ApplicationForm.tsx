"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormField {
  label: string;
  name: string;
  type: "text" | "textarea" | "select" | "file" | "checkbox";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helperText?: string;
}

interface ApplicationFormProps {
  type: "event" | "program" | "internship";
  id: string;
  title: string;
  fields: FormField[];
  onSubmit: (data: FormData) => Promise<void>;
}

export function ApplicationForm({ type, id, title, fields, onSubmit }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append(`${type}_id`, id);
      await onSubmit(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h3>
        <p className="text-muted-foreground font-medium">
          Thank you for your application. We'll review it and get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="space-y-6">
        {fields.map((field) => (
          <motion.div
            key={field.name}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label 
              htmlFor={field.name} 
              className="block text-xs font-bold text-foreground uppercase tracking-widest"
            >
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-xl border border-border bg-card shadow-sm 
                  focus:border-primary focus:ring-2 focus:ring-primary/20 
                  transition-all duration-200 resize-none px-4 py-3
                  placeholder:text-muted-foreground/50 font-medium"
              />
            ) : field.type === "select" ? (
              <div className="relative">
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="w-full rounded-xl border border-border bg-card shadow-sm 
                    focus:border-primary focus:ring-2 focus:ring-primary/20 
                    transition-all duration-200 pl-4 pr-10 py-3 appearance-none
                    cursor-pointer text-foreground font-medium"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ) : field.type === "file" ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor={field.name}
                  className="w-full cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-gray-200 border-dashed rounded-lg 
                    bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required={field.required}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            ) : field.type === "checkbox" ? (
              <div className="flex items-start space-x-3 bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  required={field.required}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary 
                    focus:ring-offset-2 transition duration-200 mt-1"
                />
                <label htmlFor={field.name} className="text-sm text-gray-600 leading-relaxed cursor-pointer select-none">
                  {field.label}
                </label>
              </div>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-border bg-card shadow-sm 
                  focus:border-primary focus:ring-2 focus:ring-primary/20 
                  transition-all duration-200 px-4 py-3
                  placeholder:text-muted-foreground/50 font-medium"
              />
            )}

            {field.helperText && (
              <p className="text-sm text-gray-500 mt-1">{field.helperText}</p>
            )}
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-4 text-destructive bg-destructive/10 rounded-xl border border-destructive/20"
        >
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </motion.div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-6 bg-primary
          hover:bg-primary/90 text-white rounded-2xl
          shadow-lg shadow-primary/20 transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center space-x-2 font-bold uppercase tracking-widest text-sm`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit Application</span>
        )}
      </Button>
    </motion.form>
  );
}