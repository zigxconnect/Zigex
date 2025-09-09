"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// THE FIX IS HERE: Import the new, specific schema and type
import {
  editCompanySchema,
  EditCompanyFormData,
} from "@/lib/validation/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/uiComponenet/Spinner";

interface EditFormProps {
  initialData: Partial<EditCompanyFormData & { email?: string }>;
}

export const EditCompanyProfileForm = ({ initialData }: EditFormProps) => {
  const router = useRouter();

  // THE SECOND FIX IS HERE:
  // The form now uses our new, perfectly scoped `editCompanySchema` for validation.
  const form = useForm<EditCompanyFormData>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: initialData || {},
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: EditCompanyFormData) => {
    try {
      const response = await fetch("/api/companies/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Section 1: Company Details --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Company Details
          </h3>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your official company name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Finance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Tell us about your company..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- Section 2: Contact Information --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Email Address (Cannot be changed)</Label>
              <Input
                value={initialData.email || ""}
                disabled
                className="mt-1.5 bg-slate-50 cursor-not-allowed"
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Business St, City, Country"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.yourcompany.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- Section 3: Branding --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Branding</h3>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://.../logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://.../cover.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="orange" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" /> Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
