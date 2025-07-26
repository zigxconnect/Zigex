// File Path: /app/_components/sections/create-profile/Step1Personal.tsx
import { Input } from "@/app/_components/ui/Input";

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
  />
);

type StepProps = { updateFormData: (data: object) => void };

export const Step1Personal = ({ updateFormData }: StepProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium">First Name</label>
        <Input
          type="text"
          placeholder="Enter your first name"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Last Name</label>
        <Input
          type="text"
          placeholder="Enter your last name"
          className="mt-1"
        />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">Email</label>
      <Input type="email" placeholder="Enter your email" className="mt-1" />
    </div>
    <div>
      <label className="text-sm font-medium">Phone</label>
      <Input
        type="tel"
        placeholder="Enter your phone number"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Location</label>
      <Input type="text" placeholder="Enter your location" className="mt-1" />
    </div>
    <div>
      <label className="text-sm font-medium">About Me</label>
      <Textarea
        placeholder="A brief introduction about yourself"
        rows={4}
        className="mt-1"
      />
    </div>
  </div>
);
