import { ListItem } from "@/app/_components/ui/ListItem";
import { MapPin } from "lucide-react";

// This is the shape of the data this component now expects
interface TransformedInternship {
  title: string;
  officeImage: string;
  companyInitial: string;
  company: string;
  location: string;
  jobDescription: string;
  responsibilities: string[];
  requiredSkills: string[];
}

export const InternshipBody = ({
  internship,
}: {
  internship: TransformedInternship;
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-3xl md:text-4xl font-bold text-[#EA580C]">
        {internship.title}
      </h1>

      {/* Cover Image */}
      <div
        className="mt-6 h-48 bg-gray-200 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${internship.officeImage})` }}
      />

      {/* Company Info */}
      <div className="mt-8 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: "#193CB8" }}
        >
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

      {/* Text Content */}
      <div className="mt-8 prose prose-slate max-w-none">
        <h3>Job Description</h3>
        <p>{internship.jobDescription}</p>

        <h3>Responsibilities</h3>
        <ul className="space-y-2">
          {internship.responsibilities.map((item, i) => (
            <ListItem key={i}>{item}</ListItem>
          ))}
        </ul>

        <h3>Required Skills</h3>
        <ul className="space-y-2">
          {internship.requiredSkills.map((item, i) => (
            <ListItem key={i}>{item}</ListItem>
          ))}
        </ul>
      </div>
    </div>
  );
};
