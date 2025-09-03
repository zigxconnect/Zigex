import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface InternshipCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logoColor: string;
  cover_image_url: string;
}

export const InternshipCard = ({
  id,
  title,
  company,
  location,
  type,
  category,
  logoColor,
  cover_image_url,
}: InternshipCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-40 w-full">
        <Image
          src={cover_image_url}
          alt={`Cover image for ${company}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{ backgroundColor: logoColor }}
            >
              {company.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-blue-800">{company}</p>
            </div>
          </div>
        </div>

        <div className="my-4 text-sm text-blue-800">
          <span>{location}</span> · <span>{type}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 text-xs text-orange-800 bg-orange-100 rounded-full font-medium">
            {category}
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link href={`/internships/${id}`}>
            <Button
              variant="secondary-outline"
              className="w-full bg-blue-800 hover:bg-blue-700 text-white"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
