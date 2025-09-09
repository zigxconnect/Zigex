import { ListItem } from "@/components/uiComponenet/ListItem";
import { MapPin } from "lucide-react";

export const InternshipBody = ({ internship }: { internship: any }) => {
  const company = internship.company_profiles;

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EA580C] leading-tight">
        {internship.title}
      </h1>

      <div
        className="mt-6 h-40 sm:h-48 lg:h-56 bg-gray-200 rounded-xl bg-cover bg-center shadow-inner"
        style={{
          backgroundImage: `url(${
            company?.cover_image_url || "/placeholder-cover.jpg"
          })`,
        }}
      />

      <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-xl">
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-md"
          style={{ backgroundColor: "#193CB8" }}
        >
          {company?.company_name?.charAt(0) || "C"}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {company?.company_name}
          </h2>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin size={14} />{" "}
            <span className="truncate">{internship.location}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 prose prose-slate max-w-none">
        <div className="space-y-6 sm:space-y-8">
          <section>
            <h3 className="text-lg sm:text-xl font-bold text-[#193CB8] mb-3">
              Job Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {internship.description}
            </p>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-bold text-[#193CB8] mb-3">
              Required Skills
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <ul className="space-y-3">
                {internship.required_skills?.map((item: string, i: number) => (
                  <li key={i}>
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
