"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "next/navigation"; // ✅ import params

// --- UI Components ---
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { FileUploadButton } from "@/components/ui/FileUploadButton";
import { Spinner } from "@/components/uiComponent/Spinner";
import { getRawProfileInfo, UserProfile } from "@/lib/actions/profile.actions";
import { ApplicationPreview } from "../../internships/ApllicationPreview";

// --- Validation Schema ---
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const applicationSchema = z.object({
  cover_letter_file: z
    .instanceof(File, { message: "A cover letter file is required." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf files are accepted."
    ),
  support_letter_file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf files are accepted."
    )
    .optional(),
});
type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationModalProps {
  internshipTitle: string;
  internshipId?: string; // optional, can fallback to URL
  onClose: () => void;
}

export const ApplicationModal = ({
  internshipTitle,
  internshipId,
  onClose,
}: ApplicationModalProps) => {
  const params = useParams(); // ✅ get params
  const urlId = params?.id as string | undefined; // id from URL
  const finalInternshipId = internshipId || urlId; // ✅ fallback logic

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
  });

  const {
    formState: { isSubmitting },
    trigger,
    getValues,
  } = form;

  // --- Load Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        const profileData = await getRawProfileInfo();
        if (profileData) {
          setProfile(profileData);
        } else {
          setProfileError(
            "Your profile could not be found. Please complete your profile before applying."
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfileError(
          "An unexpected error occurred while loading your profile."
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleNextToPreview = async () => {
    const isValid = await trigger(["cover_letter_file", "support_letter_file"]);
    if (isValid && profile) {
      setCurrentStep(2);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
    setSubmissionError(null);
  };

  const onSubmit = async () => {
    setSubmissionError(null);

    if (!finalInternshipId) {
      setSubmissionError(
        "Internship ID is missing. Please refresh and try again."
      );
      return;
    }

    const data = getValues();
    const formData = new FormData();

    console.log(
      "Submitting Application with Internship ID:",
      finalInternshipId
    );

    formData.append("internship_id", finalInternshipId);
    formData.append("cover_letter_file", data.cover_letter_file);

    if (data.support_letter_file) {
      formData.append("support_letter_file", data.support_letter_file);
    }

    try {
      const response = await fetch("/api/students/applications/manual", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      console.log("Server Response:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        throw new Error(errorData.error || "Failed to submit application.");
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: "Application submitted successfully!" };
      }

      alert(
        responseData.message ||
          `Application for ${internshipTitle} submitted successfully!`
      );
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionError((error as Error).message);
    }
  };

  // --- UI (same as before) ---
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#193CB8]">
              Apply for: {internshipTitle}
            </h2>
            <p className="text-sm text-gray-600">
              Step {currentStep} of 2:{" "}
              {currentStep === 1 ? "Upload Documents" : "Review & Submit"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto">
          {profileError && (
            <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Could not load profile</p>
                <p>{profileError}</p>
              </div>
            </div>
          )}

          {submissionError && (
            <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Submission Error</p>
                <p>{submissionError}</p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="cover_letter_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Letter (PDF, Max 2MB)</FormLabel>
                      <FormControl>
                        <FileUploadButton
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="support_letter_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Support Letter (Optional PDF, Max 2MB)
                      </FormLabel>
                      <FormControl>
                        <FileUploadButton
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {currentStep === 2 && profile && (
            <ApplicationPreview
              profileData={profile}
              applicationData={getValues()}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          {currentStep === 2 && (
            <Button variant="secondary" onClick={handleBackToForm}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Edit
            </Button>
          )}

          <div className="flex-grow"></div>

          {currentStep === 1 && (
            <Button
              onClick={handleNextToPreview}
              disabled={isLoadingProfile || !!profileError}
              className="group"
            >
              {isLoadingProfile ? (
                <>
                  <Spinner className="mr-2" />
                  Loading Profile...
                </>
              ) : (
                <>
                  Preview Application
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </Button>
          )}

          {currentStep === 2 && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" /> Submitting...
                </>
              ) : (
                "Confirm & Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
