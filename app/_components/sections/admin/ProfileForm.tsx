import { FileUpload } from "@/app/_components/ui/FileUpload";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Textarea } from "@/app/_components/ui/Textarea";

// A reusable component for each card-like section of the form
const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

// A reusable component for each form field
const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export const ProfileForm = () => {
  return (
    <form className="space-y-8">
      <FormSection title="Company Logo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-4xl font-bold">
              TC
            </div>
          </div>
          <div className="md:col-span-2">
            <FormField label="Upload New Logo">
              <FileUpload />
            </FormField>
            <ul className="mt-4 text-xs text-gray-500 list-disc list-inside space-y-1">
              <li>Recommended size: 400x400 pixels</li>
              <li>Square format works best</li>
              <li>Will be displayed in various sizes across the platform</li>
            </ul>
          </div>
        </div>
      </FormSection>

      <FormSection title="Company Information">
        <FormField label="Company Name *">
          <Input type="text" placeholder="Enter your company name" />
        </FormField>
        <FormField label="Industry *">
          <Select>
            <option>Select your industry</option>
            <option>Technology</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Education</option>
          </Select>
        </FormField>
        <FormField label="Company Description">
          <Textarea placeholder="Tell us about your company..." rows={5} />
        </FormField>
      </FormSection>
    </form>
  );
};
