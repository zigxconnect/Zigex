"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "next/navigation";

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
import { X, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, Upload, FileText, Lightbulb } from "lucide-react";
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
  internshipId?: string;
  onClose: () => void;
}

export const ApplicationModal = ({
  internshipTitle,
  internshipId,
  onClose,
}: ApplicationModalProps) => {
  const params = useParams();
  const urlId = params?.id as string | undefined;
  const finalInternshipId = internshipId || urlId;

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

    // console.log(
    //   "Submitting Application with Internship ID:",
    //   finalInternshipId
    // );

    formData.append("internship_id", finalInternshipId);
    formData.append("cover_letter_file", data.cover_letter_file);

    if (data.support_letter_file) {
      formData.append("support_letter_file", data.support_letter_file);
    }

    try {
      const response = await fetch("/api/students/applications/internship", {
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-indigo-900/95 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* Mobile: Slide up from bottom, Desktop: Center modal */}
      <div className="bg-white w-full h-[95vh] rounded-t-[2.5rem] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300 overflow-hidden">

        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#193CB8] to-[#2563eb] text-white px-4 sm:px-6 py-4 sm:py-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {internshipTitle}
                </h2>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold transition-all ${currentStep >= 1 ? 'bg-white text-[#193CB8]' : 'bg-white/30 text-white/60'
                    }`}>
                    {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'
                    }`}></div>
                  <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold transition-all ${currentStep >= 2 ? 'bg-white text-[#193CB8]' : 'bg-white/30 text-white/60'
                    }`}>
                    2
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors ml-2"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-white/80 mt-2">
                {currentStep === 1 ? '📄 Upload Documents' : '👀 Review & Submit'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-gray-50">
          {/* Error Messages */}
          {profileError && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Could not load profile</p>
                <p className="text-xs">{profileError}</p>
              </div>
            </div>
          )}

          {submissionError && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Submission Error</p>
                <p className="text-xs">{submissionError}</p>
              </div>
            </div>
          )}

          {/* Step 1: Upload Documents */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <Form {...form}>
                <form className="space-y-4">
                  {/* Cover Letter Upload Card */}
                  <FormField
                    control={form.control}
                    name="cover_letter_file"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                            <FormLabel className="text-base font-semibold text-gray-900 mb-0">
                              Cover Letter <span className="text-red-500">*</span>
                            </FormLabel>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">PDF format, maximum 2MB</p>
                          <FormControl>
                            <FileUploadButton
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage className="mt-2 text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Support Letter Upload Card */}
                  <FormField
                    control={form.control}
                    name="support_letter_file"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <FormLabel className="text-base font-semibold text-gray-900 mb-0">
                              Support Letter <span className="text-gray-400 text-sm">(Optional)</span>
                            </FormLabel>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">PDF format, maximum 2MB</p>
                          <FormControl>
                            <FileUploadButton
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage className="mt-2 text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Info Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Lightbulb size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">
                        Tip: Make your application stand out
                      </p>
                      <p className="text-xs text-blue-700">
                        Ensure your cover letter clearly states your motivation and relevant experience for this position.
                      </p>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 2 && profile && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <ApplicationPreview
                profileData={profile}
                applicationData={getValues()}
              />
            </div>
          )}
        </div>

        {/* Footer - Sticky on mobile */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <Button
                variant="secondary"
                onClick={handleBackToForm}
                className="flex-1 sm:flex-initial h-12 sm:h-10 rounded-xl font-semibold"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span className="hidden sm:inline">Back to Edit</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                onClick={handleNextToPreview}
                disabled={isLoadingProfile || !!profileError}
                className="flex-1 h-12 sm:h-11 bg-gradient-to-r from-[#193CB8] to-[#2563eb] hover:from-[#1534a3] hover:to-[#1d4ed8] rounded-xl font-semibold shadow-lg shadow-blue-500/30 group"
              >
                {isLoadingProfile ? (
                  <>
                    <Spinner className="mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <span>Preview Application</span>
                    <ArrowRight
                      size={18}
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
                className="flex-1 h-12 sm:h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold shadow-lg shadow-green-500/30"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} className="mr-2" />
                    <span className="hidden sm:inline">Confirm & Submit Application</span>
                    <span className="sm:hidden">Submit Application</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};