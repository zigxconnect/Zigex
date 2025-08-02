import { Button } from "@/app/_components/ui/Button";
import Link from "next/link";

// The props now match the fields from your internshipData file.
interface InternshipCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logoColor: string;
}

export const InternshipCard = ({
  id,
  title,
  company,
  location,
  type,
  category,
  logoColor,
}: InternshipCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0"
            style={{ backgroundColor: logoColor }}
          >
            {company.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#EA580C] leading-tight">
              {title}
            </h3>
            <p className="text-sm text-[#64748B]">{company}</p>
          </div>
        </div>
      </div>

      <div className="my-4 text-sm text-[#64748B]">
        <span>{location}</span> · <span>{type}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 text-xs text-orange-800 bg-orange-100 rounded-full font-medium">
          {category}
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <Link href={`/internships/${id}`}>
          <Button variant="secondary-outline" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};
