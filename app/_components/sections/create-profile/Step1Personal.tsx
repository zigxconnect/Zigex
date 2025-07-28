import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { ProfileFormData } from "@/app/types/profile";

type StepProps = {
  data: Partial<ProfileFormData>;
  onUpdate: (update: Partial<ProfileFormData>) => void;
};

export const Step1Personal = ({ data, onUpdate }: StepProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium">First Name</label>
        <Input
          name="first_name"
          type="text"
          value={data.first_name || ""}
          onChange={(e) => onUpdate({ first_name: e.target.value })}
          placeholder="Enter your first name"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Last Name</label>
        <Input
          name="last_name"
          type="text"
          value={data.last_name || ""}
          onChange={(e) => onUpdate({ last_name: e.target.value })}
          placeholder="Enter your last name"
          className="mt-1"
        />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">Phone Number</label>
      <Input
        name="phone"
        type="tel"
        value={data.phone || ""}
        onChange={(e) => onUpdate({ phone: e.target.value })}
        placeholder="e.g., +123 456 7890"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Location</label>
      <Input
        name="location"
        type="text"
        value={data.location || ""}
        onChange={(e) => onUpdate({ location: e.target.value })}
        placeholder="e.g., Bamenda, Cameroon"
        className="mt-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">About Me</label>
      <Textarea
        name="about"
        value={data.about || ""}
        onChange={(e) => onUpdate({ about: e.target.value })}
        placeholder="A brief introduction about yourself"
        rows={4}
        className="mt-1"
      />
    </div>
  </div>
);
