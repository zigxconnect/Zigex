// File Path: /app/_components/sections/create-profile/Step2Education.tsx
import { Input } from "@/app/_components/ui/Input";

type StepProps = { updateFormData: (data: object) => void };

export const Step2Education = ({ updateFormData }: StepProps) => (
  <div className="space-y-6">
    <div>
      <label className="text-sm font-medium">University</label>
      <Input
        type="text"
        placeholder="Enter your university name"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Degree</label>
      <Input type="text" placeholder="Enter your degree" className="mt-1" />
    </div>
    <div>
      <label className="text-sm font-medium">Field of Study</label>
      <Input
        type="text"
        placeholder="Enter your field of study"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Graduation Year</label>
      <Input
        type="text"
        placeholder="Enter your graduation year"
        className="mt-1"
      />
    </div>
  </div>
);
