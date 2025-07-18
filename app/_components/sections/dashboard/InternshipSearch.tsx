import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { Search, MapPin, Briefcase, Sparkles } from "lucide-react";

export const InternshipSearch = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          placeholder="Search internships, companies, or skills..."
          className="pl-10"
        />
      </div>
      {/* Placeholder for custom dropdowns */}
      <Button variant="secondary" className="justify-start gap-2">
        <MapPin size={16} /> Location
      </Button>
      <Button variant="secondary" className="justify-start gap-2">
        <Briefcase size={16} /> Industry
      </Button>
      <Button variant="secondary" className="justify-start gap-2">
        <Sparkles size={16} /> Skills
      </Button>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="paid-only"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="paid-only"
          className="text-sm font-medium text-gray-700"
        >
          Paid Only
        </label>
      </div>
      <Button variant="primary" className="hidden">
        Search
      </Button>
    </div>
  );
};
