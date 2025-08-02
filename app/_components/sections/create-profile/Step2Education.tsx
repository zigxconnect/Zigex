import { Input } from "@/app/_components/ui/Input";
import { ProfileFormData } from "@/app/types/profile";

type StepProps = {
  data: Partial<ProfileFormData>;
  onUpdate: (update: Partial<ProfileFormData>) => void;
};

export const Step2Education = ({ data, onUpdate }: StepProps) => (
  <div className="space-y-6">
    <div>
      <label className="text-sm font-medium">University</label>
      <Input
        name="university"
        type="text"
        value={data.university || ""}
        onChange={(e) => onUpdate({ university: e.target.value })}
        placeholder="Enter your university name"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Degree</label>
      <Input
        name="degree"
        type="text"
        value={data.degree || ""}
        onChange={(e) => onUpdate({ degree: e.target.value })}
        placeholder="e.g., Bachelor of Science"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Field of Study</label>
      <Input
        name="field_of_study"
        type="text"
        value={data.field_of_study || ""}
        onChange={(e) => onUpdate({ field_of_study: e.target.value })}
        placeholder="e.g., Computer Science"
        className="mt-1"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium">Graduation Year</label>
        <Input
          name="graduation_year"
          type="text"
          value={data.graduation_year || ""}
          onChange={(e) => onUpdate({ graduation_year: e.target.value })}
          placeholder="e.g., 2025"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">GPA</label>
        <Input
          name="gpa"
          type="number"
          step="0.1"
          value={data.gpa || ""}
          onChange={(e) => onUpdate({ gpa: parseFloat(e.target.value) })}
          placeholder="e.g., 3.8"
          className="mt-1"
        />
      </div>
    </div>
  </div>
);
