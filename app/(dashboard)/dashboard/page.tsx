import { redirect } from "next/navigation";
import { allInternships } from "@/lib/data/internshipData";
import { Sparkles } from "lucide-react";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { DashboardSearch } from "@/components/sections/dashboard/InternshipSearch";
import { InternshipCard } from "@/components/sections/dashboard/InternshipCard";

/**
 * The main dashboard page, now refactored to use a Server Action
 * to fetch all necessary user data.
 */
export default async function DashboardPage() {
  const userData = await getProfileInfo();

  if (!userData) {
    redirect("/sign-in");
  }

  const internships = allInternships;

  return (
    <div className="md:p-6 lg:p-8 space-y-8">
      <WelcomeCard user={userData} />

      <DashboardSearch />

      <div>
        <div className="flex items-center gap-2 mb-4 px-6 md:px-0">
          <Sparkles className="text-[#EA580C]" size={20} />
          <h2 className="text-xl font-bold text-[#EA580C]">
            Recommended For You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-0">
          {internships.slice(0, 9).map((internship) => (
            <InternshipCard
              key={internship.id}
              id={internship.id}
              headQuarterImage={internship.headQuarterImage}
              title={internship.title}
              company={internship.company}
              location={internship.location}
              type={internship.type}
              category={internship.category}
              logoColor={internship.logoColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
