import { Button } from "@/app/_components/ui/Button";
import Link from "next/link";
import Image from "next/image"; // NEW: Import the Next.js Image component

// Add 'headQuarterImage' to the props
interface InternshipCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logoColor: string;
  headQuarterImage: string; // NEW PROP
}

export const InternshipCard = ({
  id,
  title,
  company,
  location,
  type,
  category,
  logoColor,
  headQuarterImage,
}: InternshipCardProps) => {
  return (
    // We've added `overflow-hidden` to contain the image corners and `group` for hover effects
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* --- NEW: Image Section --- */}
      <div className="relative h-40 w-full">
        <Image
          src={headQuarterImage}
          alt={`Headquarters of ${company}`}
          fill // This makes the image fill the container
          className="object-cover transition-transform duration-300 group-hover:scale-105" // Cover the area and zoom slightly on hover
        />
      </div>

      {/* --- The rest of the card content is now wrapped in a div with padding --- */}
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
    </div>
  );
};
