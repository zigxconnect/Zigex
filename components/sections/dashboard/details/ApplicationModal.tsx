"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X } from "lucide-react";
import { FileUploadButton } from "@/components/ui/FileUploadButton";
import { Spinner } from "@/components/uiComponenet/Spinner";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const applicationSchema = z.object({
  cover_letter: z
    .string()
    .min(20, { message: "Cover letter must be at least 20 characters." }),
  cv_file: z
    .instanceof(File, { message: "A resume file is required." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf files are accepted."
    ),
  linkedin_url: z
    .string()
    .url({ message: "Please provide a valid LinkedIn profile URL." }),
  answers: z.string().optional(),
});
type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationModalProps {
  internshipTitle: string;
  onClose: () => void;
}

export const ApplicationModal = ({
  internshipTitle,
  onClose,
}: ApplicationModalProps) => {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { cover_letter: "", linkedin_url: "", answers: "" },
  });
  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: ApplicationFormData) => {
    console.log("Submitting Application Data:", {
      ...data,
      cv_file: {
        name: data.cv_file.name,
        size: data.cv_file.size,
        type: data.cv_file.type,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(`Application for ${internshipTitle} submitted successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#193CB8]">
              Apply for Internship
            </h2>
            <p className="text-sm text-gray-600">{internshipTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cover_letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you're a great fit for this role..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cv_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV / Resume</FormLabel>
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
                name="answers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other information you'd like to share?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-6 border-t border-gray-200 flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2" /> Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
