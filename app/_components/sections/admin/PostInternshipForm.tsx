import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Textarea } from "@/app/_components/ui/Textarea";

// Reusable helper components to keep the code clean
const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {children}
    </div>
  </div>
);

const FormField = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export const PostInternshipForm = () => {
  return (
    <form className="space-y-8">
      <FormSection title="Internship Details">
        <FormField label="Internship Title" className="md:col-span-2">
          <Input type="text" placeholder="e.g., Frontend Developer Intern" />
        </FormField>
        <FormField label="Internship Type">
          <Select>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </Select>
        </FormField>
        <FormField label="Location">
          <Input type="text" placeholder="e.g., Bamenda, Cameroon" />
        </FormField>
        <FormField label="Salary/Stipend (Optional)">
          <Input type="text" placeholder="e.g., $800/month or Unpaid" />
        </FormField>
        <FormField label="Application Deadline">
          <Input type="date" />
        </FormField>
      </FormSection>

      <FormSection title="Description and Requirements">
        <FormField label="Job Description" className="md:col-span-2">
          <Textarea
            placeholder="Provide a detailed description of the role, responsibilities, and what a typical day looks like."
            rows={8}
          />
        </FormField>
        <FormField label="Skills & Requirements" className="md:col-span-2">
          <Textarea
            placeholder="List the required skills, qualifications, and any preferred experience (e.g., React, Figma, Financial Analysis)."
            rows={5}
          />
        </FormField>
      </FormSection>
    </form>
  );
};
