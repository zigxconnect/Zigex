import { ListItem } from "@/app/_components/ui/ListItem";
import { MapPin } from "lucide-react";

export const InternshipBody = ({ internship }: { internship: any }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h1 className="text-4xl font-bold text-gray-900">{internship.title}</h1>
      <div className="mt-6 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold text-2xl">
        {internship.office}
      </div>
      <div className="mt-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
          {internship.companyInitial}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {internship.company}
          </h2>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin size={14} />
            {internship.location}
          </div>
        </div>
      </div>
      <div className="mt-8 prose max-w-none">
        <h3>Job Description</h3>
        <p>{internship.jobDescription}</p>

        <h3>Responsibilities</h3>
        <ul className="space-y-3">
          {internship.responsibilities.map((item: string, i: number) => (
            <ListItem key={i}>{item}</ListItem>
          ))}
        </ul>

        <h3>Required Skills</h3>
        <ul className="space-y-3">
          {internship.requiredSkills.map((item: string, i: number) => (
            <ListItem key={i}>{item}</ListItem>
          ))}
        </ul>
      </div>
    </div>
  );
};
