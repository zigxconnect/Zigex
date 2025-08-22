// InternshipBody.tsx
import { ListItem } from "@/components/uiComponenet/ListItem";
import { MapPin } from "lucide-react";

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
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EA580C] leading-tight">
        {internship.title}
      </h1>

      {/* Cover Image */}
      <div
        className="mt-6 h-40 sm:h-48 lg:h-56 bg-gray-200 rounded-xl bg-cover bg-center shadow-inner transition-transform duration-300 hover:scale-[1.02]"
        style={{ backgroundImage: `url(${internship.officeImage})` }}
        role="img"
        aria-label="Office building"
      />

      {/* Company Info */}
      <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-xl">
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-md transition-transform duration-300 hover:scale-105"
          style={{ backgroundColor: "#193CB8" }}
        >
          {internship.companyInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {internship.company}
          </h2>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="mt-6 sm:mt-8 prose prose-slate max-w-none">
        <div className="space-y-6 sm:space-y-8">
          {/* Job Description */}
          <section>
            <h3 className="text-lg sm:text-xl font-bold text-[#193CB8] mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#EA580C] rounded-full"></div>
              Job Description
            </h3>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border-l-4 border-[#EA580C]">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {internship.jobDescription}
              </p>
            </div>
          </section>

          {/* Responsibilities */}
          <section>
            <h3 className="text-lg sm:text-xl font-bold text-[#193CB8] mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#EA580C] rounded-full"></div>
              Responsibilities
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <ul className="space-y-3">
                {internship.responsibilities.map((item, i) => (
                  <li
                    key={i}
                    className="transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <ListItem>{item}</ListItem>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Required Skills */}
          <section>
            <h3 className="text-lg sm:text-xl font-bold text-[#193CB8] mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#EA580C] rounded-full"></div>
              Required Skills
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <ul className="space-y-3">
                {internship.requiredSkills.map((item, i) => (
                  <li
                    key={i}
                    className="transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <ListItem>{item}</ListItem>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
