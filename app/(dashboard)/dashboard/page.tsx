import { redirect } from "next/navigation";

import { InternshipCard } from "@/app/_components/sections/dashboard/InternshipCard";
import { WelcomeCard } from "@/app/_components/sections/dashboard/WelcomeCard";
import { Sparkles } from "lucide-react";
import { createServerActionClient } from "@/lib/supabase/server";
import { DashboardSearch } from "@/app/_components/sections/dashboard/InternshipSearch";

// Mock data for recommendations can remain for now
const recommendedInternships = [
  {
    title: "Frontend Developer Intern",
    company: "Vercel",
    location: "Remote",
    type: "Full-time",
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    title: "UX/UI Design Intern",
    company: "Figma",
    location: "San Francisco",
    type: "Part-time",
    skills: ["UI Design", "Prototyping"],
  },
];

/**
 * The main dashboard page, now an async Server Component that securely fetches user data directly.
 */
export default async function DashboardPage() {
  const supabase = createServerActionClient();

  // 1. Get the current user's session securely.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // This is a safeguard, as the middleware should already handle this.
    redirect("/sign-in");
  }

  // 2. Fetch the user's complete profile from the database.
  // This request is made directly from the server to the database.
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id) // Query by the foreign key `user_id`
    .single();

  if (!profile) {
    // If the profile doesn't exist, ensure they complete it.
    redirect("/create-profile");
  }

  // 3. Prepare the real, fetched data to be passed to the WelcomeCard.
  const userData = {
    name: profile.full_name || "New User",
    avatarUrl: profile.avatar_url,
    initials:
      `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase() || "FU",
    university: profile.university || "University not specified",
    skills: profile.hard_skills || [],
    coverImageUrl: "/placeholder-cover.jpg", // This can be a future field in your DB
  };

  return (
    <div className="md:p-6 lg:p-8 space-y-8">
      {/* Pass the real, fetched user data to the WelcomeCard */}
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
          {recommendedInternships.map((internship, index) => (
            <InternshipCard key={index} {...internship} />
          ))}
        </div>
      </div>
    </div>
  );
}
