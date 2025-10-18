"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "./ApplicationForm";

type ApplicationType = "event" | "program" | "internship";

interface ApplicationModalProps {
  type: ApplicationType;
  id?: string;
  buttonText?: string;
  title?: string;
  description?: string;
}

const defaultTitles = {
  event: "Apply for Event",
  program: "Apply for Program",
  internship: "Apply for Internship",
};

const defaultDescriptions = {
  event: "Fill in your details to RSVP for this event.",
  program: "Complete the form below to apply for this program.",
  internship: "Submit your application for this internship position.",
};

export function ApplicationModal({
  type,
  id = "",
  buttonText = "Apply Now",
  title = defaultTitles[type],
  description = defaultDescriptions[type],
}: ApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Field definitions based on application type
  const getFields = () => {
    switch (type) {
      case "program":
        return [
          {
            label: "Full Name",
            name: "fullName",
            type: "text" as const,
            required: true,
            placeholder: "Enter your full name",
          },
          {
            label: "Program Level",
            name: "level",
            type: "select" as const,
            options: ["Beginner", "Intermediate", "Advanced"],
            required: true,
          },
          {
            label: "Why are you interested in this program?",
            name: "motivation",
            type: "textarea" as const,
            required: true,
            placeholder: "Tell us about your motivation and goals...",
          },
          {
            label: "Upload your CV",
            name: "cv",
            type: "file" as const,
            required: true,
            helperText: "PDF or DOC format, max 10MB",
          },
          {
            label: "I agree to the program terms and conditions",
            name: "terms",
            type: "checkbox" as const,
            required: true,
          },
        ];
      case "event":
        return [
          {
            label: "Full Name",
            name: "fullName",
            type: "text" as const,
            required: true,
            placeholder: "Enter your full name",
          },
          {
            label: "Email",
            name: "email",
            type: "text" as const,
            required: true,
            placeholder: "Enter your email",
          },
          {
            label: "What do you hope to learn from this event?",
            name: "expectations",
            type: "textarea" as const,
            required: true,
            placeholder: "Share your expectations...",
          },
          {
            label: "I understand this is a live event and will attend on time",
            name: "attendance",
            type: "checkbox" as const,
            required: true,
          },
        ];
      case "internship":
        return [
          {
            label: "Full Name",
            name: "fullName",
            type: "text" as const,
            required: true,
            placeholder: "Enter your full name",
          },
          {
            label: "Email",
            name: "email",
            type: "text" as const,
            required: true,
            placeholder: "Enter your email",
          },
          {
            label: "Phone",
            name: "phone",
            type: "text" as const,
            required: true,
            placeholder: "Enter your phone number",
          },
          {
            label: "Experience Level",
            name: "experience",
            type: "select" as const,
            options: ["Entry Level", "1-2 years", "3-5 years", "5+ years"],
            required: true,
          },
          {
            label: "Why would you be a good fit for this role?",
            name: "coverLetter",
            type: "textarea" as const,
            required: true,
            placeholder: "Tell us about your relevant skills and experience...",
          },
          {
            label: "Upload your Resume",
            name: "resume",
            type: "file" as const,
            required: true,
            helperText: "PDF or DOC format, max 10MB",
          },
          {
            label: "I confirm all information provided is accurate",
            name: "confirmation",
            type: "checkbox" as const,
            required: true,
          },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const endpoint = `/api/applications/${type}/${id}`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit application");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 
            hover:from-blue-700 hover:to-blue-800 text-white font-semibold 
            py-3 px-6 rounded-lg shadow-md hover:shadow-lg 
            transition-all duration-200 ease-in-out transform 
            hover:scale-[1.02] active:scale-[0.98]"
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] 
        overflow-y-auto bg-gradient-to-b from-blue-50/60 to-white/80 backdrop-blur-lg 
        shadow-2xl rounded-2xl border-0 p-0">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-6 border-b border-gray-100">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* content wrapper with blue tint and extra bottom padding so mobile bars don't overlap */}
        <div className="p-6 pb-28">
          <div className="rounded-lg bg-white/60 backdrop-blur-sm p-4">
            <ApplicationForm
              type={type}
              id={id}
              title={title}
              fields={getFields()}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Mobile sticky bottom bar inside modal (safe area aware) */}
        <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 flex items-center justify-between gap-4 py-3 px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v6l4-2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Apply</div>
                <div className="text-sm font-medium text-gray-900">{title}</div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button onClick={() => setIsOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow">Open Form</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}