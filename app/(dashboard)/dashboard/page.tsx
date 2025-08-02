import { redirect } from "next/navigation";
import { createServerActionClient } from "@/lib/supabase/server";
import { allInternships } from "@/lib/data/internshipData"; // NEW: Import your real internship data
import { WelcomeCard } from "@/app/_components/sections/dashboard/WelcomeCard";
import { DashboardSearch } from "@/app/_components/sections/dashboard/InternshipSearch";
import { InternshipCard } from "@/app/_components/sections/dashboard/InternshipCard";
import { Sparkles } from "lucide-react";

/**
 * The main dashboard page, now an async Server Component that fetches both
 * user data and the list of available internships.
 */
export default async function DashboardPage() {
  const supabase = createServerActionClient();

  // --- 1. Fetch User Data ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/create-profile");
  }

  // Prepare user data for the WelcomeCard
  const userData = {
    name: profile.full_name || "New User",
    avatarUrl: profile.avatar_url,
    initials:
      `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase() || "FU",
    university: profile.university || "University not specified",
    skills: profile.hard_skills || [],
    coverImageUrl: "/placeholder-cover.jpg",
  };

  // --- 2. "Fetch" Internship Data ---
  // In a real app, this would be another `await` call to your database.
  // For now, we are just using the imported data directly.
  const internships = allInternships;

  return (
    <div className="md:p-6 lg:p-8 space-y-8">
      {/* Pass the real, fetched user data */}
      <WelcomeCard user={userData} />

      <DashboardSearch />

      <div>
        <div className="flex items-center gap-2 mb-4 px-6 md:px-0">
          <Sparkles className="text-[#EA580C]" size={20} />
          <h2 className="text-xl font-bold text-[#EA580C]">
            Recommended For You
          </h2>
        </div>

        {/*
          THE FIX IS HERE:
          - We now map over the real `internships` data.
          - We pass all the required props (id, title, company, etc.) to the InternshipCard.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-0">
          {internships.slice(0, 9).map(
            (
              internship // Show the first 9 as an example
            ) => (
              <InternshipCard
                key={internship.id}
                id={internship.id}
                title={internship.title}
                company={internship.company}
                location={internship.location}
                type={internship.type}
                category={internship.category}
                logoColor={internship.logoColor}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
